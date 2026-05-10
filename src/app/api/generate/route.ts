import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateWithFallback, selectModel, type ProviderConfig } from '@/lib/ai-provider'
import { generateEmbedding } from '@/lib/embeddings'
import { checkRateLimit, FREE_LIMIT, PRO_LIMIT } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import type { Plan } from '@/types'

function normalize(input: string): string {
  return input.toLowerCase().replace(/\s+/g, ' ').trim()
}

async function getProviderConfig(userId: string, selectedModelOverride?: string): Promise<{
  plan: Plan
  provider: string
  apiKey: string
  model: string
  dailyLimit: number
}> {
  const supabase = await createClient()

  const { data: byok } = await supabase
    .from('provider_keys')
    .select('id, provider, model, vault_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (byok) {
    const admin = createAdminClient()
    const { data: secret } = await admin
      .schema('vault')
      .from('decrypted_secrets')
      .select('decrypted_secret')
      .eq('id', byok.vault_id)
      .maybeSingle()

    if (secret?.decrypted_secret) {
      return {
        plan: 'pro',
        provider: byok.provider,
        apiKey: secret.decrypted_secret,
        model: byok.model,
        dailyLimit: PRO_LIMIT,
      }
    }
  }

  // Platform key path — read preferences + admin role
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('selected_model, role')
    .eq('user_id', userId)
    .maybeSingle()

  const isAdmin = prefs?.role === 'admin'
  const modelKey = selectedModelOverride ?? prefs?.selected_model ?? null
  const plan: Plan = isAdmin ? 'pro' : 'starter'
  const { provider, model } = selectModel(plan, modelKey)
  const apiKey = provider === 'zen'
    ? process.env.ZEN_API_KEY
    : process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('free_tier_unavailable')

  return { plan, provider, apiKey, model, dailyLimit: isAdmin ? PRO_LIMIT : FREE_LIMIT }
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
    selectedModel?: string
    repoContext?: { branch: string; last_commit: string }
  }
  const { input, lang, selectedModel: bodySelectedModel, repoContext } = body
  if (!input?.trim()) {
    return NextResponse.json({ error: 'input es requerido' }, { status: 400 })
  }
  if (input.length > 280) {
    return NextResponse.json({ error: 'Máximo 280 caracteres' }, { status: 400 })
  }

  let providerConfig: Awaited<ReturnType<typeof getProviderConfig>>
  try {
    providerConfig = await getProviderConfig(user.id, bodySelectedModel)
  } catch {
    return NextResponse.json(
      { error: 'No hay proveedor configurado y el plan free no está disponible.' },
      { status: 503 }
    )
  }

  const rateLimit = await checkRateLimit(user.id, providerConfig.dailyLimit)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'rate_limit', remaining: 0, reset_at: rateLimit.resetAt },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': rateLimit.resetAt } }
    )
  }

  let fromCache = false
  const normalized = normalize(input)
  let commandEmbedding: number[] | null = null

  try {
    const embeddingKey = await getEmbeddingKey(user.id)
    if (embeddingKey) {
      commandEmbedding = await generateEmbedding(normalized, embeddingKey)
      const embedding = commandEmbedding

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
    const primaryConfig: ProviderConfig = {
      provider: providerConfig.provider as ProviderConfig['provider'],
      apiKey: providerConfig.apiKey,
      model: providerConfig.model,
      lang: lang ?? 'es',
      repoContext,
    }

    const configs: ProviderConfig[] = [primaryConfig]
    const openrouterKey = process.env.OPENROUTER_API_KEY
    // Fallback a openrouter free si el primario no es openrouter
    if (openrouterKey && providerConfig.provider !== 'openrouter') {
      configs.push({
        provider: 'openrouter',
        apiKey: openrouterKey,
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        lang: lang ?? 'es',
        repoContext,
      })
    }

    const result = await generateWithFallback(configs, input, user.id)

    const commandId = crypto.randomUUID()
    const now = new Date().toISOString()

    const commandToInsert: Record<string, unknown> = {
      id: commandId,
      user_id: user.id,
      input: input.trim(),
      command: result.command,
      explanation: JSON.stringify(result.explanation),
      flags: JSON.stringify(result.flags),
      provider: result.provider,
      model: result.model,
      created_at: now,
      ...(commandEmbedding ? { embedding: commandEmbedding } : {}),
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
        provider: result.provider,
        model: result.model,
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
