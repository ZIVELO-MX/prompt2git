// TODO (Fase 4): Landing page completa con hero, demo animado y CTA
// Por ahora redirige a /app — reemplazar cuando se construya la landing

import { redirect } from 'next/navigation'

export default function LandingPage() {
  redirect('/app')
}
