import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generate } from '@/lib/ai-provider'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { input } = await request.json() as { input: string }
  if (!input?.trim()) {
    return NextResponse.json({ error: 'input es requerido' }, { status: 400 })
  }
  if (input.length > 280) {
    return NextResponse.json({ error: 'Máximo 280 caracteres' }, { status: 400 })
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
    const result = await generate({
      provider: providerConfig.provider,
      apiKey: secret.decrypted_secret,
      model: providerConfig.model,
    }, input)

    const commandId = crypto.randomUUID()
    const now = new Date().toISOString()

    const commandToInsert = {
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
