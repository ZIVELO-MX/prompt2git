'use client'

import { useState } from 'react'
import type { FixResult } from '@/types'
import type { Lang } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import { CopyIcon, CheckIcon } from '@/components/ui/icons'
import styles from './fix-result-card.module.css'

interface Props {
  result: FixResult
  lang: Lang
}

const RISK_ORDER = { low: 0, medium: 1, high: 2 } as const

export function FixResultCard({ result, lang }: Props) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    })
  }

  const copyAll = () => {
    const all = result.steps.map(s => s.command).join('\n')
    navigator.clipboard.writeText(all).then(() => {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    })
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>⚕</span>
          <span className={styles.headerTitle}>{t('fix.result.title', lang)}</span>
          <span className={styles.stepCount}>{result.steps.length} pasos</span>
        </div>
        <button type="button" className={`${styles.copyAllBtn} ${copiedAll ? styles.copied : ''}`} onClick={copyAll}>
          {copiedAll ? <CheckIcon /> : <CopyIcon />}
          {copiedAll ? t('fix.result.copied', lang) : t('fix.result.copy_all', lang)}
        </button>
      </div>

      <ol className={styles.steps}>
        {result.steps
          .sort((a, b) => a.order - b.order)
          .map((step, i) => (
            <li key={i} className={styles.step}>
              <div className={styles.stepMeta}>
                <span className={styles.stepNum}>{step.order}</span>
                <span className={`${styles.riskBadge} ${styles[`risk_${step.risk}`]}`}>
                  {t(`fix.result.risk.${step.risk}`, lang)}
                </span>
              </div>
              <div className={styles.stepBody}>
                <div className={styles.stepCmd}>
                  <code>{step.command}</code>
                  <button
                    type="button"
                    className={`${styles.copyBtn} ${copiedIdx === i ? styles.copied : ''}`}
                    onClick={() => copy(step.command, i)}
                  >
                    {copiedIdx === i ? <CheckIcon /> : <CopyIcon />}
                  </button>
                </div>
                <p className={styles.stepDesc}>{step.description}</p>
              </div>
            </li>
          ))}
      </ol>

      <div className={styles.footer}>
        <span className={styles.footerNote}>
          Ejecuta los pasos en orden · Haz stash o backup antes de comandos de riesgo alto
        </span>
      </div>
    </div>
  )
}
