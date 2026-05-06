import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generate } from '@/lib/ai-provider'
import { generateEmbedding } from '@/lib/embeddings'
import { checkRateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

function normalize(input: string): string {
  return input.toLowerCase().replace(/\s+/g, ' ').trim()
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

  // Rate limit check
  const rateLimit = await checkRateLimit(user.id)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'rate_limit', remaining: 0, reset_at: rateLimit.resetAt },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': rateLimit.resetAt } }
    )
  }

  const { data: providerConfig, error: configError } = await supabase
    .from('provider_keys')
    .select('id, provider, model, vault_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (configError || !providerConfig) {
    return NextResponse.json(
      { error: 'No hay ningún proveedor de AI configurado. Configurá una API key en Ajustes.' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  const { data: secret, error: vaultError } = await admin
    .schema('vault')
    .from('decrypted_secrets')
    .select('decrypted_secret')
    .eq('id', providerConfig.vault_id)
    .maybeSingle()

  if (vaultError || !secret?.decrypted_secret) {
    return NextResponse.json(
      { error: 'Error al leer la API key. Intentá configurarla de nuevo en Ajustes.' },
      { status: 500 }
    )
  }

  // Cache pipeline: normalize → embedding → similarity search
  let fromCache = false
  const normalized = normalize(input)

  try {
    const embedding = await generateEmbedding(normalized, secret.decrypted_secret)

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
            provider: hit.provider as Parameters<typeof generate>[0]['provider'],
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
  } catch {
    // Si falla el embedding, seguir sin caché
  }

  try {
    const result = await generate({
      provider: providerConfig.provider,
      apiKey: secret.decrypted_secret,
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
