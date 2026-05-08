'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Command } from '@/types'
import { GitIcon, HistoryIcon, SearchIcon } from '@/components/ui/icons'
import { timeAgo } from '@/components/ui/utils'
import { createClient } from '@/lib/supabase/client'
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
  favorites?: Command[]
  onToggleFavorite?: (item: Command) => void
}

export function Sidebar({ history, activeId, onSelect, onClear, favorites = [], onToggleFavorite }: SidebarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Command[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [userLabel, setUserLabel] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ghName = user.user_metadata?.user_name as string | undefined
      const fullName = user.user_metadata?.full_name as string | undefined
      setUserLabel(ghName ?? fullName ?? user.email ?? 'Usuario')
    })()
  }, [])

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
          <div className={styles.logoText}>GitSpeak</div>
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

      {/* Favoritos */}
      {favorites.length > 0 && !query && (
        <>
          <div className={styles.historyHeader}>
            <span className={styles.historyLabel}>★ FAVORITOS</span>
          </div>
          <div className={styles.favList}>
            {favorites.map(item => (
              <div key={item.id} className={styles.favItem}>
                <button
                  type="button"
                  className={`${styles.item} ${item.id === activeId ? styles.active : ''}`}
                  onClick={() => onSelect(item)}
                >
                  <span className={styles.itemInput}>
                    {item.input.length > 50 ? item.input.slice(0, 50) + '…' : item.input}
                  </span>
                  <span className={styles.itemMeta}>
                    <code className={styles.itemCommand}>
                      {item.command.length > 28 ? item.command.slice(0, 28) + '…' : item.command}
                    </code>
                  </span>
                </button>
                {onToggleFavorite && (
                  <button
                    type="button"
                    className={styles.favRemoveBtn}
                    onClick={() => onToggleFavorite(item)}
                    title="Quitar de favoritos"
                  >★</button>
                )}
              </div>
            ))}
          </div>
          <div className={styles.favDivider} />
        </>
      )}

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

      {userLabel && (
        <div className={styles.userSection}>
          <span className={styles.userAvatar}>{userLabel.charAt(0).toUpperCase()}</span>
          <span className={styles.userName}>{userLabel}</span>
        </div>
      )}
    </aside>
  )
}
