import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateFixWithFallback, selectModel, type ProviderConfig } from '@/lib/ai-provider'
import { checkRateLimit, FREE_LIMIT, PRO_LIMIT } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import type { Plan } from '@/types'

async function getProviderConfig(userId: string): Promise<{
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

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('selected_model')
    .eq('user_id', userId)
    .maybeSingle()

  const plan: Plan = 'starter'
  const { provider, model } = selectModel(plan, prefs?.selected_model)
  const apiKey = provider === 'zen'
    ? process.env.ZEN_API_KEY
    : process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('free_tier_unavailable')

  return { plan, provider, apiKey, model, dailyLimit: FREE_LIMIT }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json() as { git_status: string; problem_desc: string; lang?: 'es' | 'en' }
  const { git_status, problem_desc, lang } = body

  if (!git_status?.trim() || !problem_desc?.trim()) {
    return NextResponse.json(
      { error: 'Faltan campos: git_status y problem_desc son requeridos' },
      { status: 400 }
    )
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
    return NextResponse.json(
      { error: 'rate_limit', remaining: 0, reset_at: rateLimit.resetAt },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': rateLimit.resetAt } }
    )
  }

  try {
    const primaryConfig: ProviderConfig = {
      provider: providerConfig.provider as ProviderConfig['provider'],
      apiKey: providerConfig.apiKey,
      model: providerConfig.model,
      lang: lang ?? 'es',
    }

    const configs: ProviderConfig[] = [primaryConfig]
    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (openrouterKey && providerConfig.provider !== 'openrouter') {
      configs.push({
        provider: 'openrouter',
        apiKey: openrouterKey,
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        lang: lang ?? 'es',
      })
    }

    const result = await generateFixWithFallback(configs, git_status, problem_desc, user.id)

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al analizar el estado de Git'
    if (message === 'not_git') {
      return NextResponse.json({ error: 'not_git' }, { status: 400 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
