'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './onboarding.module.css'

const STORAGE_KEY = 'p2g_onboarded'

const STEPS = [
  {
    icon: '🌿',
    iconBg: 'var(--accent-dim)',
    iconBorder: 'oklch(0.75 0.22 142 / 0.3)',
    title: 'Bienvenido a Prompt2Git',
    description: 'Describe lo que quieres hacer con tu repositorio en español y obtén el comando Git exacto al instante. Sin memorizar flags.',
    hint: (
      <div>
        <div className={styles.hintLabel}>Ejemplo</div>
        <div className={styles.hintContent}>
          &quot;deshacer el último commit sin perder mis cambios&quot;
        </div>
      </div>
    ),
  },
  {
    icon: '🔑',
    iconBg: 'var(--amber-dim)',
    iconBorder: 'oklch(0.78 0.18 72 / 0.3)',
    title: 'Conecta tu API Key',
    description: 'Usa tu propia API key de Anthropic, OpenAI o Gemini. Tus costos, tu control. Las keys se cifran con Supabase Vault — nunca las ves en texto plano.',
    hint: (
      <div>
        <div className={styles.hintLabel}>Providers disponibles</div>
        <div className={styles.hintChips}>
          <span className={styles.chip}>Anthropic Claude</span>
          <span className={styles.chip}>OpenAI GPT</span>
          <span className={styles.chip}>Google Gemini</span>
        </div>
      </div>
    ),
  },
  {
    icon: '⚡',
    iconBg: 'var(--blue-dim)',
    iconBorder: 'oklch(0.72 0.16 240 / 0.3)',
    title: 'Listo para usar',
    description: 'Escribe tu intención, copia el comando, y activa Modo Educativo para entender cada flag antes de ejecutar. Tu historial se guarda automáticamente.',
    hint: (
      <div>
        <div className={styles.hintLabel}>Acciones rápidas</div>
        <div className={styles.hintChips}>
          <span className={styles.chip}>deshacer último commit</span>
          <span className={styles.chip}>crear rama nueva</span>
          <span className={styles.chip}>stash mis cambios</span>
        </div>
      </div>
    ),
  },
]

export function Onboarding() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else dismiss()
  }

  function back() {
    if (step > 0) setStep(s => s - 1)
  }

  if (!visible) return null

  const current = STEPS[step]
  if (!current) return null
  const isLast = step === STEPS.length - 1

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.stepIndicator}>
            {STEPS.map((_, i) => (
              <span key={i} className={`${styles.stepDot} ${i === step ? styles.stepDotActive : ''}`} />
            ))}
          </div>
          <button className={styles.skipBtn} onClick={dismiss}>Saltar</button>
        </div>

        <div className={styles.body}>
          <div
            className={styles.iconWrap}
            style={{ background: current.iconBg, border: `1px solid ${current.iconBorder}` }}
          >
            {current.icon}
          </div>
          <h2 className={styles.title}>{current.title}</h2>
          <p className={styles.description}>{current.description}</p>
          <div className={styles.hint}>{current.hint}</div>
        </div>

        <div className={styles.footer}>
          {step > 0 && (
            <button className={styles.btnBack} onClick={back}>← Atrás</button>
          )}
          {step === 1 ? (
            <Link href="/app/settings" style={{ flex: 1 }} onClick={dismiss}>
              <button className={styles.btnNext} style={{ width: '100%' }}>
                Ir a Settings →
              </button>
            </Link>
          ) : (
            <button className={styles.btnNext} onClick={next}>
              {isLast ? 'Empezar →' : 'Siguiente →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
