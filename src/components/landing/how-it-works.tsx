'use client'

import { useState, useEffect } from 'react'
import { t, type Lang } from '@/lib/i18n'
import styles from './how-it-works.module.css'

export function HowItWorks({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive(n => (n + 1) % 3), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={styles.grid}>
      <div className={styles.steps}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${styles.step} ${active === i ? styles.stepActive : ''}`}
            onClick={() => setActive(i)}
          >
            <div className={styles.stepNum}>{i + 1}</div>
            <div>
              <div className={styles.stepTitle}>{t(`landing.how.step${i + 1}_title`, lang)}</div>
              <div className={styles.stepText}>{t(`landing.how.step${i + 1}_text`, lang)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.visual}>
        {active === 0 && (
          <div className={styles.card}>
            <div className={styles.cardBar}>
              <span className={styles.dot} style={{ background: 'oklch(0.65 0.20 22)' }} />
              <span className={styles.dot} style={{ background: 'oklch(0.78 0.18 72)' }} />
              <span className={styles.dot} style={{ background: 'oklch(0.72 0.20 142)' }} />
              <span className={styles.cardTitle}>prompt2git</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.prompt}>$ _</div>
              <div className={styles.inputBox}>
                &quot;{t('landing.how.card1_prompt_prefix', lang)}
                <code className={styles.codeAmber}>feature/login</code>
                {t('landing.how.card1_prompt_mid', lang)}
                <code className={styles.codeAmber}>main</code>
                {t('landing.how.card1_prompt_suffix', lang)}&quot;
              </div>
              <div className={styles.enterHint}>
                <div className={styles.hintLine} />
                <span className={styles.hintText}>Enter ↵</span>
                <div className={styles.hintLine} />
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className={styles.card}>
            <div className={styles.cardBar}>
              <span className={styles.dot} style={{ background: 'oklch(0.65 0.20 22)' }} />
              <span className={styles.dot} style={{ background: 'oklch(0.78 0.18 72)' }} />
              <span className={styles.dot} style={{ background: 'oklch(0.72 0.20 142)' }} />
              <span className={styles.cardTitle}>{t('landing.how.card2_title', lang)}</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.analysisRow}>
                <span className={styles.dotGreen} />
                <span className={styles.analysisText}>{t('landing.how.card2_intent', lang)} <strong>git merge</strong></span>
              </div>
              <div className={styles.analysisRow}>
                <span className={styles.dotAmber} />
                <span className={styles.analysisText}>{t('landing.how.card2_flag', lang)} <code className={styles.codeAmber}>--no-ff</code></span>
              </div>
              <div className={styles.analysisRow}>
                <span className={styles.dotBlue} />
                <span className={styles.analysisText}>{t('landing.how.card2_branch', lang)} <code className={styles.codeBlue}>feature/login</code></span>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className={styles.card}>
            <div className={styles.cardBar}>
              <span className={styles.dot} style={{ background: 'oklch(0.65 0.20 22)' }} />
              <span className={styles.dot} style={{ background: 'oklch(0.78 0.18 72)' }} />
              <span className={styles.dot} style={{ background: 'oklch(0.72 0.20 142)' }} />
              <span className={styles.cardTitleGreen}>{t('landing.how.card3_title', lang)}</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cmdBox}>
                <span className={styles.txMuted}>$ </span>
                <span className={styles.txGreen}>git merge </span>
                <span className={styles.txAmber}>--no-ff </span>
                <span className={styles.txBlue}>feature/login</span>
              </div>
              <p className={styles.cmdExplain}>
                {t('landing.how.card3_explain', lang)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
