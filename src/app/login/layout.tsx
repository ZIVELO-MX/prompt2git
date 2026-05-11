import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión — Prompt2Git',
  description: 'Accedé a Prompt2Git con magic link o GitHub. Empezá a traducir lenguaje natural a comandos Git al instante.',
  openGraph: {
    title: 'Iniciar Sesión — Prompt2Git',
    description: 'Accedé a Prompt2Git con magic link o GitHub.',
  },
  twitter: {
    title: 'Iniciar Sesión — Prompt2Git',
    description: 'Accedé a Prompt2Git con magic link o GitHub.',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
