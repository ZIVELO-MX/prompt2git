import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateFix } from '@/lib/ai-provider'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json() as { git_status: string; problem_description: string; lang?: 'es' | 'en' }
  const { git_status, problem_description, lang } = body

  if (!git_status?.trim() || !problem_description?.trim()) {
    return NextResponse.json(
      { error: 'Faltan campos: git_status y problem_description son requeridos' },
      { status: 400 }
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

  try {
    const result = await generateFix({
      provider: providerConfig.provider as Parameters<typeof generateFix>[0]['provider'],
      apiKey: secret.decrypted_secret,
      model: providerConfig.model,
      lang: lang ?? 'es',
    }, git_status, problem_description)

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al analizar el estado de Git'
    if (message === 'not_git') {
      return NextResponse.json({ error: 'not_git' }, { status: 400 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
