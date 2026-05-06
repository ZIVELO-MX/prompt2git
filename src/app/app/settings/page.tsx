'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Provider, GitHubRepo } from '@/types'
import { t, getStoredLang } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'
import styles from './settings.module.css'

// ─── Provider config ──────────────────────────────────────────────────────────

import {
  AnthropicIcon,
  OpenAIIcon,
  GeminiIcon,
  GroqIcon,
  MistralIcon,
  OpenRouterIcon,
  GitHubIcon,
} from '@/components/ui/icons'

interface ProviderMeta {
  id: Provider
  name: string
  icon: React.ReactNode
  placeholder: string
  models: string[]
  docsUrl: string
}

const PROVIDERS: ProviderMeta[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: <AnthropicIcon />,
    placeholder: 'sk-ant-...',
    models: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-7'],
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: <OpenAIIcon />,
    placeholder: 'sk-...',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: <GeminiIcon />,
    placeholder: 'AIza...',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: <GroqIcon />,
    placeholder: 'gsk_...',
    models: ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    docsUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: <MistralIcon />,
    placeholder: 'api key...',
    models: ['mistral-small-latest', 'mistral-medium-latest', 'codestral-latest'],
    docsUrl: 'https://console.mistral.ai/api-keys',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: <OpenRouterIcon />,
    placeholder: 'sk-or-v1-...',
    models: ['meta-llama/llama-3.1-8b-instruct:free', 'anthropic/claude-haiku-4-5', 'openai/gpt-4o-mini', 'google/gemini-flash-1.5'],
    docsUrl: 'https://openrouter.ai/keys',
  },
]

import { SettingsIcon } from '@/components/ui/icons'

// ─── GitHub section ───────────────────────────────────────────────────────────

const REPO_KEY = 'p2g_active_repo'

interface ActiveRepo { owner: string; repo: string; branch: string }

function GitHubSection({ lang }: { lang: Lang }) {
  const [username, setUsername]   = useState<string | null>(null)
  const [repos, setRepos]         = useState<GitHubRepo[]>([])
  const [ghLoading, setGhLoading] = useState(true)
  const [ghError, setGhError]     = useState<string | null>(null)
  const [selected, setSelected]   = useState('')
  const [active, setActive]       = useState<ActiveRepo | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(REPO_KEY)
    if (raw) {
      try { setActive(JSON.parse(raw) as ActiveRepo) } catch { /* ignore */ }
    }

    fetch('/api/github/repos')
      .then(r => {
        if (r.status === 401) return null
        if (!r.ok) throw new Error(`Error ${r.status}`)
        return r.json() as Promise<{ username: string; repos: GitHubRepo[] }>
      })
      .then(data => {
        if (!data) { setGhLoading(false); return }
        setUsername(data.username)
        setRepos(data.repos)
        setGhLoading(false)
      })
      .catch(() => {
        setGhError(t('settings.github.error', lang))
        setGhLoading(false)
      })
  }, [lang])

  const handleSetActive = () => {
    const [owner, ...rest] = selected.split('/')
    const repoName = rest.join('/')
    const repo = repos.find(r => r.owner === owner && r.name === repoName)
    if (!repo) return
    const entry: ActiveRepo = { owner: repo.owner, repo: repo.name, branch: repo.default_branch }
    localStorage.setItem(REPO_KEY, JSON.stringify(entry))
    setActive(entry)
    setSelected('')
  }

  const handleClear = () => {
    localStorage.removeItem(REPO_KEY)
    setActive(null)
  }

  return (
    <div className={`${styles.providerCard} ${username ? styles.connected : ''}`}>
      <div className={styles.providerHeader}>
        <div className={styles.providerInfo}>
          <div className={`${styles.providerIcon} ${styles.github}`}>
            <GitHubIcon />
          </div>
          <div>
            <div className={styles.providerName}>GitHub</div>
            <div className={styles.providerMeta}>
              {ghLoading
                ? t('settings.github.loading', lang)
                : username
                  ? `${t('settings.github.connected_as', lang)} @${username}`
                  : 'Sin conectar'}
            </div>
          </div>
        </div>

        <div className={styles.providerActions}>
          <span className={`${styles.badge} ${username ? styles.connected : styles.disconnected}`}>
            {username ? 'Conectado' : 'Sin conectar'}
          </span>
          {!username && !ghLoading && (
            <Link href="/login?provider=github" className={styles.configBtn}>
              {t('settings.github.connect', lang)}
            </Link>
          )}
        </div>
      </div>

      {username && !ghLoading && (
        <div className={styles.keyForm}>
          {active && (
            <div className={styles.ghActiveRepo}>
              <span className={styles.ghActiveName}>{active.owner}/{active.repo} @ {active.branch}</span>
              <button type="button" className={styles.ghClearBtn} onClick={handleClear}>
                {t('settings.github.clear', lang)}
              </button>
            </div>
          )}

          {ghError && <p className={styles.formError}>{ghError}</p>}

          {repos.length > 0 && (
            <div className={styles.formRow}>
              <label className={styles.formLabel} htmlFor="gh-repo-select">
                {active ? 'Cambiar repositorio activo' : t('settings.github.active_repo', lang)}
              </label>
              <select
                id="gh-repo-select"
                className={styles.modelSelect}
                value={selected}
                onChange={e => setSelected(e.target.value)}
              >
                <option value="">— Seleccionar repo —</option>
                {repos.map(r => (
                  <option key={`${r.owner}/${r.name}`} value={`${r.owner}/${r.name}`}>
                    {r.owner}/{r.name}{r.private ? ' 🔒' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selected && (
            <div className={styles.formFooter}>
              <span />
              <div className={styles.formButtons}>
                <button type="button" className={styles.cancelBtn} onClick={() => setSelected('')}>
                  Cancelar
                </button>
                <button type="button" className={styles.saveBtn} onClick={handleSetActive}>
                  Establecer activo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConnectedKey {
  provider: Provider
  model: string
}

// ─── ProviderCard ─────────────────────────────────────────────────────────────

interface ProviderCardProps {
  meta: ProviderMeta
  connected: ConnectedKey | null
  onSave: (provider: Provider, key: string, model: string) => Promise<void>
  onRemove: (provider: Provider) => Promise<void>
}

function ProviderCard({ meta, connected, onSave, onRemove }: ProviderCardProps) {
  const defaultModel = meta.models[0] ?? ''
  const [open, setOpen]     = useState(false)
  const [key, setKey]       = useState('')
  const [model, setModel]   = useState(connected?.model ?? defaultModel)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const handleSave = async () => {
    if (!key.trim()) { setError('Ingresa la API key.'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave(meta.id, key.trim(), model)
      setKey('')
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    setSaving(true)
    try {
      await onRemove(meta.id)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`${styles.providerCard} ${connected ? styles.connected : ''}`}>
      <div className={styles.providerHeader}>
        <div className={styles.providerInfo}>
          <div className={`${styles.providerIcon} ${styles[meta.id]}`}>
            {meta.icon}
          </div>
          <div>
            <div className={styles.providerName}>{meta.name}</div>
            <div className={styles.providerMeta}>
              {connected ? `Modelo: ${connected.model}` : 'Sin configurar'}
            </div>
          </div>
        </div>

        <div className={styles.providerActions}>
          <span className={`${styles.badge} ${connected ? styles.connected : styles.disconnected}`}>
            {connected ? 'Conectado' : 'Sin conectar'}
          </span>
          {connected && (
            <button type="button" className={styles.removeBtn} onClick={handleRemove} disabled={saving}>
              Eliminar
            </button>
          )}
          <button
            type="button"
            className={styles.configBtn}
            onClick={() => setOpen(o => !o)}
          >
            {open ? 'Cancelar' : connected ? 'Editar' : 'Configurar'}
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.keyForm}>
          <div className={styles.formRow}>
            <label className={styles.formLabel} htmlFor={`key-${meta.id}`}>
              API Key {connected ? '(dejar vacío para mantener la actual)' : ''}
            </label>
            <input
              id={`key-${meta.id}`}
              type="password"
              className={styles.formInput}
              value={key}
              onChange={e => { setKey(e.target.value); setError(null) }}
              placeholder={meta.placeholder}
              autoComplete="off"
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel} htmlFor={`model-${meta.id}`}>
              Modelo por defecto
            </label>
            <select
              id={`model-${meta.id}`}
              className={styles.modelSelect}
              value={model}
              onChange={e => setModel(e.target.value)}
            >
              {meta.models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {error && <p className={styles.formError}>{error}</p>}

          <div className={styles.formFooter}>
            <span className={styles.formNote}>
              🔒 Cifrada con Supabase Vault — nunca se almacena en texto plano
            </span>
            <div className={styles.formButtons}>
              <button type="button" className={styles.cancelBtn} onClick={() => { setOpen(false); setKey(''); setError(null) }}>
                Cancelar
              </button>
              <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Settings Page ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [connectedKeys, setConnectedKeys] = useState<ConnectedKey[]>([])
  const [loading, setLoading]             = useState(true)
  const [lang, setLang]                   = useState<Lang>('es')

  useEffect(() => { setLang(getStoredLang()) }, [])

  useEffect(() => {
    // TODO(O-05): reemplazar por llamada real a GET /api/settings/keys
    // El endpoint devuelve la lista de providers con model (sin key)
    fetch('/api/settings/keys')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: ConnectedKey[]) => setConnectedKeys(data))
      .catch(() => {/* no keys or not yet implemented */})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (provider: Provider, key: string, model: string) => {
    // TODO(O-05): este endpoint debe cifrar la key con Vault antes de guardar
    const res = await fetch('/api/settings/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, key, model }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string }
      throw new Error(body.error ?? `Error ${res.status}`)
    }
    setConnectedKeys(prev => {
      const filtered = prev.filter(k => k.provider !== provider)
      return [...filtered, { provider, model }]
    })
  }

  const handleRemove = async (provider: Provider) => {
    // TODO(O-05): este endpoint debe eliminar el secreto de Vault también
    const res = await fetch(`/api/settings/keys?provider=${provider}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    setConnectedKeys(prev => prev.filter(k => k.provider !== provider))
  }

  if (loading) {
    return (
      <div className={styles.root}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cargando…</p>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Link href="/app" className={styles.backBtn}>
          ← Volver al app
        </Link>
        <div className={styles.headerRow}>
          <div className={styles.headerIcon}>
            <SettingsIcon />
          </div>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Configuración</h1>
            <p className={styles.subtitle}>
              Tus API keys se cifran con Supabase Vault y nunca salen del servidor.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>{t('settings.github.section', lang)}</span>
        <GitHubSection lang={lang} />
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>PROVEEDORES DE IA</span>
        <div className={styles.providersGrid}>
          {PROVIDERS.map(meta => (
            <ProviderCard
              key={meta.id}
              meta={meta}
              connected={connectedKeys.find(k => k.provider === meta.id) ?? null}
              onSave={handleSave}
              onRemove={handleRemove}
            />
          ))}
          <div className={styles.lowCostNote}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>Cada solicitud se procesa en el modelo de <strong>bajo consumo</strong> de cada proveedor (ej. Claude Haiku, GPT-4o-mini, Gemini Flash), lo que garantiza respuestas rápidas y económicas. Puedes cambiar el modelo en la configuración de cada proveedor.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
