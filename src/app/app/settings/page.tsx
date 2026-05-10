'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { GitHubRepo } from '@/types'
import { t, getStoredLang } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'
import styles from './settings.module.css'
import { GitHubIcon, SettingsIcon } from '@/components/ui/icons'

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

// ─── Settings Page ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [lang, setLang]                   = useState<Lang>('es')
  const [monthlyUsage, setMonthlyUsage]   = useState<{ used: number; limit: number; plan: string } | null>(null)

  useEffect(() => { setLang(getStoredLang()) }, [])

  useEffect(() => {
    fetch('/api/usage/month')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.limit) setMonthlyUsage(d) })
      .catch(() => {})
  }, [])

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
              Gestiona tu cuenta, plan y conexiones de GitHub.
            </p>
          </div>
        </div>
      </div>

      {monthlyUsage && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>PLAN ACTIVO</span>
          <div className={styles.planCard}>
            <div className={styles.planInfo}>
              <span className={styles.planName}>{monthlyUsage.plan.toUpperCase()}</span>
              <span className={styles.planUsage}>
                <span className={monthlyUsage.used >= monthlyUsage.limit - 4 ? styles.planUsageCritical : ''}>
                  {monthlyUsage.used}
                </span>
                /{monthlyUsage.limit} comandos este mes
              </span>
            </div>
            <div className={styles.planBar}>
              <div
                className={styles.planBarFill}
                style={{
                  width: `${Math.min(100, (monthlyUsage.used / monthlyUsage.limit) * 100)}%`,
                  background: monthlyUsage.used >= monthlyUsage.limit - 4 ? 'oklch(0.65 0.20 22)' : 'var(--accent)',
                }}
              />
            </div>
            {monthlyUsage.plan === 'starter' && (
              <Link href="/pricing" className={styles.planUpgradeBtn}>
                Upgrade a Pro — comandos ilimitados →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <span className={styles.sectionLabel}>{t('settings.github.section', lang)}</span>
        <GitHubSection lang={lang} />
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>PROVEEDORES DE IA (BYOK)</span>
        <div className={styles.comingSoonCard}>
          <div className={styles.comingSoonBadge}>Próximamente · Plan Pro</div>
          <p className={styles.comingSoonText}>
            Conecta tus propias API keys de Anthropic, OpenAI, Gemini, Groq, Mistral u OpenRouter para procesar tus solicitudes directamente — sin límites de uso.
          </p>
        </div>
      </div>
    </div>
  )
}
