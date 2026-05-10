import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ favorites: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json() as {
    command_id?: string
    input: string
    command: string
    explanation: unknown
    provider: string
    model: string
  }

  if (!body.input?.trim() || !body.command?.trim()) {
    return NextResponse.json({ error: 'Faltan campos: input, command' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('command_id', body.command_id ?? null)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Ya existe un favorito con ese comando' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .insert({
      user_id: user.id,
      command_id: body.command_id ?? null,
      input: body.input.trim(),
      command: body.command.trim(),
      explanation: body.explanation ?? [],
      provider: body.provider,
      model: body.model,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ favorite: data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const commandId = searchParams.get('command_id')

  if (!commandId) {
    return NextResponse.json({ error: 'Falta parámetro: command_id' }, { status: 400 })
  }

  const { error: deleteError } = await supabase
    .from('user_favorites')
    .delete()
    .eq('command_id', commandId)
    .eq('user_id', user.id)

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
