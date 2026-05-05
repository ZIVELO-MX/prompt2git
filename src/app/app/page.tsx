'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Command, Provider } from '@/types'
import { Sidebar } from '@/components/sidebar'
import { ResultCard } from '@/components/result-card'
import Link from 'next/link'
import { GitIcon, MortarboardIcon, SettingsIcon, SunIcon, MoonIcon } from '@/components/ui/icons'
import { Onboarding } from '@/components/onboarding'
import styles from './page.module.css'

const PLACEHOLDERS = [
  'deshacer el último commit sin perder cambios…',
  'subir mi rama al remoto por primera vez…',
  'ver solo los commits de la última semana…',
  'fusionar dos ramas sin crear un merge commit…',
  'guardar mis cambios temporalmente y limpiar…',
]

const SUGGESTIONS = [
  'deshacer último commit',
  'crear rama nueva',
  'stash mis cambios',
  'ver log compacto',
]

interface TweaksState {
  showSidebar: boolean
  eduMode: boolean
}

interface TweaksPanelProps {
  tweaks: TweaksState
  onChange: (key: keyof TweaksState) => void
  onLogout: () => void
}

function TweaksPanel({ tweaks, onChange, onLogout }: TweaksPanelProps) {
  return (
    <div className={styles.tweaksPanel}>
      <span className={styles.tweaksSectionLabel}>INTERFAZ</span>

      {(['showSidebar', 'eduMode'] as const).map(key => (
        <label key={key} className={styles.tweakRow}>
          {key === 'showSidebar' ? 'Sidebar de historial' : 'Modo Educativo'}
          <button
            type="button"
            className={`${styles.toggle} ${tweaks[key] ? styles.on : ''}`}
            onClick={() => onChange(key)}
            aria-pressed={tweaks[key]}
          >
            <span
              className={styles.toggleThumb}
              style={{ left: tweaks[key] ? 18 : 3 }}
            />
          </button>
        </label>
      ))}

      <span className={styles.tweaksSectionDivider}>CUENTA</span>

      <Link href="/app/settings" className={styles.apiKeysLink}>
        🔑 Configurar API keys
      </Link>

      <button type="button" className={styles.logoutBtn} onClick={onLogout}>
        Cerrar sesión
      </button>
    </div>
  )
}

export default function AppPage() {
  const [history, setHistory]         = useState<Command[]>([])
  const [result, setResult]           = useState<Command | null>(null)
  const [activeId, setActiveId]       = useState<string | null>(null)
  const [input, setInput]             = useState('')
  const [charCount, setCharCount]     = useState(0)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [tweaks, setTweaks]           = useState<TweaksState>({ showSidebar: true, eduMode: false })
  const [showTweaks, setShowTweaks]   = useState(false)
  const [theme, setTheme]             = useState<'dark' | 'light'>('dark')
  const [queriesLeft, setQueriesLeft] = useState<number | null>(null)
  const [rateLimitReset, setRateLimitReset] = useState<string | null>(null)

  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const tweaksRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('p2g_theme') as 'dark' | 'light' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('p2g_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  useEffect(() => {
    const iv = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 3500)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tweaksRef.current && !tweaksRef.current.contains(e.target as Node)) {
        setShowTweaks(false)
      }
    }
    if (showTweaks) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showTweaks])

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/commands')
      if (!res.ok) return
      const data = await res.json() as { commands: Command[] }
      setHistory(data.commands)
    } catch { /* ignore */ }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, 280)
    setInput(val)
    setCharCount(val.length)
    if (error) setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
  }

  const handleSelect = useCallback((item: Command) => {
    setResult(item)
    setActiveId(item.id)
  }, [])

  const handleClear = useCallback(async () => {
    setHistory([])
    setResult(null)
    setActiveId(null)
  }, [])

  const toggleTweak = (key: keyof TweaksState) => {
    setTweaks(t => ({ ...t, [key]: !t[key] }))
  }

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleGenerate = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    if (trimmed.length > 280) { setError('Máximo 280 caracteres.'); return }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmed }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string; remaining?: number; reset_at?: string }
        if (body.error === 'not_git') {
          setError('Esta instrucción no parece estar relacionada con Git.')
          return
        }
        if (body.error === 'rate_limit') {
          setRateLimitReset(body.reset_at ?? null)
          setQueriesLeft(0)
          return
        }
        throw new Error(body.error ?? `Error ${res.status}`)
      }

      const remaining = res.headers.get('X-RateLimit-Remaining')
      if (remaining !== null) setQueriesLeft(Number(remaining))

      const data = await res.json() as { command: Command }

      if (!data.command) throw new Error('Respuesta inválida del servidor')

      setHistory(prev => {
        if (prev.find(h => h.input === trimmed)) return prev
        return [data.command, ...prev]
      })
      setResult(data.command)
      setActiveId(data.command.id)
      setInput('')
      setCharCount(0)
      setRateLimitReset(null)

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Ocurrió un error. Intenta de nuevo.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const { showSidebar, eduMode } = tweaks

  return (
    <div className={styles.root}>
      <Onboarding />
      {showSidebar && (
        <Sidebar
          history={history}
          activeId={activeId}
          onSelect={handleSelect}
          onClear={handleClear}
        />
      )}

      <main className={styles.main}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            {!showSidebar && (
              <div className={styles.topBarBrand}>
                <GitIcon />
                <span className={styles.topBarBrandName}>GitSpeak</span>
              </div>
            )}
            <span className={styles.topBarHint}>Describe lo que quieres hacer con Git</span>
          </div>

          <div className={styles.topBarRight}>
            <button
              type="button"
              className={`${styles.eduBtn} ${eduMode ? styles.active : ''}`}
              onClick={() => toggleTweak('eduMode')}
            >
              <MortarboardIcon /> Modo Educativo
            </button>

            <button
              type="button"
              className={styles.themeBtn}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            <div ref={tweaksRef} className={styles.tweaksWrapper}>
              <button
                type="button"
                className={`${styles.settingsBtn} ${showTweaks ? styles.active : ''}`}
                onClick={() => setShowTweaks(o => !o)}
                title="Ajustes"
              >
                <SettingsIcon />
              </button>
              {showTweaks && (
                <TweaksPanel
                  tweaks={tweaks}
                  onChange={toggleTweak}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {rateLimitReset && (
            <div className={styles.rateLimitBanner}>
              <span className={styles.rateLimitIcon}>⚡</span>
              <div className={styles.rateLimitText}>
                <strong>Límite diario alcanzado</strong>
                <span>Se reinicia a las {new Date(rateLimitReset).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          )}
          <div className={`${styles.inputCard} ${error ? styles.hasError : ''} ${rateLimitReset ? styles.disabled : ''}`}>
            <div className={styles.inputRow}>
              <span className={styles.inputPrompt} aria-hidden>$</span>
              <textarea
                ref={inputRef}
                className={styles.textarea}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={PLACEHOLDERS[placeholderIdx]}
                disabled={loading || !!rateLimitReset}
                rows={3}
                aria-label="Describe la acción de Git en lenguaje natural"
              />
            </div>

            <div className={styles.inputFooter}>
              <span>
                {error
                  ? <span className={styles.inputError}>{error}</span>
                  : queriesLeft !== null && queriesLeft <= 10
                    ? <span className={styles.inputWarning}>⚠ {queriesLeft} queries restantes hoy</span>
                    : <span className={styles.inputHint}>⌘↵ para generar</span>
                }
              </span>
              <div className={styles.inputFooterRight}>
                <span className={`${styles.charCount} ${charCount > 240 ? styles.warning : ''}`}>
                  {charCount}/280
                </span>
                <button
                  type="button"
                  className={styles.generateBtn}
                  onClick={handleGenerate}
                  disabled={loading || !input.trim() || !!rateLimitReset}
                >
                  {loading ? (
                    <><span className={styles.spinner} /> Generando…</>
                  ) : 'Generar →'}
                </button>
              </div>
            </div>
          </div>

          {result ? (
            <ResultCard result={result} eduMode={eduMode} />
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyHint}>
                Escribe en lenguaje natural y obtén el comando Git correcto
              </p>
              <div className={styles.suggestions}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={styles.suggestionChip}
                    onClick={() => {
                      setInput(s)
                      setCharCount(s.length)
                      inputRef.current?.focus()
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
