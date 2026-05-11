import type { Metadata } from 'next'
import '@/lib/env'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://prompt2git.zivelo.dev'),
  title: 'Prompt2Git — Natural Language to Git',
  description: 'Describe lo que quieres hacer con Git y obtén el comando correcto al instante.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Prompt2Git — Natural Language to Git',
    description: 'Describe lo que quieres hacer con Git y obtén el comando correcto al instante.',
    type: 'website',
    locale: 'es_ES',
    siteName: 'Prompt2Git',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://prompt2git.zivelo.dev',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@zivelomx',
    title: 'Prompt2Git — Natural Language to Git',
    description: 'Describe lo que quieres hacer con Git y obtén el comando correcto al instante.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
