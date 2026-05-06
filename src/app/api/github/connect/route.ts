import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session?.provider_token) {
    return NextResponse.json(
      { error: 'No hay token de GitHub en la sesión. Iniciá sesión con GitHub.' },
      { status: 400 }
    )
  }

  const token = session.provider_token

  const ghRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!ghRes.ok) {
    return NextResponse.json({ error: 'github_token_invalid' }, { status: 401 })
  }

  const ghUser = (await ghRes.json()) as { login: string }
  const username = ghUser.login

  const admin = createAdminClient()

  const { data: existing } = await supabase
    .from('github_connections')
    .select('id, vault_id')
    .eq('user_id', user.id)
    .maybeSingle()

  try {
    if (existing?.vault_id) {
      const { error: updateError } = await admin.rpc('update_secret', {
        secret_id: existing.vault_id,
        new_secret: token,
      })
      if (updateError) throw updateError

      const { error: updateRowError } = await supabase
        .from('github_connections')
        .update({ username })
        .eq('id', existing.id)
      if (updateRowError) throw updateRowError
    } else {
      const { data: newSecret, error: createError } = await admin.rpc('create_secret', {
        new_secret: token,
      })
      if (createError) throw createError
      const secretId = (newSecret as unknown as { id: string })?.id
      if (!secretId) throw new Error('No se pudo crear el secreto en Vault')

      const { error: insertError } = await supabase
        .from('github_connections')
        .insert({ user_id: user.id, vault_id: secretId, username })
      if (insertError) throw insertError
    }

    return NextResponse.json({ success: true, username })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al conectar GitHub'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
