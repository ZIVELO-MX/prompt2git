'use client'

import { useState } from 'react'
import type { Flag } from '@/types'
import styles from './command-with-flags.module.css'

interface Props {
  command: string
  flags: Flag[]
  eduMode: boolean
}

export function CommandWithFlags({ command, flags, eduMode }: Props) {
  const [activeFlag, setActiveFlag] = useState<string | null>(null)

  if (!eduMode || flags.length === 0) {
    return <span className={styles.plain}>{command}</span>
  }

  const tokens = command.split(' ')

  return (
    <span className={styles.tokens}>
      {tokens.map((token, i) => {
        const flagInfo = flags.find(f => f.flag === token)
        const isGit    = i === 0 && token === 'git'
        const isSubcmd = i === 1

        const tokenClass = [
          styles.token,
          isGit          ? styles.tokenGit    : '',
          isSubcmd       ? styles.tokenSubcmd : '',
          flagInfo       ? styles.tokenFlag   : '',
        ].filter(Boolean).join(' ')

        return (
          <span key={i} className={styles.tokenWrapper}>
            <span
              className={tokenClass}
              onClick={() =>
                flagInfo
                  ? setActiveFlag(activeFlag === token ? null : token)
                  : undefined
              }
            >
              {token}
            </span>

            {flagInfo && activeFlag === token && (
              <span className={styles.tooltip}>
                <span className={styles.tooltipFlag}>{flagInfo.flag}</span>
                {flagInfo.meaning}
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
