import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

async function saveGitHubToken(token: string, userId: string) {
  const ghRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!ghRes.ok) return

  const ghUser = (await ghRes.json()) as { login: string }
  const admin = createAdminClient()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const { data: existing } = await supabase
    .from('github_connections')
    .select('id, vault_id')
    .eq('user_id', userId)
    .maybeSingle()

  try {
    if (existing?.vault_id) {
      await admin.rpc('update_secret', { secret_id: existing.vault_id, new_secret: token })
      await supabase.from('github_connections').update({ username: ghUser.login }).eq('id', existing.id)
    } else {
      const { data: newSecret } = await admin.rpc('create_secret', { new_secret: token })
      const secretId = (newSecret as unknown as { id: string })?.id
      if (!secretId) return
      await supabase.from('github_connections').insert({ user_id: userId, vault_id: secretId, username: ghUser.login })
    }
  } catch {
    // Si falla el guardado automático, el usuario puede conectar manualmente desde settings
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { /* ignore */ }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.session?.provider_token && data.user?.id) {
      await saveGitHubToken(data.session.provider_token, data.user.id)
    }

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
