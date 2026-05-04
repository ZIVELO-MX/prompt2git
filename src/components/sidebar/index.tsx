'use client'

import type { Command } from '@/types'
import { GitIcon, HistoryIcon } from '@/components/ui/icons'
import { timeAgo } from '@/components/ui/utils'
import styles from './sidebar.module.css'

// ─── HistoryItem ─────────────────────────────────────────────────────────────

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

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  history: Command[]
  activeId: string | null
  onSelect: (item: Command) => void
  onClear: () => void
}

export function Sidebar({ history, activeId, onSelect, onClear }: SidebarProps) {
  return (
    <aside className={styles.aside}>
      <div className={styles.logo}>
        <GitIcon />
        <div>
          <div className={styles.logoText}>Prompt2Git</div>
          <div className={styles.logoSub}>Natural Language → Git</div>
        </div>
      </div>

      <div className={styles.historyHeader}>
        <span className={styles.historyLabel}>
          <HistoryIcon /> RECIENTES
        </span>
        {history.length > 0 && (
          <button type="button" className={styles.clearBtn} onClick={onClear}>
            Limpiar
          </button>
        )}
      </div>

      <div className={styles.list}>
        {history.length === 0 ? (
          <p className={styles.empty}>Aún no hay comandos generados</p>
        ) : (
          history.map(item => (
            <HistoryItem
              key={item.id}
              item={item}
              active={item.id === activeId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </aside>
  )
}
