'use client'

import { useState } from 'react'
import type { Command } from '@/types'
import { CommandWithFlags } from '@/components/command-with-flags'
import { CopyIcon, CheckIcon, MortarboardIcon, ChevronDownIcon } from '@/components/ui/icons'
import styles from './result-card.module.css'

interface Props {
  result: Command
  eduMode: boolean
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export function ResultCard({ result, eduMode, isFavorite, onToggleFavorite }: Props) {
  const [copied, setCopied]           = useState(false)
  const [expanded, setExpanded]       = useState(true)

  const handleCopy = () => {
    navigator.clipboard.writeText(result.command).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={styles.root}>
      {/* Command block */}
      <div className={styles.codeCard}>
        <div className={styles.codeHeader}>
          <div className={styles.codeHeaderLeft}>
            <span className={styles.codeLabel}>BASH</span>
            {result.from_cache && (
              <span className={styles.cacheBadge}>⚡ Desde cache</span>
            )}
          </div>
          <div className={styles.codeHeaderActions}>
            {onToggleFavorite && (
              <button
                type="button"
                className={`${styles.starBtn} ${isFavorite ? styles.starred : ''}`}
                onClick={onToggleFavorite}
                title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                aria-pressed={isFavorite}
              >
                {isFavorite ? '★' : '☆'}
              </button>
            )}
            <button
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={handleCopy}
              type="button"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className={styles.codeBody}>
          <CommandWithFlags
            command={result.command}
            flags={result.flags}
            eduMode={eduMode}
          />
        </div>

        {eduMode && result.flags.length > 0 && (
          <div className={styles.eduHint}>
            <MortarboardIcon />
            Toca un flag en <span className={styles.eduHintCode}>naranja</span> para ver su significado
          </div>
        )}
      </div>

      {/* Explanation panel */}
      <div className={styles.explCard}>
        <button
          type="button"
          className={`${styles.explToggle} ${!expanded ? styles.collapsed : ''}`}
          onClick={() => setExpanded(e => !e)}
        >
          <span className={styles.explToggleLabel}>
            <span className={styles.explAccent}>✦</span>
            Explicación del comando
          </span>
          <span className={`${styles.explChevron} ${!expanded ? styles.rotated : ''}`}>
            <ChevronDownIcon />
          </span>
        </button>

        {expanded && (
          <div className={styles.explBody}>
            {result.explanation.map((item, i) => (
              <div key={i} className={styles.explItem}>
                <span className={styles.explItemLabel}>{item.what}</span>
                <span className={styles.explItemText}>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
