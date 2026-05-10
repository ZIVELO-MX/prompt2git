'use client'

import { useState, useRef } from 'react'
import { t, type Lang } from '@/lib/i18n'
import styles from './email-cta.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function EmailCTA({ lang = 'es' }: { lang?: Lang }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  async function handleSignup() {
    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error')
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setStatus('idle'), 2000)
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/beta/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, lang }),
      })
      if (res.ok) {
        setStatus('done')
      } else {
        setStatus('error')
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setStatus('idle'), 2000)
      }
    } catch {
      setStatus('error')
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setStatus('idle'), 2000)
    }
  }

  const isError = status === 'error'
  const isDone  = status === 'done'
  const isLoading = status === 'loading'

  return (
    <div className={styles.wrap}>
      <label htmlFor="cta-email" className={styles.srOnly}>{t('landing.beta.placeholder', lang)}</label>
      <div className={`${styles.inputWrap} ${isError ? styles.inputError : ''}`}>
        <input
          id="cta-email"
          className={styles.input}
          type="email"
          placeholder={isError
            ? t('landing.beta.placeholder_error', lang)
            : t('landing.beta.placeholder', lang)}
          value={isDone ? '' : email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !isLoading && !isDone) {
              e.preventDefault()
              handleSignup()
            }
          }}
          disabled={isDone || isLoading}
        />
        <button
          className={styles.submit}
          onClick={handleSignup}
          disabled={isDone || isLoading}
          style={isDone ? { background: 'var(--bg-elevated)', color: 'var(--accent)' } : {}}
        >
          {isDone ? t('landing.beta.done_btn', lang) : isLoading ? '…' : t('landing.beta.submit', lang)}
        </button>
      </div>
      <p className={styles.note}>
        {isDone ? t('landing.beta.note_done', lang) : t('landing.beta.note', lang)}
      </p>
    </div>
  )
}
