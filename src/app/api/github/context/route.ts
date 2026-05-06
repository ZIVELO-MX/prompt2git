import { createClient } from '@/lib/supabase/server'
import { getGitHubToken } from '@/lib/github'
import { NextRequest, NextResponse } from 'next/server'

const GITHUB_API = 'https://api.github.com'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const branch = searchParams.get('branch')

  if (!owner || !repo || !branch) {
    return NextResponse.json({ error: 'Faltan parámetros: owner, repo, branch' }, { status: 400 })
  }

  const token = await getGitHubToken(user.id)
  if (!token) {
    return NextResponse.json({ error: 'github_not_connected' }, { status: 400 })
  }

  const headers = { Authorization: `Bearer ${token}` }

  const [branchRes, pullsRes] = await Promise.all([
    fetch(`${GITHUB_API}/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`, { headers }),
    fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls?state=open&per_page=1`, { headers }),
  ])

  if (branchRes.status === 401 || pullsRes.status === 401) {
    return NextResponse.json({ error: 'github_token_invalid' }, { status: 401 })
  }

  if (!branchRes.ok) {
    return NextResponse.json({ error: 'github_branch_not_found' }, { status: 404 })
  }

  const branchData = (await branchRes.json()) as { commit: { sha: string; commit: { message: string } } }
  const sha = branchData.commit.sha

  const commitRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/commits/${sha}`, { headers })
  let lastCommit = sha.slice(0, 7)
  if (commitRes.ok) {
    const commitData = (await commitRes.json()) as { commit: { message: string } }
    lastCommit = `${sha.slice(0, 7)} — ${commitData.commit.message.split('\n')[0]}`
  }

  const openPulls = (await pullsRes.json()) as unknown[]
  const openPrsCount = Array.isArray(openPulls) ? openPulls.length : 0

  return NextResponse.json({
    branch,
    last_commit: lastCommit,
    open_prs_count: openPrsCount,
  })
}
