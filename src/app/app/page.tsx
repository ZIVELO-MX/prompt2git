'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { Command } from '@/types'
import { Sidebar } from '@/components/sidebar'
import { ResultCard } from '@/components/result-card'
import { GitIcon, MortarboardIcon, SettingsIcon } from '@/components/ui/icons'
import { useCommands } from '@/hooks/use-commands'
import styles from './page.module.css'

// ─── Constants ───────────────────────────────────────────────────────────────

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


// ─── TweaksPanel ─────────────────────────────────────────────────────────────

interface TweaksState {
  showSidebar: boolean
  eduMode: boolean
}

interface TweaksPanelProps {
  tweaks: TweaksState
  onChange: (key: keyof TweaksState) => void
  onChangeKey: () => void
}

function TweaksPanel({ tweaks, onChange, onChangeKey }: TweaksPanelProps) {
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

      <Link href="/app/settings" className={styles.changeKeyBtn} onClick={onChangeKey}>
        Configurar API keys
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppPage() {
  const { commands, loading: histLoading, append, clear } = useCommands()
  const [result, setResult]           = useState<Command | null>(null)
  const [activeId, setActiveId]       = useState<string | null>(null)
  const [input, setInput]             = useState('')
  const [charCount, setCharCount]     = useState(0)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [tweaks, setTweaks]           = useState<TweaksState>({ showSidebar: true, eduMode: false })
  const [showTweaks, setShowTweaks]   = useState(false)

  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const tweaksRef   = useRef<HTMLDivElement>(null)

  // Rotate placeholders
  useEffect(() => {
    const iv = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 3500)
    return () => clearInterval(iv)
  }, [])

  // Close tweaks on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tweaksRef.current && !tweaksRef.current.contains(e.target as Node)) {
        setShowTweaks(false)
      }
    }
    if (showTweaks) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showTweaks])

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
    await clear()
    setResult(null)
    setActiveId(null)
  }, [clear])

  const toggleTweak = (key: keyof TweaksState) => {
    setTweaks(t => ({ ...t, [key]: !t[key] }))
  }

  const handleGenerate = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    if (trimmed.length > 280) { setError('Máximo 280 caracteres.'); return }

    setLoading(true)
    setError(null)

    try {
      // TODO(O-06): reemplazar por llamada real a /api/generate cuando Opencode implemente el endpoint
      // El endpoint validará la sesión, leerá la key de Vault y llamará a ai-provider.ts
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmed }),
      })

      if (!res.ok) {
        if (res.status === 501) {
          setError('El endpoint de generación aún no está implementado (Fase 2).')
          return
        }
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? `Error ${res.status}`)
      }

      const data = await res.json() as { command: Command }

      if (!data.command) throw new Error('Respuesta inválida del servidor')

      append(data.command)
      setResult(data.command)
      setActiveId(data.command.id)
      setInput('')
      setCharCount(0)

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Ocurrió un error. Intenta de nuevo.'
      if (msg === 'not_git') {
        setError('Esta instrucción no parece estar relacionada con Git.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const { showSidebar, eduMode } = tweaks

  return (
    <div className={styles.root}>
      {showSidebar && (
        <Sidebar
          history={commands}
          activeId={activeId}
          onSelect={handleSelect}
          onClear={handleClear}
        />
      )}

      <main className={styles.main}>
        {/* Top bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            {!showSidebar && (
              <div className={styles.topBarBrand}>
                <GitIcon />
                <span className={styles.topBarBrandName}>Prompt2Git</span>
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
                  // TODO(Fase 1): redirigir a /login en lugar de eliminar la key cuando auth esté activo
                  onChangeKey={() => setShowTweaks(false)}
                />
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {/* Input card */}
          <div className={`${styles.inputCard} ${error ? styles.hasError : ''}`}>
            <div className={styles.inputRow}>
              <span className={styles.inputPrompt} aria-hidden>$</span>
              <textarea
                ref={inputRef}
                className={styles.textarea}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={PLACEHOLDERS[placeholderIdx]}
                disabled={loading}
                rows={3}
                aria-label="Describe la acción de Git en lenguaje natural"
              />
            </div>

            <div className={styles.inputFooter}>
              <span>
                {error
                  ? <span className={styles.inputError}>{error}</span>
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
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <><span className={styles.spinner} /> Generando…</>
                  ) : 'Generar →'}
                </button>
              </div>
            </div>
          </div>

          {/* Result or empty state */}
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
