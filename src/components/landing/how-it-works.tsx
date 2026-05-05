'use client'

import { useState, useEffect } from 'react'
import styles from './how-it-works.module.css'

const STEPS = [
  {
    title: 'Describe tu intención',
    text: 'Escribe en español exactamente lo que quieres hacer con tu repositorio. No necesitas saber la sintaxis de Git ni recordar nombres de comandos.',
  },
  {
    title: 'La IA interpreta y genera',
    text: 'Elige entre 6 proveedores (Anthropic, OpenAI, Gemini, Groq, Mistral, OpenRouter). Analizamos tu solicitud y generamos el comando preciso con los flags adecuados.',
  },
  {
    title: 'Entiende y ejecuta',
    text: 'Recibe el comando con explicación detallada y, en Modo Educativo, el significado exacto de cada flag. Copia con un clic y ejecuta con confianza.',
  },
]

export function HowItWorks() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive(n => (n + 1) % 3), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={styles.grid}>
      <div className={styles.steps}>
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`${styles.step} ${active === i ? styles.stepActive : ''}`}
            onClick={() => setActive(i)}
          >
            <div className={styles.stepNum}>{i + 1}</div>
            <div>
              <div className={styles.stepTitle}>{step.title}</div>
              <div className={styles.stepText}>{step.text}</div>
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
                &quot;necesito fusionar la rama{' '}
                <code className={styles.codeAmber}>feature/login</code> en{' '}
                <code className={styles.codeAmber}>main</code> sin fast-forward para preservar el historial&quot;
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
              <span className={styles.cardTitle}>analizando…</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.analysisRow}>
                <span className={styles.dotGreen} />
                <span className={styles.analysisText}>Intención detectada: <strong>git merge</strong></span>
              </div>
              <div className={styles.analysisRow}>
                <span className={styles.dotAmber} />
                <span className={styles.analysisText}>Flag requerido: <code className={styles.codeAmber}>--no-ff</code></span>
              </div>
              <div className={styles.analysisRow}>
                <span className={styles.dotBlue} />
                <span className={styles.analysisText}>Rama origen: <code className={styles.codeBlue}>feature/login</code></span>
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
              <span className={styles.cardTitleGreen}>✓ generado</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cmdBox}>
                <span className={styles.txMuted}>$ </span>
                <span className={styles.txGreen}>git merge </span>
                <span className={styles.txAmber}>--no-ff </span>
                <span className={styles.txBlue}>feature/login</span>
              </div>
              <p className={styles.cmdExplain}>
                Crea un commit de merge explícito incluso si es posible hacer fast-forward, preservando el contexto de la rama en el historial.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
