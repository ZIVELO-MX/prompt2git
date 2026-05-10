import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; lang?: string; source?: string }

    if (!body.email || !EMAIL_RE.test(body.email)) {
      return NextResponse.json({ ok: false, error: 'Email inválido' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { error } = await admin.from('beta_waitlist').insert({
      email: body.email.toLowerCase().trim(),
      lang: body.lang ?? 'es',
      source: body.source ?? 'landing',
    })

    if (error) {
      // Si el email ya existe (unique constraint), no es error visible
      if (error.code === '23505') {
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 })
  }
}
