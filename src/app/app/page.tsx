'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Command, Provider, FixResult } from '@/types'
import { FREE_MODELS, STARTER_MODEL_KEY } from '@/lib/models'
import { Sidebar } from '@/components/sidebar'
import { ResultCard } from '@/components/result-card'
import { QuickActions } from '@/components/quick-actions'
import Link from 'next/link'
import { GitIcon, MortarboardIcon, SettingsIcon, SunIcon, MoonIcon } from '@/components/ui/icons'
import { Onboarding } from '@/components/onboarding'
import { PricingModal } from '@/components/pricing-modal'
import { ContextStrip } from '@/components/context-strip'
import { FixResultCard } from '@/components/fix-result-card'
import { t, getStoredLang, setStoredLang } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'
import styles from './page.module.css'

const PLACEHOLDER_KEYS = ['app.placeholder.0', 'app.placeholder.1', 'app.placeholder.2', 'app.placeholder.3', 'app.placeholder.4']
const SUGGESTION_KEYS = ['app.suggestion.0', 'app.suggestion.1', 'app.suggestion.2', 'app.suggestion.3']

interface TweaksState {
  showSidebar: boolean
  eduMode: boolean
}

interface TweaksPanelProps {
  tweaks: TweaksState
  lang: Lang
  onChange: (key: keyof TweaksState) => void
  onToggleLang: () => void
  onLogout: () => void
}

function TweaksPanel({ tweaks, lang, onChange, onToggleLang, onLogout }: TweaksPanelProps) {
  return (
    <div className={styles.tweaksPanel}>
      <span className={styles.tweaksSectionLabel}>{t('tweaks.section.interface', lang)}</span>

      {(['showSidebar', 'eduMode'] as const).map(key => (
        <label key={key} className={styles.tweakRow}>
          {key === 'showSidebar' ? t('tweaks.label.sidebar', lang) : t('tweaks.label.edu_mode', lang)}
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

      <span className={styles.tweaksSectionDivider}>{t('tweaks.section.account', lang)}</span>

      <button type="button" className={styles.langBtn} onClick={onToggleLang}>
        {lang === 'es' ? '🇬🇧 English' : '🇪🇸 Español'}
      </button>

      <Link href="/app/settings" className={styles.apiKeysLink}>
        {t('tweaks.link.api_keys', lang)}
      </Link>

      <button type="button" className={styles.logoutBtn} onClick={onLogout}>
        {t('tweaks.button.logout', lang)}
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
  const [showPricing, setShowPricing] = useState(false)
  const [theme, setTheme]             = useState<'dark' | 'light'>('dark')
  const [queriesLeft, setQueriesLeft] = useState<number | null>(null)
  const [rateLimitReset, setRateLimitReset] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>('es')

  const [favorites, setFavorites]     = useState<Command[]>([])
  const [monthlyUsage, setMonthlyUsage] = useState<{ used: number; limit: number; plan: string } | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>(STARTER_MODEL_KEY)

  const [fixMode, setFixMode]         = useState(false)
  const [gitStatus, setGitStatus]     = useState('')
  const [problemDesc, setProblemDesc] = useState('')
  const [fixResult, setFixResult]     = useState<FixResult | null>(null)
  const [fixLoading, setFixLoading]   = useState(false)
  const [fixError, setFixError]       = useState<string | null>(null)

  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const tweaksRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('p2g_theme') as 'dark' | 'light' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
    setLang(getStoredLang())
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('p2g_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const toggleLang = () => {
    const next: Lang = lang === 'es' ? 'en' : 'es'
    setLang(next)
    setStoredLang(next)
  }

  useEffect(() => {
    const iv = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDER_KEYS.length), 3500)
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
    // Cargar favoritos desde localStorage
    try {
      const stored = localStorage.getItem('p2g_favorites')
      if (stored) setFavorites(JSON.parse(stored) as Command[])
    } catch { /* ignore */ }
    // Cargar uso mensual (C-25) — silencioso si no existe aún
    fetch('/api/usage/month')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.limit) setMonthlyUsage(d) })
      .catch(() => {})
    fetch('/api/preferences')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.selected_model) setSelectedModel(d.selected_model as string) })
      .catch(() => {})
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

  const handleModelChange = async (key: string) => {
    setSelectedModel(key)
    await fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_model: key }),
    }).catch(() => {})
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
    if (trimmed.length > 280) { setError(t('app.error.max_length', lang)); return }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: trimmed,
          lang,
          selectedModel,
          repoContext: (() => { try { const r = localStorage.getItem('p2g_active_repo'); return r ? JSON.parse(r) : null } catch { return null } })(),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string; remaining?: number; reset_at?: string }
        if (body.error === 'not_git') {
          setError(t('app.error.not_git', lang))
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
      const msg = e instanceof Error ? e.message : t('app.error.generic', lang)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [input, loading, lang])

  const handleFix = async () => {
    if (!gitStatus.trim() || !problemDesc.trim() || fixLoading) return
    setFixLoading(true)
    setFixError(null)
    setFixResult(null)
    try {
      const res = await fetch('/api/github/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ git_status: gitStatus.trim(), problem_desc: problemDesc.trim() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? `Error ${res.status}`)
      }
      const data = await res.json() as FixResult
      setFixResult(data)
    } catch (e) {
      setFixError(e instanceof Error ? e.message : t('app.error.generic', lang))
    } finally {
      setFixLoading(false)
    }
  }

  const toggleFavorite = useCallback((command: Command) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === command.id)
      const next = exists ? prev.filter(f => f.id !== command.id) : [command, ...prev]
      try { localStorage.setItem('p2g_favorites', JSON.stringify(next)) } catch { /* ignore */ }
      // Sync con API cuando esté disponible (fire & forget)
      if (exists) {
        fetch(`/api/favorites?command_id=${command.id}`, { method: 'DELETE' }).catch(() => {})
      } else {
        fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command_id: command.id, input: command.input, command: command.command, explanation: command.explanation, provider: command.provider, model: command.model }),
        }).catch(() => {})
      }
      return next
    })
  }, [])

  const isFavorite = useCallback((id: string) => favorites.some(f => f.id === id), [favorites])

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
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          lang={lang}
        />
      )}

      <main className={styles.main}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            {!showSidebar && (
              <div className={styles.topBarBrand}>
                <GitIcon />
                <span className={styles.topBarBrandName}>Prompt2Git</span>
              </div>
            )}
            <span className={styles.topBarHint}>{t('app.title', lang)}</span>
          </div>

          <div className={styles.topBarRight}>
            <button
              type="button"
              className={`${styles.eduBtn} ${eduMode ? styles.active : ''}`}
              onClick={() => toggleTweak('eduMode')}
            >
              <MortarboardIcon /> {t('app.edu_mode', lang)}
            </button>

            {monthlyUsage && monthlyUsage.plan === 'starter' && (
              <button
                type="button"
                className={`${styles.usageBadge} ${monthlyUsage.used >= monthlyUsage.limit - 4 ? styles.usageCritical : ''}`}
                onClick={() => monthlyUsage.used >= monthlyUsage.limit ? setShowPricing(true) : undefined}
                title={`${monthlyUsage.used}/${monthlyUsage.limit} comandos este mes`}
              >
                {monthlyUsage.used}/{monthlyUsage.limit}
              </button>
            )}

            <button
              type="button"
              className={styles.planesBtn}
              onClick={() => setShowPricing(true)}
            >
              {t('app.plans', lang)}
            </button>

            <button
              type="button"
              className={styles.themeBtn}
              onClick={toggleTheme}
              title={theme === 'dark' ? t('app.theme.light', lang) : t('app.theme.dark', lang)}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            <div ref={tweaksRef} className={styles.tweaksWrapper}>
              <button
                type="button"
                className={`${styles.settingsBtn} ${showTweaks ? styles.active : ''}`}
                onClick={() => setShowTweaks(o => !o)}
                title={t('app.settings', lang)}
              >
                <SettingsIcon />
              </button>
              {showTweaks && (
                <TweaksPanel
                  tweaks={tweaks}
                  lang={lang}
                  onChange={toggleTweak}
                  onToggleLang={toggleLang}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>
        </header>

        <ContextStrip lang={lang} />

        <div className={styles.content}>
          <div className={styles.modeToggle}>
            <button
              type="button"
              className={`${styles.modeTab} ${!fixMode ? styles.modeTabActive : ''}`}
              onClick={() => { setFixMode(false); setFixResult(null) }}
            >
              {t('app.fix.normal_toggle', lang)}
            </button>
            <button
              type="button"
              className={`${styles.modeTab} ${fixMode ? styles.modeTabActive : ''}`}
              onClick={() => { setFixMode(true); setResult(null) }}
            >
              🛠 {t('app.fix.toggle', lang)}
            </button>
          </div>

          {!fixMode && rateLimitReset && (
            <div className={styles.rateLimitBanner}>
              <span className={styles.rateLimitIcon}>⚡</span>
              <div className={styles.rateLimitText}>
                <strong>{t('app.rate_limit.title', lang)}</strong>
                <span>{t('app.rate_limit.resets_at', lang)}{new Date(rateLimitReset).toLocaleTimeString(lang === 'en' ? 'en' : 'es', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <button
                type="button"
                className={styles.rateLimitUpgradeBtn}
                onClick={() => setShowPricing(true)}
              >
                {t('app.rate_limit.view_plans', lang)}
              </button>
            </div>
          )}
          {fixMode ? (
            <div className={`${styles.fixCard} ${fixError ? styles.hasError : ''}`}>
              <div className={styles.fixFields}>
                <div className={styles.fixField}>
                  <label className={styles.fixLabel} htmlFor="fix-status">
                    {t('app.fix.status_label', lang)}
                  </label>
                  <textarea
                    id="fix-status"
                    className={styles.fixTextarea}
                    value={gitStatus}
                    onChange={e => { setGitStatus(e.target.value); setFixError(null) }}
                    placeholder={t('app.fix.status_placeholder', lang)}
                    rows={5}
                  />
                </div>
                <div className={styles.fixField}>
                  <label className={styles.fixLabel} htmlFor="fix-problem">
                    {t('app.fix.problem_label', lang)}
                  </label>
                  <textarea
                    id="fix-problem"
                    className={styles.fixTextarea}
                    value={problemDesc}
                    onChange={e => { setProblemDesc(e.target.value); setFixError(null) }}
                    placeholder={t('app.fix.problem_placeholder', lang)}
                    rows={3}
                  />
                </div>
              </div>
              {fixError && <p className={styles.fixError}>{fixError}</p>}
              <div className={styles.fixFooter}>
                <button
                  type="button"
                  className={styles.fixBtn}
                  onClick={handleFix}
                  disabled={fixLoading || !gitStatus.trim() || !problemDesc.trim()}
                >
                  {fixLoading ? (
                    <><span className={styles.spinner} /> {t('app.fix.diagnosing', lang)}</>
                  ) : t('app.fix.diagnose', lang)}
                </button>
              </div>
            </div>
          ) : (
            <div className={`${styles.inputCard} ${error ? styles.hasError : ''} ${rateLimitReset ? styles.disabled : ''}`}>
              <div className={styles.inputRow}>
                <span className={styles.inputPrompt} aria-hidden>$</span>
                <textarea
                  ref={inputRef}
                  className={styles.textarea}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t(PLACEHOLDER_KEYS[placeholderIdx]!, lang)}
                  disabled={loading || !!rateLimitReset}
                  rows={3}
                  aria-label={t('app.aria.input', lang)}
                />
              </div>

              <div className={styles.inputFooter}>
                <span>
                  {error
                    ? <span className={styles.inputError}>{error}</span>
                    : queriesLeft !== null && queriesLeft <= 10
                      ? <span className={styles.inputWarning}>{t('app.hint.queries_left', lang, { n: queriesLeft })}</span>
                      : <span className={styles.inputHint}>{t('app.hint.shortcut', lang)}</span>
                  }
                </span>
                <div className={styles.inputFooterRight}>
                  <span className={`${styles.charCount} ${charCount > 240 ? styles.warning : ''}`}>
                    {charCount}/280
                  </span>
                  {monthlyUsage?.plan === 'pro' && (
                    <select
                      className={styles.modelSelect}
                      value={selectedModel}
                      onChange={e => handleModelChange(e.target.value)}
                      disabled={loading}
                      title="Modelo de IA"
                    >
                      {Object.entries(FREE_MODELS).map(([key, m]) => (
                        <option key={key} value={key}>{m.label}</option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    className={styles.generateBtn}
                    onClick={handleGenerate}
                    disabled={loading || !input.trim() || !!rateLimitReset}
                  >
                    {loading ? (
                      <><span className={styles.spinner} /> {t('app.generating', lang)}</>
                    ) : t('app.generate', lang)}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!fixMode && (
            <QuickActions
              lang={lang}
              onSelect={text => { setInput(text); setCharCount(text.length); inputRef.current?.focus() }}
            />
          )}

          {fixMode ? (
            fixResult ? <FixResultCard result={fixResult} lang={lang} /> : null
          ) : result ? (
            <ResultCard
              result={result}
              eduMode={eduMode}
              isFavorite={isFavorite(result.id)}
              onToggleFavorite={() => toggleFavorite(result)}
            />
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyHint}>
                {t('app.empty.hint', lang)}
              </p>
              <div className={styles.suggestions}>
                {SUGGESTION_KEYS.map(k => {
                  const text = t(k, lang)
                  return (
                    <button
                      key={k}
                      type="button"
                      className={styles.suggestionChip}
                      onClick={() => {
                        setInput(text)
                        setCharCount(text.length)
                        inputRef.current?.focus()
                      }}
                    >
                      {text}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  )
}
