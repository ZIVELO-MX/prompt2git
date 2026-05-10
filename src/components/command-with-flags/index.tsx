'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { Flag } from '@/types'
import { combineFlags } from '@/lib/flag-knowledge'
import styles from './command-with-flags.module.css'

interface Props {
  command: string
  flags: Flag[]
  eduMode: boolean
}

/**
 * Busca el flag que corresponde a un token del comando.
 * Soporta flags con múltiples variantes como "-i, --interactive".
 */
function findFlagInfo(flags: Flag[], token: string): Flag | undefined {
  const exact = flags.find(f => f.flag === token)
  if (exact) return exact

  const partial = flags.find(f => {
    const variants = f.flag.split(',').map(v => v.trim())
    return variants.includes(token)
  })
  if (partial) return partial

  const startsWith = flags.find(f => {
    if (f.flag.includes('~') || f.flag.includes('<')) {
      const cleanFlag = f.flag.replace(/[<>]/g, '').replace(/n$/, '')
      return token.startsWith(cleanFlag)
    }
    return false
  })

  return startsWith
}

export function CommandWithFlags({ command, flags, eduMode }: Props) {
  const [activeFlag, setActiveFlag] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null)
  const tokenRefs = useRef<Map<string, HTMLSpanElement>>(new Map())

  const safeFlags = Array.isArray(flags) ? flags : []
  const allFlags = useMemo(() => combineFlags(safeFlags, command), [safeFlags, command])

  const openTooltip = useCallback((token: string, el: HTMLSpanElement | null) => {
    if (!el) return
    const rect = el.getBoundingClientRect()
    const tooltipWidth = 240
    const tooltipHeight = 80

    let left = rect.left + rect.width / 2 - tooltipWidth / 2
    let top = rect.top - tooltipHeight - 8

    if (left + tooltipWidth > window.innerWidth - 12) {
      left = window.innerWidth - tooltipWidth - 12
    }
    if (left < 12) {
      left = 12
    }
    if (top < 12) {
      top = rect.bottom + 8
    }

    setTooltipPos({ top, left })
    setActiveFlag(token)
  }, [])

  const closeTooltip = useCallback(() => {
    setActiveFlag(null)
    setTooltipPos(null)
  }, [])

  useEffect(() => {
    if (!activeFlag) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(`.${styles.tokenFlag}`) && !target.closest(`.${styles.tooltipFixed}`)) {
        closeTooltip()
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [activeFlag, closeTooltip])

  useEffect(() => {
    if (!activeFlag) return
    const handleScrollResize = () => {
      const el = tokenRefs.current.get(activeFlag)
      if (el) openTooltip(activeFlag, el)
    }
    window.addEventListener('scroll', handleScrollResize, true)
    window.addEventListener('resize', handleScrollResize)
    return () => {
      window.removeEventListener('scroll', handleScrollResize, true)
      window.removeEventListener('resize', handleScrollResize)
    }
  }, [activeFlag, openTooltip])

  if (!eduMode) {
    return <span className={styles.plain}>{command}</span>
  }

  const tokens = command.split(' ')

  return (
    <>
      <span className={styles.tokens}>
        {tokens.map((token, i) => {
          const flagInfo = findFlagInfo(allFlags, token)
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
                ref={el => {
                  if (el && flagInfo) tokenRefs.current.set(token, el)
                }}
                className={tokenClass}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!flagInfo) return
                  if (activeFlag === token) {
                    closeTooltip()
                  } else {
                    openTooltip(token, tokenRefs.current.get(token) ?? null)
                  }
                }}
              >
                {token}
              </span>
            </span>
          )
        })}
      </span>

      {activeFlag && tooltipPos && (() => {
        const flagInfo = findFlagInfo(allFlags, activeFlag)
        if (!flagInfo) return null
        return (
          <span
            className={styles.tooltipFixed}
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.tooltipFlag}>{flagInfo.flag}</span>
            {flagInfo.meaning}
          </span>
        )
      })()}
    </>
  )
}
