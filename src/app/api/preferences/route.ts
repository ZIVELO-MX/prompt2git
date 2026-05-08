import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type PrefBody = {
  lang?: 'es' | 'en'
  show_sidebar?: boolean
  edu_mode?: boolean
  provider?: string | null
}

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data) {
    return NextResponse.json({ lang: 'es', show_sidebar: true, edu_mode: false, provider: null })
  }

  return NextResponse.json({
    lang: data.lang,
    show_sidebar: data.show_sidebar,
    edu_mode: data.edu_mode,
    provider: data.provider,
  })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json() as PrefBody

  const updates: Record<string, unknown> = {}
  if (body.lang !== undefined) updates.lang = body.lang
  if (body.show_sidebar !== undefined) updates.show_sidebar = body.show_sidebar
  if (body.edu_mode !== undefined) updates.edu_mode = body.edu_mode
  if (body.provider !== undefined) updates.provider = body.provider
  updates.updated_at = new Date().toISOString()

  const { data: existing } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  let error
  if (existing) {
    const result = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('id', existing.id)
    error = result.error
  } else {
    const result = await supabase
      .from('user_preferences')
      .insert({ user_id: user.id, ...updates } as Record<string, unknown>)
    error = result.error
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
