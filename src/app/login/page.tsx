'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GitIcon } from '@/components/ui/icons'
import styles from './login.module.css'

const ALLOWED_VSCODE_REDIRECT = 'vscode://zivelo.gitspeak/auth-callback'

function buildCallbackUrl(redirectUri: string | null): string {
  const base = `${location.origin}/auth/callback`
  if (redirectUri === ALLOWED_VSCODE_REDIRECT) {
    return `${base}?next=${encodeURIComponent(redirectUri)}`
  }
  return base
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [terms, setTerms] = useState(false)

  const searchParams = useSearchParams()
  const redirectUri = searchParams.get('redirect_uri')
  const providerParam = searchParams.get('provider')
  const isExtension = redirectUri === ALLOWED_VSCODE_REDIRECT

  const supabase = createClient()

  useEffect(() => {
    // Auto-trigger solo si el usuario ya aceptó términos (extension flow)
    if (providerParam === 'github' && !loading && terms) {
      handleGitHub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terms])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !terms) return

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: buildCallbackUrl(redirectUri) },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  const handleGitHub = async () => {
    if (!terms) return
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: buildCallbackUrl(redirectUri) },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // Si no hay error, el browser redirige a GitHub
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <GitIcon />
          <span className={styles.brandName}>Prompt2Git</span>
        </div>

        <p className={styles.tagline}>
          Lenguaje natural → Comandos Git
        </p>

        {isExtension && (
          <p className={styles.extensionHint}>
            Iniciá sesión para conectar la extensión de VS Code
          </p>
        )}

        {sent ? (
          <div className={styles.sentState}>
            <div className={styles.sentIcon}>✓</div>
            <p className={styles.sentTitle}>Revisá tu correo</p>
            <p className={styles.sentText}>
              Te enviamos un magic link a <strong>{email}</strong>.
              Hacé clic en el enlace para iniciar sesión.
            </p>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setSent(false)}
            >
              Usar otro correo
            </button>
          </div>
        ) : (
          <>
            <form className={styles.form} onSubmit={handleMagicLink}>
              <label className={styles.label} htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null) }}
                placeholder="tu@correo.com"
                required
                autoComplete="email"
                autoFocus
              />
              {error && <p className={styles.error}>{error}</p>}
              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={loading || !email.trim() || !terms}
              >
                {loading ? 'Enviando…' : 'Enviar magic link →'}
              </button>
            </form>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>o</span>
              <span className={styles.dividerLine} />
            </div>

            <button
              type="button"
              className={styles.githubBtn}
              onClick={handleGitHub}
              disabled={loading || !terms}
            >
              <GitHubIcon />
              Continuar con GitHub
            </button>

            <label className={styles.termsWrap}>
              <input
                type="checkbox"
                className={styles.termsCheck}
                checked={terms}
                onChange={e => setTerms(e.target.checked)}
              />
              <span className={styles.termsLabel}>
                Acepto los{' '}
                <Link href="/terminos" target="_blank">Términos de Servicio</Link>
                {' '}y la{' '}
                <Link href="/privacidad" target="_blank">Política de Privacidad</Link>
              </span>
            </label>
          </>
        )}
      </div>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}
