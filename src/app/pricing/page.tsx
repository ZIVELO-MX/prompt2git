'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './pricing.module.css'

interface PlanFeature {
  text: string
  highlight?: boolean
  muted?: boolean
}

const PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    tagline: 'Para aprender Git sin fricciones',
    monthly: '0',
    yearly: '0',
    note: 'Siempre gratis',
    cta: 'Empieza gratis',
    ctaStyle: 'ghost' as const,
    features: [
      { text: '20 comandos por mes', highlight: false },
      { text: '<strong>IA incluida</strong> · sin API key propia', highlight: false },
      { text: 'Comandos básicos (add, commit, push, merge)', highlight: false },
      { text: 'Modo Educativo · <strong>5 usos/semana</strong>', highlight: false },
      { text: 'Historial de sesión', highlight: false },
      { text: 'Comandos avanzados (rebase, reflog…)', muted: true },
      { text: 'BYOK · multi-provider', muted: true },
    ] satisfies PlanFeature[],
  },
  {
    id: 'pro',
    name: 'PRO',
    tagline: 'Para developers que usan Git a diario',
    monthly: '9',
    yearly: '7',
    note: 'Facturado mensualmente',
    noteYearly: 'Facturado anualmente · ahorras $24',
    cta: 'Empieza con Pro',
    ctaStyle: 'primary' as const,
    featured: true,
    tag: 'MÁS POPULAR',
    features: [
      { text: 'Comandos <strong>ilimitados</strong>', highlight: true },
      { text: '<strong>BYOK</strong> · 6 proveedores de IA (Anthropic, OpenAI, Gemini, Groq, Mistral, OpenRouter)', highlight: false },
      { text: 'Modo Educativo <strong>ilimitado</strong>', highlight: false },
      { text: 'Comandos avanzados (rebase, cherry-pick, reflog, bisect)', highlight: false },
      { text: 'Context awareness · rama + último commit', highlight: false },
      { text: '"Fix my repo" mode · diagnóstico inteligente', highlight: false },
      { text: 'Email prioritario · respuesta &lt; 24h', highlight: false },
    ] satisfies PlanFeature[],
  },
  {
    id: 'teams',
    name: 'TEAMS',
    tagline: 'Para equipos que estandarizan Git',
    monthly: '19',
    yearly: '15',
    note: 'Mínimo 3 usuarios · por usuario',
    cta: 'Disponible en V2',
    ctaStyle: 'disabled' as const,
    soon: 'PRÓXIMAMENTE',
    features: [
      { text: 'Todo lo de Pro', highlight: false },
      { text: 'Comandos compartidos entre el equipo', highlight: false },
      { text: 'Panel de admin · uso por miembro', highlight: false },
      { text: 'SSO (SAML / OIDC)', highlight: false },
      { text: 'Políticas de retención configurables', highlight: false },
      { text: 'Onboarding 1:1 dedicado', highlight: false },
      { text: 'SLA 99.9% uptime', highlight: false },
    ] satisfies PlanFeature[],
  },
]

const COMPARISON_ROWS = [
  { category: 'Generación de comandos', rows: [
    { label: 'Comandos por mes', desc: 'Traducciones NL→Git', starter: '20', pro: '∞', teams: '∞', proHighlight: true },
    { label: 'Proveedor de IA', desc: 'Quién provee el modelo de IA', starter: 'Incluido', pro: 'BYOK · tu elección', teams: 'BYOK · tu elección', proColor: 'green' },
    { label: 'API key propia (BYOK)', desc: 'Bring Your Own Key — 6 proveedores disponibles', starter: false, pro: true, teams: true },
    { label: 'Comandos básicos', desc: 'add, commit, push, pull, branch, merge', starter: true, pro: true, teams: true },
    { label: 'Comandos avanzados', desc: 'rebase, cherry-pick, reflog, bisect, worktree', starter: false, pro: true, teams: true },
  ]},
  { category: 'Aprendizaje', rows: [
    { label: 'Modo Educativo', desc: 'Tooltips por flag — usos semanales', starter: '5/sem', pro: '∞', teams: '∞', proColor: 'green' },
    { label: 'Quiz de práctica', desc: 'Ejercicios para fijar el aprendizaje', starter: false, pro: true, teams: true },
  ]},
  { category: 'Context Awareness', rows: [
    { label: 'Context de repo', desc: 'Rama actual + último commit', starter: false, pro: true, teams: true },
    { label: '"Fix my repo"', desc: 'Diagnóstico y comandos de recuperación', starter: false, pro: true, teams: true },
  ]},
  { category: 'Historial', rows: [
    { label: 'Historial de sesión', desc: 'Comandos de la sesión actual', starter: true, pro: true, teams: true },
    { label: 'Historial sincronizado', desc: 'Entre todos tus dispositivos', starter: false, pro: true, teams: true },
    { label: 'Exportar historial', desc: 'JSON o Markdown', starter: false, pro: true, teams: true },
  ]},
  { category: 'Equipo', rows: [
    { label: 'Comandos compartidos', desc: 'Biblioteca del equipo', starter: false, pro: false, teams: true },
    { label: 'Panel de admin', desc: 'Uso y métricas por miembro', starter: false, pro: false, teams: true },
    { label: 'SSO (SAML/OIDC)', desc: 'Single Sign-On empresarial', starter: false, pro: false, teams: true },
  ]},
  { category: 'Soporte', rows: [
    { label: 'Tipo de soporte', desc: 'Canal de ayuda disponible', starter: 'Comunidad', pro: 'Email prioritario', teams: 'Slack dedicado + Email', proColor: 'green' },
    { label: 'Tiempo de respuesta', desc: 'SLA de primera respuesta', starter: 'Best effort', pro: '< 24h', teams: '< 4h' },
    { label: 'Onboarding 1:1', desc: 'Sesión de configuración con el equipo', starter: false, pro: false, teams: true },
  ]},
]

const FAQS = [
  { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí. Puedes hacer upgrade o downgrade desde tu panel de cuenta. Si haces upgrade a Pro, el cambio es inmediato y se prorratea el costo. Si haces downgrade, el cambio aplica al final de tu ciclo de facturación actual.' },
  { q: '¿Qué pasa con mi historial si cancelo?', a: 'Mantenemos tu historial activo durante 90 días tras la cancelación. Puedes exportarlo como JSON o Markdown en cualquier momento. Si vuelves a suscribirte dentro de ese plazo, recuperas todo intacto.' },
  { q: '¿Necesito una API key para empezar?', a: 'No. El plan Starter incluye acceso a IA sin que necesites configurar nada — nosotros proveemos el modelo. Si actualizas a Pro, pasás al modelo BYOK (Bring Your Own Key): conectás tu propia API key del proveedor que prefieras (Anthropic, OpenAI, Gemini, Groq, Mistral u OpenRouter) y tenés comandos ilimitados. Tu key se almacena cifrada en Vault.' },
  { q: '¿Mis prompts y comandos son privados?', a: 'Sí. No usamos tu input para entrenar modelos. Los prompts se procesan vía tu proveedor con sus políticas. Tu historial se almacena cifrado y solo es accesible desde tu cuenta.' },
  { q: '¿Hay descuentos para estudiantes / OSS?', a: 'Sí. Ofrecemos Pro gratuito para proyectos open source activos y descuento del 50% para estudiantes verificados. Escríbenos a contact@zivelo.dev con tu caso.' },
  { q: '¿Cuándo llega el plan Teams?', a: 'Teams está planificado para V2 (Q3 2026). Si quieres acceso anticipado o un piloto para tu equipo, escríbenos a contact@zivelo.dev.' },
]

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className={styles.root}>

      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>
            <div className={styles.navLogoMark}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="12" cy="3" r="1.8" fill="oklch(0.75 0.22 142)" />
                <circle cx="12" cy="13" r="1.8" fill="oklch(0.75 0.22 142)" />
                <circle cx="4" cy="8" r="1.8" fill="oklch(0.75 0.22 142)" />
                <path d="M12 5v3M12 11V8M5.8 8h4.4" stroke="oklch(0.75 0.22 142)" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <span className={styles.navWordmark}>Prompt<span>2</span>Git</span>
          </Link>
          <ul className={styles.navLinks}>
            <li><a href="#planes">Planes</a></li>
            <li><a href="#comparativa">Comparativa</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <a href="/login" className={styles.navCta}>Empezar gratis →</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.eyebrow}>Pricing · V2 Preview</div>
          <h1 className={styles.heroTitle}>Planes para cada<br /><strong>tipo de developer</strong></h1>
          <p className={styles.heroSub}>Desde individuales aprendiendo Git hasta equipos que estandarizan flujos.</p>

          <div className={styles.billingToggle}>
            <div className={styles.toggleTrack}>
              <span className={`${styles.togglePill} ${billing === 'yearly' ? styles.togglePillRight : ''}`} />
              <button className={`${styles.toggleOpt} ${billing === 'monthly' ? styles.toggleOptActive : ''}`} onClick={() => setBilling('monthly')}>Mensual</button>
              <button className={`${styles.toggleOpt} ${billing === 'yearly' ? styles.toggleOptActive : ''}`} onClick={() => setBilling('yearly')}>Anual</button>
            </div>
            <span className={styles.discountBadge}>−2 meses gratis</span>
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className={styles.plansSection} id="planes">
        <div className={styles.container}>
          <div className={styles.plansGrid}>
            {PLANS.map(plan => (
              <div key={plan.id} className={`${styles.plan} ${plan.featured ? styles.planFeatured : ''}`}>
                {plan.tag && <span className={styles.planTag}>{plan.tag}</span>}
                {plan.soon && <span className={styles.planSoon}>{plan.soon}</span>}

                <div className={`${styles.planIcon} ${plan.id === 'pro' ? styles.planIconPro : plan.id === 'teams' ? styles.planIconTeams : styles.planIconStarter}`}>
                  {plan.id === 'starter' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10l4 4 8-8" stroke="oklch(0.72 0.16 240)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {plan.id === 'pro' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 2l2.4 5 5.6.8-4 3.9 1 5.5L10 14.5l-5 2.7 1-5.5-4-3.9 5.6-.8L10 2z" stroke="oklch(0.75 0.22 142)" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  )}
                  {plan.id === 'teams' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="7" cy="8" r="2.4" stroke="oklch(0.72 0.18 295)" strokeWidth="1.4" />
                      <circle cx="13" cy="8" r="2.4" stroke="oklch(0.72 0.18 295)" strokeWidth="1.4" />
                      <path d="M2 17c0-2.5 2.2-4.5 5-4.5M18 17c0-2.5-2.2-4.5-5-4.5M10 17c0-2.5 1.3-4.5 3-4.5s3 2 3 4.5" stroke="oklch(0.72 0.18 295)" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  )}
                </div>

                <div className={styles.planName}>{plan.name}</div>
                <div className={styles.planTagline}>{plan.tagline}</div>

                <div className={styles.planPrice}>
                  <span className={styles.priceCurrency}>$</span>
                  <span className={styles.priceAmount}>{billing === 'yearly' ? plan.yearly : plan.monthly}</span>
                  {plan.monthly !== '0' && <span className={styles.pricePeriod}>/mes</span>}
                </div>
                <div className={styles.priceNote}>
                  {billing === 'yearly' && plan.noteYearly ? plan.noteYearly : plan.note}
                </div>

                <button
                  className={`${styles.planCta} ${plan.ctaStyle === 'primary' ? styles.planCtaPrimary : plan.ctaStyle === 'disabled' ? styles.planCtaDisabled : styles.planCtaGhost}`}
                  disabled={plan.ctaStyle === 'disabled'}
                >
                  {plan.cta}
                </button>

                <ul className={styles.planFeatures}>
                  {plan.features.map((f: PlanFeature, i) => (
                    <li key={i} className={`${styles.planFeat} ${f.muted ? styles.planFeatMuted : ''}`}>
                      <span className={`${styles.featCheck} ${f.muted ? styles.featCheckMuted : ''}`}>
                        <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4l1.5 1.5L6.5 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: f.text }} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className={styles.comparisonSection} id="comparativa">
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Comparativa detallada</div>
          <h2 className={styles.sectionTitle}>Cada feature,<br /><strong>plan por plan</strong></h2>
          <p className={styles.sectionSub}>Sin letra pequeña. Sin sorpresas.</p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thFeature}>Feature</th>
                  <th className={styles.thStarter}>Starter<br /><span>$0</span></th>
                  <th className={`${styles.thPro} ${styles.thProFeatured}`}>Pro<br /><span>$9/mes</span></th>
                  <th className={styles.thTeams}>Teams<br /><span>$19/usuario</span></th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(group => (
                  <>
                    <tr key={group.category} className={styles.catRow}>
                      <td colSpan={4}>{group.category}</td>
                    </tr>
                    {group.rows.map((row, i) => (
                      <tr key={i}>
                        <td>
                          <div className={styles.featName}>{row.label}</div>
                          <div className={styles.featDesc}>{row.desc}</div>
                        </td>
                        <td>{renderCell(row.starter)}</td>
                        <td className={styles.tdProFeatured}>{renderCell(row.pro, row.proColor)}</td>
                        <td>{renderCell(row.teams)}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.faqSection} id="faq">
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Preguntas frecuentes</div>
          <h2 className={styles.sectionTitle}>Antes de elegir,<br /><strong>resuelve dudas</strong></h2>
          <div className={styles.faqGrid}>
            {FAQS.map((faq, i) => (
              <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <button className={styles.faqQ}>
                  {faq.q}
                  <svg className={styles.faqArrow} width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openFaq === i && <div className={styles.faqA}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div className={styles.footerLeft}>
              <span className={styles.footerName}>Prompt<span>2</span>Git</span>
              <span className={styles.footerCopy}>© 2026 · By ZIVELO</span>
            </div>
            <div className={styles.footerRight}>
              <a href="mailto:contact@zivelo.dev" className={styles.footerContact}>contact@zivelo.dev</a>
              <Link href="/" className={styles.footerLink}>Landing</Link>
              <Link href="/app" className={styles.footerLink}>App →</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

function renderCell(val: boolean | string | undefined, color?: string) {
  if (val === true) return <span className="cell-check" style={{ color: 'var(--accent)' }}>✓</span>
  if (val === false) return <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>−</span>
  return <span style={{ color: color === 'green' ? 'var(--accent)' : 'inherit' }}>{val}</span>
}
