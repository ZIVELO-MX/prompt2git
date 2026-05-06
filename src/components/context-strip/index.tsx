'use client'

import { useEffect, useState } from 'react'
import type { GitHubContext } from '@/types'
import type { Lang } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import styles from './context-strip.module.css'

const REPO_KEY      = 'p2g_active_repo'
const DISMISSED_KEY = 'p2g_ctx_dismissed'

interface ActiveRepo { owner: string; repo: string; branch: string }

interface Props { lang: Lang }

export function ContextStrip({ lang }: Props) {
  const [repo, setRepo]           = useState<ActiveRepo | null>(null)
  const [ctx, setCtx]             = useState<GitHubContext | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY)) { setDismissed(true); return }
    const raw = localStorage.getItem(REPO_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as ActiveRepo
      setRepo(parsed)
      fetch(`/api/github/context?owner=${parsed.owner}&repo=${parsed.repo}&branch=${parsed.branch}`)
        .then(r => r.ok ? r.json() : null)
        .then((data: GitHubContext | null) => { if (data) setCtx(data) })
        .catch(() => {})
    } catch { /* malformed localStorage */ }
  }, [])

  if (dismissed || !repo) return null

  const commit = ctx?.last_commit
    ? ctx.last_commit.length > 48 ? ctx.last_commit.slice(0, 48) + '…' : ctx.last_commit
    : null

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className={styles.strip}>
      <div className={styles.left}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className={styles.gitIcon}>
          <circle cx="12" cy="3" r="1.8" fill="currentColor" />
          <circle cx="12" cy="13" r="1.8" fill="currentColor" />
          <circle cx="4" cy="8"  r="1.8" fill="currentColor" />
          <path d="M12 5v3M12 11V8M5.8 8h4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className={styles.repoPath}>{repo.owner}/{repo.repo}</span>
        <span className={styles.sep}>@</span>
        <span className={styles.branch}>{repo.branch}</span>
        {commit && (
          <>
            <span className={styles.sep}>·</span>
            <span className={styles.commit}>{commit}</span>
          </>
        )}
        {ctx?.open_prs_count != null && ctx.open_prs_count > 0 && (
          <span className={styles.prBadge}>
            {t('context.open_prs', lang, { n: ctx.open_prs_count })}
          </span>
        )}
      </div>
      <button type="button" className={styles.dismissBtn} onClick={dismiss}>
        {t('context.dismiss', lang)}
      </button>
    </div>
  )
}
