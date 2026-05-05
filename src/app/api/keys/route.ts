import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET /api/keys — qué proveedores tiene configurados el usuario (sin exponer las keys)
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('provider_keys')
    .select('id, provider, model, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ providers: data ?? [] })
}

// POST /api/keys — guardar o actualizar key de un proveedor (cifrada en Vault)
export async function POST(request: Request) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json() as { provider: string; model: string; apiKey: string }
  const { provider, model, apiKey } = body

  if (!provider || !model || !apiKey) {
    return NextResponse.json({ error: 'Faltan campos: provider, model, apiKey' }, { status: 400 })
  }
  if (!['anthropic', 'openai', 'gemini'].includes(provider)) {
    return NextResponse.json({ error: 'Proveedor no soportado' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('provider_keys')
    .select('id, vault_id')
    .eq('user_id', user.id)
    .eq('provider', provider)
    .maybeSingle()

  try {
    if (existing?.vault_id) {
      const { error: updateError } = await admin.rpc('update_secret', {
        secret_id: existing.vault_id,
        new_secret: apiKey,
      })
      if (updateError) throw updateError

      const { error: updateRowError } = await supabase
        .from('provider_keys')
        .update({ model })
        .eq('id', existing.id)
      if (updateRowError) throw updateRowError
    } else {
      const { data: newSecret, error: createError } = await admin.rpc('create_secret', {
        new_secret: apiKey,
      })
      if (createError) throw createError
      const secretId = (newSecret as unknown as { id: string })?.id
      if (!secretId) throw new Error('No se pudo crear el secreto en Vault')

      const { error: insertError } = await supabase
        .from('provider_keys')
        .insert({ user_id: user.id, provider, model, vault_id: secretId })
      if (insertError) throw insertError
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al guardar la key'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE /api/keys — eliminar key de un proveedor
export async function DELETE(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')

  if (!provider || !['anthropic', 'openai', 'gemini'].includes(provider)) {
    return NextResponse.json({ error: 'provider inválido' }, { status: 400 })
  }

  const { data: row } = await supabase
    .from('provider_keys')
    .select('id, vault_id')
    .eq('user_id', user.id)
    .eq('provider', provider)
    .maybeSingle()

  if (!row) {
    return NextResponse.json({ error: 'No hay key para este proveedor' }, { status: 404 })
  }

  const { error: deleteError } = await supabase
    .from('provider_keys')
    .delete()
    .eq('id', row.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
