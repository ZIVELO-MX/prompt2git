'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HowItWorks } from '@/components/landing/how-it-works'
import { ClockIcon } from '@/components/ui/icons'
import { t, getStoredLang, setStoredLang, type Lang } from '@/lib/i18n'
import styles from './page.module.css'

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('es')

  useEffect(() => {
    const stored = getStoredLang()
    setLang(stored)
    document.documentElement.lang = stored
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  function toggleLang() {
    const next: Lang = lang === 'es' ? 'en' : 'es'
    setLang(next)
    setStoredLang(next)
  }

  return (
    <div className={styles.root}>

      {/* ── Nav ────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navLogo}>
            <div className={styles.navLogoMark}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="12" cy="3" r="1.8" fill="oklch(0.75 0.22 142)" />
                <circle cx="12" cy="13" r="1.8" fill="oklch(0.75 0.22 142)" />
                <circle cx="4" cy="8" r="1.8" fill="oklch(0.75 0.22 142)" />
                <path d="M12 5v3M12 11V8M5.8 8h4.4" stroke="oklch(0.75 0.22 142)" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <span className={styles.navWordmark}>Prompt<span>2</span>Git</span>
          </div>
          <ul className={styles.navLinks}>
            <li><a href="#como-funciona">{t('landing.nav.how', lang)}</a></li>
            <li><a href="#features">{t('landing.nav.features', lang)}</a></li>
            <li><a href="#comparativa">{t('landing.nav.compare', lang)}</a></li>
            <li><Link href="/pricing">{t('landing.nav.pricing', lang)}</Link></li>
          </ul>
          <div className={styles.navActions}>
            <button onClick={toggleLang} className={styles.langSwitch}>{lang === 'es' ? 'EN' : 'ES'}</button>
            <a href="/login" className={styles.navCta}>{t('landing.nav.cta', lang)}</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGrid} />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.badgeDot} />
              {t('landing.hero.badge', lang)}
            </div>
            <h1 className={styles.heroTitle} dangerouslySetInnerHTML={{ __html: t('landing.hero.title', lang) }} />
            <p className={styles.heroSub}>
              {t('landing.hero.sub', lang)}
            </p>
            <div className={styles.heroActions}>
              <a href="/login" className={styles.btnPrimary}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2l5 5-5 5M3 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t('landing.hero.cta', lang)}
              </a>

            </div>

            {/* Terminal demo */}
            <div className={styles.terminalWrap}>
              <div className={styles.terminal}>
                <div className={styles.terminalScan} />
                <div className={styles.terminalBar}>
                  <div className={styles.dot} style={{ background: 'oklch(0.65 0.20 22)' }} />
                  <div className={styles.dot} style={{ background: 'oklch(0.78 0.18 72)' }} />
                  <div className={styles.dot} style={{ background: 'oklch(0.72 0.20 142)' }} />
                  <span className={styles.terminalTitle}>PROMPT2GIT — bash</span>
                </div>
                <div className={styles.terminalBody}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>❯ </span>
                    <span>{t('landing.terminal.prompt', lang)}</span>
                  </div>
                  <hr className={styles.tSep} />
                  <div style={{ marginBottom: '10px' }}>
                    <span className={styles.tLabel}>{t('landing.terminal.generated', lang)}</span><br />
                    <span style={{ color: 'var(--text-muted)' }}>$ </span>
                    <span style={{ color: 'var(--accent)' }}>git reset </span>
                    <span style={{ color: 'var(--amber)' }}>--soft </span>
                    <span style={{ color: 'var(--blue)' }}>HEAD~1</span>
                  </div>
                  <hr className={styles.tSep} />
                  <div>
                    <span className={styles.tLabelAmber}>{t('landing.terminal.explanation_label', lang)}</span><br />
                    <span className={styles.tExplain}>{t('landing.terminal.explanation', lang)}</span>
                  </div>
                  <hr className={styles.tSep} />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>❯ </span>
                    <span className={styles.tCursor} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────── */}
      <div className={styles.proof}>
        <div className={styles.container}>
            <p className={styles.proofLabel}>{t('landing.stats.label', lang)}</p>
            <div className={styles.proofStats}>
              <div className={styles.statItem}>
                <span className={styles.statNum}>20<span>/mes</span></span>
                <span className={styles.statLbl}>{t('landing.stats.free_cmds', lang)}</span>
              </div>
              <div className={styles.statDiv} />
              <div className={styles.statItem}>
                <span className={styles.statNum}>✦</span>
                <span className={styles.statLbl}>{t('landing.stats.ai_included', lang)}</span>
              </div>
              <div className={styles.statDiv} />
              <div className={styles.statItem}>
                <span className={styles.statNum}>&lt;1<span>s</span></span>
                <span className={styles.statLbl}>{t('landing.stats.response_time', lang)}</span>
              </div>
              <div className={styles.statDiv} />
              <div className={styles.statItem}>
                <span className={styles.statNum}>6</span>
                <span className={styles.statLbl}>{t('landing.stats.providers', lang)}</span>
              </div>
            </div>
        </div>
      </div>

      <hr className={styles.divider} />

      {/* ── How it works ───────────────────────── */}
      <section id="como-funciona" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>{t('landing.how.label', lang)}</div>
          <h2 className={styles.sectionTitle} dangerouslySetInnerHTML={{ __html: t('landing.how.title', lang) }} />
          <p className={styles.sectionSub}>
            {t('landing.how.sub', lang)}
          </p>
          <HowItWorks lang={lang} />
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ── Features ───────────────────────────── */}
      <section id="features" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>{t('landing.features.label', lang)}</div>
          <h2 className={styles.sectionTitle} dangerouslySetInnerHTML={{ __html: t('landing.features.title', lang) }} />
          <div className={styles.featuresGrid}>
            <div className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: 'var(--accent-dim)', border: '1px solid oklch(0.75 0.22 142 / 0.25)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="oklch(0.75 0.22 142)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.featTitle}>{t('landing.features.exact_translation', lang)}</div>
              <p className={styles.featText}>{t('landing.features.exact_translation_d', lang)}</p>
              <div className={styles.featCode}>git reset --soft HEAD~1</div>
            </div>

            <div className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: 'var(--amber-dim)', border: '1px solid oklch(0.78 0.18 72 / 0.25)', color: 'oklch(0.78 0.18 72)' }}>
                <ClockIcon />
              </div>
              <div className={styles.featTitle}>{t('landing.features.history', lang)}</div>
              <p className={styles.featText}>{t('landing.features.history_d', lang)}</p>
            </div>

            <div className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: 'var(--blue-dim)', border: '1px solid oklch(0.72 0.16 240 / 0.25)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3L3 7l7 3.5L17 7 10 3z" stroke="oklch(0.72 0.16 240)" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M6 9v4c0 0 1.5 2 4 2s4-2 4-2V9" stroke="oklch(0.72 0.16 240)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.featTitleRow}>
                <div className={styles.featTitle}>{t('landing.features.edu', lang)}</div>
                <span className={styles.featBadgeFree}>{t('landing.features.edu_badge', lang)}</span>
              </div>
              <p className={styles.featText} dangerouslySetInnerHTML={{ __html: t('landing.features.edu_d', lang) }} />
            </div>

            <div className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: 'var(--purple-dim)', border: '1px solid oklch(0.72 0.18 295 / 0.25)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="6" width="14" height="10" rx="2" stroke="oklch(0.72 0.18 295)" strokeWidth="1.5" />
                  <path d="M7 6V5a3 3 0 016 0v1" stroke="oklch(0.72 0.18 295)" strokeWidth="1.5" />
                </svg>
              </div>
              <div className={styles.featTitle}>{t('landing.features.validation', lang)}</div>
              <p className={styles.featText}>{t('landing.features.validation_d', lang)}</p>
            </div>

            <div className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: 'var(--blue-dim)', border: '1px solid oklch(0.72 0.16 240 / 0.25)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="oklch(0.72 0.16 240)" strokeWidth="1.5"/>
                  <path d="M10 7v3l2 2" stroke="oklch(0.72 0.16 240)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className={styles.featTitle}>{t('landing.features.multi_provider', lang)}</div>
              <p className={styles.featText}>{t('landing.features.multi_provider_d', lang)}</p>
              <div className={styles.featCode}>6 providers · BYOK en Pro</div>
            </div>

            <div className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: 'var(--purple-dim)', border: '1px solid oklch(0.72 0.18 295 / 0.25)', color: 'oklch(0.72 0.18 295)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 8a5 5 0 0 0-9-2M5 12a5 5 0 0 0 9 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M14 3l2 3-3 2M6 17l-2-3 3-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.featTitle}>{t('landing.features.sync_history', lang)}</div>
              <p className={styles.featText}>{t('landing.features.sync_history_d', lang)}</p>
            </div>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ── Comparativa ────────────────────────── */}
      <section id="comparativa" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>{t('landing.compare.label', lang)}</div>
          <h2 className={styles.sectionTitle} dangerouslySetInnerHTML={{ __html: t('landing.compare.title', lang) }} />
          <p className={styles.sectionSub}>
            {t('landing.compare.sub', lang)}
          </p>
          <div className={styles.compareWrap}>
            <div className={styles.compareCol}>
              <div className={styles.compareHeader}>
                <span className={`${styles.compareBadge} ${styles.compareBadgeBefore}`}>{t('landing.compare.before_badge', lang)}</span>
              </div>
              <div className={styles.compareBody}>
                <div className={`${styles.compareRow} ${styles.compareRowBad}`}>
                  <span className={styles.iconBad}>✕</span>
                  <span dangerouslySetInnerHTML={{ __html: t('landing.compare.row1', lang) }} />
                </div>
                <div className={`${styles.compareRow} ${styles.compareRowBad}`}>
                  <span className={styles.iconBad}>✕</span>
                  <span dangerouslySetInnerHTML={{ __html: t('landing.compare.row2', lang) }} />
                </div>
                <div className={`${styles.compareRow} ${styles.compareRowBad}`}>
                  <span className={styles.iconBad}>✕</span>
                  <span>{t('landing.compare.row3', lang)}</span>
                </div>
                <div className={`${styles.compareRow} ${styles.compareRowBad}`}>
                  <span className={styles.iconBad}>✕</span>
                  <span>{t('landing.compare.row4', lang)}</span>
                </div>
              </div>
            </div>

            <div className={`${styles.compareCol} ${styles.compareColAfter}`}>
              <div className={styles.compareHeader}>
                <span className={`${styles.compareBadge} ${styles.compareBadgeAfter}`}>{t('landing.compare.after_badge', lang)}</span>
              </div>
              <div className={styles.compareBody}>
                <div className={`${styles.compareRow} ${styles.compareRowGood}`}>
                  <span className={styles.iconGood}>✓</span>
                  <span dangerouslySetInnerHTML={{ __html: t('landing.compare.row5', lang) }} />
                </div>
                <div className={`${styles.compareRow} ${styles.compareRowGood}`}>
                  <span className={styles.iconGood}>✓</span>
                  <span>{t('landing.compare.row6_pre', lang)}<code className={`${styles.codeInline} ${styles.codeGreen}`}>git reset --soft HEAD~1</code>{t('landing.compare.row6_post', lang)}</span>
                </div>
                <div className={`${styles.compareRow} ${styles.compareRowGood}`}>
                  <span className={styles.iconGood}>✓</span>
                  <span>{t('landing.compare.row7', lang)}</span>
                </div>
                <div className={`${styles.compareRow} ${styles.compareRowGood}`}>
                  <span className={styles.iconGood}>✓</span>
                  <span>{t('landing.compare.row8', lang)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ── Testimonials ───────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>{t('landing.testimonials.label', lang)}</div>
          <h2 className={styles.sectionTitle} dangerouslySetInnerHTML={{ __html: t('landing.testimonials.title', lang) }} />
          <div className={styles.testiGrid}>
            <div className={styles.testiCard}>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.testiQuote}>&quot;{t('landing.testi.1.quote', lang)}&quot;</p>
              <div className={styles.testiAuthor}>
                <div className={styles.testiAvatar} style={{ color: 'var(--accent)' }}>{t('landing.testi.1.initials', lang)}</div>
                <div>
                  <div className={styles.testiName}>{t('landing.testi.1.name', lang)}</div>
                  <div className={styles.testiRole}>{t('landing.testi.1.role', lang)}</div>
                </div>
              </div>
            </div>
            <div className={styles.testiCard}>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.testiQuote}>&quot;{t('landing.testi.2.quote', lang)}&quot;</p>
              <div className={styles.testiAuthor}>
                <div className={styles.testiAvatar} style={{ color: 'var(--blue)' }}>{t('landing.testi.2.initials', lang)}</div>
                <div>
                  <div className={styles.testiName}>{t('landing.testi.2.name', lang)}</div>
                  <div className={styles.testiRole}>{t('landing.testi.2.role', lang)}</div>
                </div>
              </div>
            </div>
            <div className={styles.testiCard}>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.testiQuote}>&quot;{t('landing.testi.3.quote', lang)}&quot;</p>
              <div className={styles.testiAuthor}>
                <div className={styles.testiAvatar} style={{ color: 'var(--amber)' }}>{t('landing.testi.3.initials', lang)}</div>
                <div>
                  <div className={styles.testiName}>{t('landing.testi.3.name', lang)}</div>
                  <div className={styles.testiRole}>{t('landing.testi.3.role', lang)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ── CTA ────────────────────────────────── */}
      <section className={styles.ctaSection} id="beta">
        <div className={styles.container}>
          <div className={styles.ctaBorder}>
            <div className={styles.ctaBg} />
            <h2 className={styles.ctaTitle} dangerouslySetInnerHTML={{ __html: t('landing.cta.title', lang) }} />
            <p className={styles.ctaSub}>{t('landing.cta.sub', lang)}</p>
            <a href="/login" className={styles.btnPrimary} style={{ fontSize: 15, padding: '14px 36px' }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M8 2l5 5-5 5M3 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t('landing.cta.btn', lang)}
            </a>
            <p className={styles.ctaNote} style={{ marginTop: 16 }}>{t('landing.cta.note', lang)}</p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div className={styles.footerLeft}>
              <div className={styles.navLogoMark}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="12" cy="3" r="1.8" fill="oklch(0.75 0.22 142)" />
                  <circle cx="12" cy="13" r="1.8" fill="oklch(0.75 0.22 142)" />
                  <circle cx="4" cy="8" r="1.8" fill="oklch(0.75 0.22 142)" />
                  <path d="M12 5v3M12 11V8M5.8 8h4.4" stroke="oklch(0.75 0.22 142)" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <span className={styles.footerName}>Prompt<span>2</span>Git</span>
              <span className={styles.footerCopy}>© 2026 · By <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>ZIVELO</strong></span>
            </div>
            <div className={styles.footerRight}>
              <div className={styles.socialLinks}>
                <a href="https://x.com/zivelomx" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className={styles.socialLink}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="https://www.instagram.com/zivelomex" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialLink}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
              <div className={styles.footerDivider} />
              <ul className={styles.footerLinks}>
                <li><a href="mailto:contact@zivelo.dev">contact@zivelo.dev</a></li>
                <li><Link href="/privacidad">{t('landing.footer.privacidad', lang)}</Link></li>
                <li><Link href="/terminos">{t('landing.footer.terminos', lang)}</Link></li>
                <li><Link href="/app">{t('landing.footer.app', lang)}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
