'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '@/lib/i18n'
import styles from './quick-actions.module.css'

interface PopularCommand {
  input: string
  command: string
  count: number
}

interface Props {
  onSelect: (input: string) => void
  lang: Lang
}

export function QuickActions({ onSelect, lang }: Props) {
  const [popular, setPopular] = useState<PopularCommand[] | null>(null)

  useEffect(() => {
    fetch('/api/commands/popular')
      .then(r => r.ok ? r.json() as Promise<{ popular: PopularCommand[] }> : null)
      .then(d => { if (d?.popular) setPopular(d.popular) })
      .catch(() => {})
  }, [])

  // Ocultar si aún no hay datos o si la lista está vacía
  if (!popular || popular.length === 0) return null

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>
        {lang === 'es' ? 'Frecuentes' : 'Frequent'}
      </span>
      <div className={styles.chips}>
        {popular.map((p, i) => (
          <button
            key={i}
            type="button"
            className={styles.chip}
            onClick={() => onSelect(p.input)}
            title={p.command}
          >
            {p.input.length > 42 ? p.input.slice(0, 42) + '…' : p.input}
          </button>
        ))}
      </div>
    </div>
  )
}
