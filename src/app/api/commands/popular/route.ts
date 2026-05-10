import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('commands')
    .select('input, command')
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ popular: [] })

  const freq = new Map<string, { input: string; command: string; count: number }>()
  for (const row of data) {
    const key = row.command
    const existing = freq.get(key)
    if (existing) {
      existing.count++
    } else {
      freq.set(key, { input: row.input, command: row.command, count: 1 })
    }
  }

  const sorted = [...freq.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return NextResponse.json({ popular: sorted })
}
