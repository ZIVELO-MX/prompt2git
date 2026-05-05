'use client'

import { useState } from 'react'
import styles from './email-cta.module.css'

export function EmailCTA() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'done'>('idle')

  function handleSignup() {
    if (!email.trim() || !email.includes('@')) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
      return
    }
    setStatus('done')
  }

  return (
    <div className={styles.wrap}>
      <div className={`${styles.inputWrap} ${status === 'error' ? styles.inputError : ''}`}>
        <input
          id="cta-email"
          className={styles.input}
          type="email"
          placeholder={status === 'error' ? 'Ingresa un email válido' : 'tu@email.com'}
          value={status === 'done' ? '' : email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSignup()}
          disabled={status === 'done'}
        />
        <button
          className={styles.submit}
          onClick={handleSignup}
          disabled={status === 'done'}
          style={status === 'done' ? { background: 'var(--bg-elevated)', color: 'var(--accent)' } : {}}
        >
          {status === 'done' ? '✓ Registrado' : 'Unirme al beta →'}
        </button>
      </div>
      <p className={styles.note}>
        {status === 'done'
          ? '¡Te avisaremos pronto!'
          : 'Ya somos 340+ devs en beta · Respuesta en menos de 24h'}
      </p>
    </div>
  )
}
