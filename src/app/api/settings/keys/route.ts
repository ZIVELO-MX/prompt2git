// TODO(O-05): Implementar este endpoint cuando Supabase Vault esté configurado
//
// GET  — lista los providers conectados del usuario (sin devolver la key)
// POST — recibe { provider, key, model }, cifra con Vault, guarda vault_id en provider_keys
// DELETE ?provider=xxx — elimina provider_keys y el secreto de Vault

import { NextResponse } from 'next/server'

export async function GET() {
  // TODO(O-05): createClient() → query provider_keys WHERE user_id = auth.uid()
  // Devolver solo { provider, model }[] — nunca la key
  return NextResponse.json([])
}

export async function POST() {
  // TODO(O-05): validar sesión, cifrar key con Vault, insertar/actualizar provider_keys
  return NextResponse.json({ error: 'Not implemented — pending O-05 (Vault)' }, { status: 501 })
}

export async function DELETE() {
  // TODO(O-05): eliminar vault secret y el registro en provider_keys
  return NextResponse.json({ error: 'Not implemented — pending O-05 (Vault)' }, { status: 501 })
}
