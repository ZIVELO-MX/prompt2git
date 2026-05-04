// TODO (Fase 2): API Route para generar comandos Git
//
// Flujo:
// 1. Validar sesión con Supabase (createClient server)
// 2. Leer la provider_key del usuario (Vault) desde Supabase
// 3. Llamar a lib/ai-provider.ts → generate()
// 4. Guardar el resultado en tabla commands
// 5. Devolver el comando al cliente
//
// Nunca exponer la API key descifrada en la respuesta.

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Not implemented yet' }, { status: 501 })
}
