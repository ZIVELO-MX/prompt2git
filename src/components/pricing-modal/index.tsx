'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './pricing-modal.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

const PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    tagline: 'Para aprender Git sin fricciones',
    monthly: '0', yearly: '0',
    note: 'Siempre gratis',
    noteYearly: 'Siempre gratis',
    cta: 'Plan actual',
    ctaStyle: 'ghost' as const,
    features: [
      '20 comandos por mes',
      'IA incluida · sin API key propia',
      'Modo Educativo (5 usos/semana)',
      'Comandos básicos',
      { text: 'Comandos avanzados', muted: true },
      { text: 'BYOK · multi-provider', muted: true },
    ],
  },
  {
    id: 'pro',
    name: 'PRO',
    tagline: 'Para developers que usan Git a diario',
    monthly: '9', yearly: '7',
    note: 'Facturado mensualmente',
    noteYearly: 'Anual · ahorras $24',
    cta: 'Empezar con Pro →',
    ctaStyle: 'primary' as const,
    tag: 'MÁS POPULAR',
    features: [
      'Comandos ilimitados',
      'BYOK · 6 proveedores de IA',
      'Modo Educativo ilimitado',
      'Comandos avanzados',
      'Context awareness',
      '"Fix my repo" mode',
    ],
  },
  {
    id: 'teams',
    name: 'TEAMS',
    tagline: 'Para equipos que estandarizan Git',
    monthly: '19', yearly: '15',
    note: 'Mínimo 3 usuarios',
    noteYearly: 'Anual · por usuario',
    cta: 'Disponible en V2',
    ctaStyle: 'disabled' as const,
    soon: true,
    features: [
      'Todo lo de Pro',
      'Comandos compartidos',
      'Panel de admin',
      'SSO (SAML/OIDC)',
      'Onboarding 1:1',
      'SLA 99.9%',
    ],
  },
]

export function PricingModal({ open, onClose }: Props) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className={styles.backdrop}
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Planes de Prompt2Git"
    >
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.eyebrow}>Planes · V2 Preview</div>
            <h2 className={styles.title} id="modal-title">Elige tu plan</h2>
            <p className={styles.sub}>Sin compromiso — cambia o cancela cuando quieras.</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.billingToggle}>
              <div className={styles.toggleTrack}>
                <span className={`${styles.togglePill} ${billing === 'yearly' ? styles.togglePillRight : ''}`} />
                <button className={`${styles.toggleOpt} ${billing === 'monthly' ? styles.toggleOptActive : ''}`} onClick={() => setBilling('monthly')}>Mensual</button>
                <button className={`${styles.toggleOpt} ${billing === 'yearly' ? styles.toggleOptActive : ''}`} onClick={() => setBilling('yearly')}>Anual</button>
              </div>
              {billing === 'yearly' && <span className={styles.saveBadge}>−2 meses gratis</span>}
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className={styles.plans}>
          {PLANS.map(plan => (
            <div key={plan.id} className={`${styles.plan} ${plan.id === 'pro' ? styles.planFeatured : ''}`}>
              {plan.tag && <span className={styles.planTag}>{plan.tag}</span>}
              {plan.soon && <span className={styles.planSoon}>PRÓXIMO</span>}

              <div className={styles.planName}>{plan.name}</div>
              <div className={styles.planTagline}>{plan.tagline}</div>

              <div className={styles.priceRow}>
                <span className={styles.priceCurrency}>$</span>
                <span className={styles.priceAmount}>{billing === 'yearly' ? plan.yearly : plan.monthly}</span>
                {plan.monthly !== '0' && <span className={styles.pricePeriod}>/mes</span>}
              </div>
              <div className={styles.priceNote}>{billing === 'yearly' ? plan.noteYearly : plan.note}</div>

              <button
                className={`${styles.planCta} ${plan.ctaStyle === 'primary' ? styles.planCtaPrimary : plan.ctaStyle === 'disabled' ? styles.planCtaDisabled : styles.planCtaGhost}`}
                disabled={plan.ctaStyle === 'disabled'}
                onClick={() => { if (plan.ctaStyle !== 'disabled') onClose() }}
              >
                {plan.cta}
              </button>

              <ul className={styles.features}>
                {plan.features.map((f, i) => {
                  const isMuted = typeof f === 'object' && 'muted' in f
                  const text = typeof f === 'string' ? f : f.text
                  return (
                    <li key={i} className={`${styles.feat} ${isMuted ? styles.featMuted : ''}`}>
                      <span className={`${styles.check} ${isMuted ? styles.checkMuted : ''}`}>
                        <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4l1.5 1.5L6.5 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      {text}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <span>Starter: IA incluida · Pro y Teams: BYOK</span>
            <span className={styles.sep}>·</span>
            <a href="/pricing" className={styles.footerLink} onClick={onClose}>Ver comparativa completa →</a>
          </div>
          <div className={styles.footerRight}>
            <span className={styles.liveDot} />
            <span>Precios en USD · IVA no incluido</span>
          </div>
        </div>
      </div>
    </div>
  )
}
