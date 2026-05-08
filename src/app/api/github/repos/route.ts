import { createClient } from '@/lib/supabase/server'
import { getGitHubToken } from '@/lib/github'
import { NextResponse } from 'next/server'

const GITHUB_API = 'https://api.github.com'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const token = await getGitHubToken(user.id)
  if (!token) {
    return NextResponse.json({ error: 'github_not_connected' }, { status: 400 })
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`${GITHUB_API}/user`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${GITHUB_API}/user/repos?per_page=100&sort=updated&type=all`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ])

  if (userRes.status === 401 || reposRes.status === 401) {
    return NextResponse.json({ error: 'github_token_invalid' }, { status: 401 })
  }

  if (!reposRes.ok) {
    return NextResponse.json({ error: 'github_api_error' }, { status: 502 })
  }

  const userData = (await userRes.json()) as { login: string }
  const repos = (await reposRes.json()) as Array<{
    owner: { login: string }
    name: string
    default_branch: string
    private: boolean
  }>

  const result = repos.map((r) => ({
    owner: r.owner.login,
    name: r.name,
    default_branch: r.default_branch,
    private: r.private,
  }))

  return NextResponse.json({ username: userData.login, repos: result })
}
