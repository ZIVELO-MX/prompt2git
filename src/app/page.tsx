import Link from 'next/link'
import { HowItWorks } from '@/components/landing/how-it-works'
import styles from './page.module.css'

export default function LandingPage() {
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
            <li><a href="#como-funciona">Cómo funciona</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#comparativa">Comparativa</a></li>
          </ul>
            <a href="/login" className={styles.navCta}>Empezar ahora →</a>
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
              En producción · 6 proveedores de IA · Gratis
            </div>
            <h1 className={styles.heroTitle}>
              Escribe en español.<br />
              <em>Git</em> hace el resto.
            </h1>
            <p className={styles.heroSub}>
              Describe lo que quieres hacer con tu repositorio en lenguaje natural
              y obtén el comando Git exacto, explicado línea por línea.
            </p>
            <div className={styles.heroActions}>
              <a href="/login" className={styles.btnPrimary}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2l5 5-5 5M3 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Empezar ahora
              </a>
              <a href="/app" className={styles.btnGhost}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6.5 6C6.5 5.17 7.17 4.5 8 4.5s1.5.67 1.5 1.5c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="11.5" r="0.8" fill="currentColor" />
                </svg>
                Ir a la app
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
                    <span>quiero deshacer mi último commit pero conservar los archivos</span>
                  </div>
                  <hr className={styles.tSep} />
                  <div style={{ marginBottom: '10px' }}>
                    <span className={styles.tLabel}>COMANDO GENERADO</span><br />
                    <span style={{ color: 'var(--text-muted)' }}>$ </span>
                    <span style={{ color: 'var(--accent)' }}>git reset </span>
                    <span style={{ color: 'var(--amber)' }}>--soft </span>
                    <span style={{ color: 'var(--blue)' }}>HEAD~1</span>
                  </div>
                  <hr className={styles.tSep} />
                  <div>
                    <span className={styles.tLabelAmber}>EXPLICACIÓN</span><br />
                    <span className={styles.tExplain}>
                      Mueve HEAD un commit hacia atrás conservando todos los cambios<br />
                      en el staging area. Perfecto para reescribir el mensaje de commit<br />
                      o añadir más cambios antes de confirmar.
                    </span>
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
            <p className={styles.proofLabel}>Tu API key, tus reglas · Mayo 2026</p>
            <div className={styles.proofStats}>
              <div className={styles.statItem}>
                <span className={styles.statNum}>6</span>
                <span className={styles.statLbl}>Proveedores de IA</span>
              </div>
              <div className={styles.statDiv} />
              <div className={styles.statItem}>
                <span className={styles.statNum}>50<span>/día</span></span>
                <span className={styles.statLbl}>Comandos gratis</span>
              </div>
              <div className={styles.statDiv} />
              <div className={styles.statItem}>
                <span className={styles.statNum}>&lt;1<span>s</span></span>
                <span className={styles.statLbl}>Tiempo de respuesta</span>
              </div>
              <div className={styles.statDiv} />
              <div className={styles.statItem}>
                <span className={styles.statNum}>🔐</span>
                <span className={styles.statLbl}>Tu key, cifrada</span>
              </div>
            </div>
        </div>
      </div>

      <hr className={styles.divider} />

      {/* ── How it works ───────────────────────── */}
      <section id="como-funciona" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Cómo funciona</div>
          <h2 className={styles.sectionTitle}>
            De intención a comando<br /><strong>en tres pasos</strong>
          </h2>
          <p className={styles.sectionSub}>
            Sin memorizar flags. Sin buscar en Stack Overflow. Sin cometer errores costosos.
          </p>
          <HowItWorks />
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ── Features ───────────────────────────── */}
      <section id="features" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Features</div>
          <h2 className={styles.sectionTitle}>
            Todo lo que necesitas<br /><strong>para dominar Git</strong>
          </h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: 'var(--accent-dim)', border: '1px solid oklch(0.75 0.22 142 / 0.25)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="oklch(0.75 0.22 142)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.featTitle}>Traducción exacta</div>
              <p className={styles.featText}>Generamos el comando preciso para tu intención, con los flags y argumentos correctos. Sin aproximaciones.</p>
              <div className={styles.featCode}>git reset --soft HEAD~1</div>
            </div>

            <div className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: 'var(--amber-dim)', border: '1px solid oklch(0.78 0.18 72 / 0.25)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v6l4 2" stroke="oklch(0.78 0.18 72)" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="10" cy="10" r="7" stroke="oklch(0.78 0.18 72)" strokeWidth="1.5" />
                </svg>
              </div>
              <div className={styles.featTitle}>Historial de sesión</div>
              <p className={styles.featText}>Todos tus comandos generados guardados y accesibles. Busca, reutiliza y adapta sin repetir tu intención.</p>
            </div>

            <div className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: 'var(--blue-dim)', border: '1px solid oklch(0.72 0.16 240 / 0.25)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3L3 7l7 3.5L17 7 10 3z" stroke="oklch(0.72 0.16 240)" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M6 9v4c0 0 1.5 2 4 2s4-2 4-2V9" stroke="oklch(0.72 0.16 240)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.featTitle}>Modo Educativo</div>
              <p className={styles.featText}>Activa el modo educativo y aprende el significado de cada flag con tooltips interactivos. Ideal para juniors.</p>
            </div>

            <div className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: 'var(--purple-dim)', border: '1px solid oklch(0.72 0.18 295 / 0.25)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="6" width="14" height="10" rx="2" stroke="oklch(0.72 0.18 295)" strokeWidth="1.5" />
                  <path d="M7 6V5a3 3 0 016 0v1" stroke="oklch(0.72 0.18 295)" strokeWidth="1.5" />
                </svg>
              </div>
              <div className={styles.featTitle}>Validación de intención</div>
              <p className={styles.featText}>Si tu solicitud no es Git-relacionada, te lo indicamos. Sin comandos inventados ni alucinaciones peligrosas.</p>
            </div>

            <div className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: 'var(--purple-dim)', border: '1px solid oklch(0.72 0.18 295 / 0.25)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="oklch(0.72 0.18 295)" strokeWidth="1.5"/>
                  <path d="M10 7v3l2 2" stroke="oklch(0.72 0.18 295)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className={styles.featTitle}>Multi-provider</div>
              <p className={styles.featText}>Conectá tu API key del proveedor que prefieras: Anthropic, OpenAI, Gemini, Groq, Mistral u OpenRouter. Tú elegís.</p>
              <div className={styles.featCode}>6 proveedores disponibles</div>
            </div>

            <div className={styles.featCard}>
              <div className={styles.featIcon} style={{ background: 'var(--green-dim)', border: '1px solid oklch(0.76 0.22 142 / 0.25)' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="oklch(0.76 0.22 142)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.featTitle}>Historial sincronizado</div>
              <p className={styles.featText}>Iniciá sesión con Magic Link o GitHub y tu historial de comandos se sincroniza entre todos tus dispositivos.</p>
            </div>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* ── Comparativa ────────────────────────── */}
      <section id="comparativa" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Comparativa</div>
          <h2 className={styles.sectionTitle}>
            Antes y después de<br /><strong>Prompt2Git</strong>
          </h2>
          <p className={styles.sectionSub}>
            El flujo de trabajo tradicional con Git tiene demasiada fricción para quienes están aprendiendo.
          </p>
          <div className={styles.compareWrap}>
            <div className={styles.compareCol}>
              <div className={styles.compareHeader}>
                <span className={`${styles.compareBadge} ${styles.compareBadgeBefore}`}>SIN PROMPT2GIT</span>
              </div>
              <div className={styles.compareBody}>
                <div className={`${styles.compareRow} ${styles.compareRowBad}`}>
                  <span className={styles.iconBad}>✕</span>
                  <span>Buscar en Google <em>&quot;git undo last commit&quot;</em>, elegir entre 5 respuestas contradictorias</span>
                </div>
                <div className={`${styles.compareRow} ${styles.compareRowBad}`}>
                  <span className={styles.iconBad}>✕</span>
                  <span>Leer la documentación de <code className={styles.codeInline}>git reset</code> sin entender cuándo usar <code className={styles.codeInline}>--soft</code> vs <code className={styles.codeInline}>--hard</code></span>
                </div>
                <div className={`${styles.compareRow} ${styles.compareRowBad}`}>
                  <span className={styles.iconBad}>✕</span>
                  <span>Ejecutar el comando equivocado y perder cambios del working tree</span>
                </div>
                <div className={`${styles.compareRow} ${styles.compareRowBad}`}>
                  <span className={styles.iconBad}>✕</span>
                  <span>Volver a buscar cómo deshacer el comando incorrecto</span>
                </div>
              </div>
            </div>

            <div className={`${styles.compareCol} ${styles.compareColAfter}`}>
              <div className={styles.compareHeader}>
                <span className={`${styles.compareBadge} ${styles.compareBadgeAfter}`}>✓ CON PROMPT2GIT</span>
              </div>
              <div className={styles.compareBody}>
                <div className={`${styles.compareRow} ${styles.compareRowGood}`}>
                  <span className={styles.iconGood}>✓</span>
                  <span>Escribes <em>&quot;deshacer último commit manteniendo los cambios&quot;</em> en español</span>
                </div>
                <div className={`${styles.compareRow} ${styles.compareRowGood}`}>
                  <span className={styles.iconGood}>✓</span>
                  <span>Obtienes <code className={`${styles.codeInline} ${styles.codeGreen}`}>git reset --soft HEAD~1</code> con explicación clara en segundos</span>
                </div>
                <div className={`${styles.compareRow} ${styles.compareRowGood}`}>
                  <span className={styles.iconGood}>✓</span>
                  <span>Activas Modo Educativo y entiendes exactamente qué hace cada flag antes de ejecutar</span>
                </div>
                <div className={`${styles.compareRow} ${styles.compareRowGood}`}>
                  <span className={styles.iconGood}>✓</span>
                  <span>Copias con un clic y ejecutas con confianza. El historial guarda el comando para reutilizar.</span>
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
          <div className={styles.sectionLabel}>Comunidad beta</div>
          <h2 className={styles.sectionTitle}>
            Lo que dicen los<br /><strong>primeros usuarios</strong>
          </h2>
          <div className={styles.testiGrid}>
            <div className={styles.testiCard}>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.testiQuote}>&quot;Llevo 2 meses aprendiendo Git y siempre me trabo con los flags de reset. Prompt2Git me los explicó mejor que cualquier tutorial.&quot;</p>
              <div className={styles.testiAuthor}>
                <div className={styles.testiAvatar} style={{ color: 'var(--accent)' }}>AL</div>
                <div>
                  <div className={styles.testiName}>Andrea López</div>
                  <div className={styles.testiRole}>Dev Junior · Bootcamp LATAM</div>
                </div>
              </div>
            </div>
            <div className={styles.testiCard}>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.testiQuote}>&quot;Finalmente puedo trabajar con ramas sin abrir Stack Overflow cada 5 minutos. El modo educativo es oro para el equipo.&quot;</p>
              <div className={styles.testiAuthor}>
                <div className={styles.testiAvatar} style={{ color: 'var(--blue)' }}>BR</div>
                <div>
                  <div className={styles.testiName}>Benjamin Rodriguez</div>
                  <div className={styles.testiRole}>Dev Junior · Oracle</div>
                </div>
              </div>
            </div>
            <div className={styles.testiCard}>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.testiQuote}>&quot;Lo uso para onboarding de nuevos devs. Les digo que usen Prompt2Git las primeras semanas y aprenden los comandos sin fricción.&quot;</p>
              <div className={styles.testiAuthor}>
                <div className={styles.testiAvatar} style={{ color: 'var(--amber)' }}>SC</div>
                <div>
                  <div className={styles.testiName}>Sofía Cárdenas</div>
                  <div className={styles.testiRole}>Engineering Manager · Colombia</div>
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
            <h2 className={styles.ctaTitle}>
              ¿Listo para olvidar<br /><strong>los flags de Git</strong>?
            </h2>
            <p className={styles.ctaSub}>Conectá tu API key y empezá a usar Prompt2Git ahora. Sin espera, sin lista de espera.</p>
            <a href="/login" className={styles.btnPrimary} style={{ fontSize: 15, padding: '14px 36px' }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M8 2l5 5-5 5M3 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Empezar ahora — es gratis
            </a>
            <p className={styles.ctaNote} style={{ marginTop: 16 }}>Sin registro complicado · Magic Link o GitHub · 50 consultas gratis por día</p>
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
                <a href="#" aria-label="GitHub" className={styles.socialLink}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                </a>
                <a href="#" aria-label="X / Twitter" className={styles.socialLink}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="#" aria-label="LinkedIn" className={styles.socialLink}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
              </div>
              <div className={styles.footerDivider} />
              <ul className={styles.footerLinks}>
                <li><a href="#">Privacidad</a></li>
                <li><a href="#">Términos</a></li>
                <li><Link href="/app">App →</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
