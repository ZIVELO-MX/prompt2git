import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planes — Prompt2Git',
  description: 'Elegí el plan ideal: Starter gratuito, Pro para uso intensivo, o Teams para tu equipo. Precios claros sin sorpresas.',
  openGraph: {
    title: 'Planes — Prompt2Git',
    description: 'Elegí el plan ideal: Starter gratuito, Pro para uso intensivo, o Teams para tu equipo.',
  },
  twitter: {
    title: 'Planes — Prompt2Git',
    description: 'Elegí el plan ideal: Starter gratuito, Pro para uso intensivo, o Teams para tu equipo.',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
