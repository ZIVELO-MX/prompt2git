import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generate } from '@/lib/ai-provider'
import { generateEmbedding } from '@/lib/embeddings'
import { checkRateLimit, FREE_LIMIT, PRO_LIMIT } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

function normalize(input: string): string {
  return input.toLowerCase().replace(/\s+/g, ' ').trim()
}

async function getProviderConfig(userId: string): Promise<{
  plan: 'free' | 'pro'
  provider: string
  apiKey: string
  model: string
  dailyLimit: number
}> {
  const supabase = await createClient()

  const { data: providerConfig } = await supabase
    .from('provider_keys')
    .select('id, provider, model, vault_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (providerConfig) {
    const admin = createAdminClient()
    const { data: secret } = await admin
      .schema('vault')
      .from('decrypted_secrets')
      .select('decrypted_secret')
      .eq('id', providerConfig.vault_id)
      .maybeSingle()

    if (secret?.decrypted_secret) {
      return {
        plan: 'pro',
        provider: providerConfig.provider,
        apiKey: secret.decrypted_secret,
        model: providerConfig.model,
        dailyLimit: PRO_LIMIT,
      }
    }
  }

  const platformKey = process.env.OPENROUTER_API_KEY
  if (!platformKey) {
    throw new Error('free_tier_unavailable')
  }

  return {
    plan: 'free',
    provider: 'openrouter',
    apiKey: platformKey,
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    dailyLimit: FREE_LIMIT,
  }
}

async function getEmbeddingKey(userId: string): Promise<string | undefined> {
  const supabase = await createClient()
  const { data: providerConfig } = await supabase
    .from('provider_keys')
    .select('vault_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!providerConfig?.vault_id) return undefined

  const admin = createAdminClient()
  const { data: secret } = await admin
      .schema('vault')
      .from('decrypted_secrets')
      .select('decrypted_secret')
      .eq('id', providerConfig.vault_id)
      .maybeSingle()

  return secret?.decrypted_secret
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json() as {
    input: string
    lang?: 'es' | 'en'
    repoContext?: { branch: string; last_commit: string }
  }
  const { input, lang, repoContext } = body
  if (!input?.trim()) {
    return NextResponse.json({ error: 'input es requerido' }, { status: 400 })
  }
  if (input.length > 280) {
    return NextResponse.json({ error: 'Máximo 280 caracteres' }, { status: 400 })
  }

  let providerConfig: Awaited<ReturnType<typeof getProviderConfig>>
  try {
    providerConfig = await getProviderConfig(user.id)
  } catch {
    return NextResponse.json(
      { error: 'No hay proveedor configurado y el plan free no está disponible.' },
      { status: 503 }
    )
  }

  const rateLimit = await checkRateLimit(user.id, providerConfig.dailyLimit)
  if (!rateLimit.allowed) {
    const planKey = providerConfig.plan === 'free' ? 'rate_limit_free' : 'rate_limit_pro'
    return NextResponse.json(
      { error: planKey, remaining: 0, reset_at: rateLimit.resetAt },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': rateLimit.resetAt } }
    )
  }

  let fromCache = false
  const normalized = normalize(input)

  try {
    const embeddingKey = await getEmbeddingKey(user.id)
    if (embeddingKey) {
      const embedding = await generateEmbedding(normalized, embeddingKey)

      if (embedding.length > 0) {
        const { data: cached } = await supabase.rpc('match_commands', {
          query_embedding: embedding,
          match_threshold: 0.92,
          match_count: 1,
          query_user_id: user.id,
        })

        if (cached && cached.length > 0) {
          const hit = cached[0] as {
            id: string
            input: string
            command: string
            explanation: unknown
            flags: unknown
            provider: string
            model: string
            created_at: string
          }

          fromCache = true

          return NextResponse.json({
            command: {
              id: hit.id,
              user_id: user.id,
              input: input.trim(),
              command: hit.command,
              explanation: hit.explanation,
              flags: hit.flags,
              provider: hit.provider,
              model: hit.model,
              created_at: hit.created_at,
              from_cache: true,
            },
          }, {
            headers: {
              'X-RateLimit-Remaining': String(rateLimit.remaining),
              'X-RateLimit-Reset': rateLimit.resetAt,
            },
          })
        }
      }
    }
  } catch {
    // Si falla el embedding, seguir sin caché
  }

  try {
    const result = await generate({
      provider: providerConfig.provider as Parameters<typeof generate>[0]['provider'],
      apiKey: providerConfig.apiKey,
      model: providerConfig.model,
      lang: lang ?? 'es',
      repoContext,
    }, input)

    const commandId = crypto.randomUUID()
    const now = new Date().toISOString()

    const commandToInsert: Record<string, unknown> = {
      id: commandId,
      user_id: user.id,
      input: input.trim(),
      command: result.command,
      explanation: JSON.stringify(result.explanation),
      flags: JSON.stringify(result.flags),
      provider: providerConfig.provider,
      model: providerConfig.model,
      created_at: now,
    }

    const { error: insertError } = await supabase
      .from('commands')
      .insert(commandToInsert)

    if (insertError) {
      console.error('Error al guardar comando en historial:', insertError.message)
    }

    return NextResponse.json({
      command: {
        id: commandId,
        user_id: user.id,
        input: input.trim(),
        command: result.command,
        explanation: result.explanation,
        flags: result.flags,
        provider: providerConfig.provider,
        model: providerConfig.model,
        created_at: now,
        from_cache: false,
      },
    }, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
        'X-RateLimit-Reset': rateLimit.resetAt,
      },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al generar comando'
    if (message === 'not_git') {
      return NextResponse.json({ error: 'not_git' }, { status: 400 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
