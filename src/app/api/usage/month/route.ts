import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const STARTER_LIMIT = 20

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

  const { count, error } = await supabase
    .from('commands')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', monthStart.toISOString())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const used = count ?? 0

  const { data: providerConfig } = await supabase
    .from('provider_keys')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  const plan = providerConfig ? 'pro' : 'starter'

  return NextResponse.json({
    used,
    limit: STARTER_LIMIT,
    plan,
  })
}
