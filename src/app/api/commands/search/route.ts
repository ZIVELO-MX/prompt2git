import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)

  if (!q.trim()) {
    const { data, error } = await supabase
      .from('commands')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ commands: data ?? [] })
  }

  const { data, error } = await supabase
    .from('commands')
    .select('*')
    .eq('user_id', user.id)
    .textSearch('search_vector', q, {
      type: 'plain',
      config: 'spanish',
    })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ commands: data ?? [] })
}
