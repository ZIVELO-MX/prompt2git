'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Command } from '@/types'
import { GitIcon, HistoryIcon, SearchIcon } from '@/components/ui/icons'
import { timeAgo } from '@/components/ui/utils'
import styles from './sidebar.module.css'

interface ItemProps {
  item: Command
  active: boolean
  onSelect: (item: Command) => void
}

function HistoryItem({ item, active, onSelect }: ItemProps) {
  return (
    <button
      type="button"
      className={`${styles.item} ${active ? styles.active : ''}`}
      onClick={() => onSelect(item)}
    >
      <span className={styles.itemInput}>
        {item.input.length > 55 ? item.input.slice(0, 55) + '…' : item.input}
      </span>
      <span className={styles.itemMeta}>
        <code className={styles.itemCommand}>
          {item.command.length > 30 ? item.command.slice(0, 30) + '…' : item.command}
        </code>
        <span className={styles.itemTime}>{timeAgo(new Date(item.created_at).getTime())}</span>
      </span>
    </button>
  )
}

interface SidebarProps {
  history: Command[]
  activeId: string | null
  onSelect: (item: Command) => void
  onClear: () => void
}

export function Sidebar({ history, activeId, onSelect, onClear }: SidebarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Command[] | null>(null)
  const [searching, setSearching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null)
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/commands/search?q=${encodeURIComponent(q)}&limit=20`)
      if (!res.ok) return
      const data = await res.json() as { commands: Command[] }
      setResults(data.commands)
    } catch { /* ignore */ }
    setSearching(false)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(val), 300)
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const displayed = results ?? history

  return (
    <aside className={styles.aside}>
      <div className={styles.logo}>
        <GitIcon />
        <div>
          <div className={styles.logoText}>Prompt2Git</div>
          <div className={styles.logoSub}>Natural Language → Git</div>
        </div>
      </div>

      <div className={styles.searchWrap}>
        <SearchIcon />
        <input
          type="text"
          className={styles.searchInput}
          value={query}
          onChange={handleSearchChange}
          placeholder="Buscar en historial…"
          aria-label="Buscar comandos"
        />
        {searching && <span className={styles.searchSpinner} />}
      </div>

      <div className={styles.historyHeader}>
        <span className={styles.historyLabel}>
          <HistoryIcon /> {query ? 'RESULTADOS' : 'RECIENTES'}
        </span>
        {displayed.length > 0 && !query && (
          <button type="button" className={styles.clearBtn} onClick={onClear}>
            Limpiar
          </button>
        )}
      </div>

      <div className={styles.list}>
        {displayed.length === 0 ? (
          <p className={styles.empty}>
            {query ? 'Sin resultados para esta búsqueda' : 'Aún no hay comandos generados'}
          </p>
        ) : (
          displayed.map(item => (
            <HistoryItem
              key={item.id}
              item={item}
              active={item.id === activeId}
              onSelect={(selected) => {
                onSelect(selected)
                setQuery('')
                setResults(null)
              }}
            />
          ))
        )}
      </div>
    </aside>
  )
}
