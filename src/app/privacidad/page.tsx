import Link from 'next/link'
import type { Metadata } from 'next'
import styles from './privacidad.module.css'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Prompt2Git',
  description: 'Cómo Prompt2Git recopila, usa y protege tu información personal.',
  openGraph: {
    title: 'Política de Privacidad — Prompt2Git',
    description: 'Cómo Prompt2Git recopila, usa y protege tu información personal.',
  },
  twitter: {
    title: 'Política de Privacidad — Prompt2Git',
    description: 'Cómo Prompt2Git recopila, usa y protege tu información personal.',
  },
}

export default function PrivacidadPage() {
  return (
    <div className={styles.root}>

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
            <span className={styles.navWordmark}>Git<span>Speak</span></span>
          </Link>
          <Link href="/" className={styles.navBack}>← Volver al inicio</Link>
        </div>
      </nav>

      <div className={styles.content}>
        <div className={styles.container}>

          <div className={styles.eyebrow}>Legal</div>
          <h1 className={styles.title}>Política de <strong>Privacidad</strong></h1>
          <p className={styles.updated}>Última actualización: mayo de 2026</p>

          <div className={styles.highlight}>
            <p>
              <strong>Resumen:</strong> Recopilamos solo lo necesario para que GitSpeak funcione.
              No vendemos tus datos. Puedes eliminar tu cuenta y todos tus datos en cualquier momento
              escribiéndonos a <a href="mailto:contact@zivelo.dev">contact@zivelo.dev</a>.
            </p>
          </div>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Quiénes somos</h2>
            <p className={styles.text}>
              GitSpeak es un servicio operado por <strong>ZIVELO</strong> que convierte lenguaje natural
              en comandos Git usando inteligencia artificial. Puedes contactarnos en{' '}
              <a href="mailto:contact@zivelo.dev">contact@zivelo.dev</a>.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Datos que recopilamos</h2>
            <p className={styles.text}>Recopilamos únicamente los datos necesarios para prestar el servicio:</p>
            <ul className={styles.list}>
              <li>
                <strong>Email y perfil:</strong> cuando creas una cuenta con Magic Link o GitHub OAuth.
                En caso de GitHub, recibimos tu nombre público, avatar y email verificado.
              </li>
              <li>
                <strong>Historial de comandos:</strong> las solicitudes en lenguaje natural que escribes
                y los comandos Git generados, para mostrarte tu historial en la app.
              </li>
              <li>
                <strong>API keys (plan Pro):</strong> si usas BYOK, tu API key se almacena cifrada.
                Nunca la enviamos a terceros distintos del proveedor que tú elegiste.
              </li>
              <li>
                <strong>Datos de uso:</strong> proveedor de IA utilizado, latencia de respuesta y si
                la solicitud fue exitosa. No incluimos el contenido de tus prompts en estos registros.
              </li>
              <li>
                <strong>Cookies de sesión:</strong> utilizadas exclusivamente para mantenerte autenticado
                (Supabase Auth). No usamos cookies de tracking ni publicidad.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Cómo usamos tus datos</h2>
            <ul className={styles.list}>
              <li>Autenticarte y mantener tu sesión activa.</li>
              <li>Mostrar tu historial de comandos en todos tus dispositivos.</li>
              <li>Enviar tu solicitud al proveedor de IA configurado y devolverte el resultado.</li>
              <li>Aplicar los límites de uso del plan que tienes contratado.</li>
              <li>Enviarte el magic link de acceso a tu correo electrónico.</li>
              <li>Mejorar el servicio mediante métricas de uso agregadas y anonimizadas.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Con quién compartimos tus datos</h2>
            <p className={styles.text}>
              No vendemos ni alquilamos tus datos a terceros. Compartimos datos solo con los proveedores
              necesarios para operar el servicio:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>Supabase:</strong> base de datos, autenticación y almacenamiento de sesiones.
                Tus datos se almacenan en servidores de AWS (región us-east-1).
              </li>
              <li>
                <strong>Proveedores de IA (plan Starter):</strong> enviamos tu prompt al proveedor
                de IA incluido en el plan. Tu prompt no se usa para entrenar modelos bajo nuestros acuerdos.
              </li>
              <li>
                <strong>Tu proveedor de IA elegido (plan Pro — BYOK):</strong> tu prompt se envía
                directamente al proveedor que configuraste (Anthropic, OpenAI, Gemini, Groq, Mistral u OpenRouter).
                Quedan sujetos a sus propias políticas de privacidad.
              </li>
              <li>
                <strong>Vercel:</strong> plataforma de hosting donde se ejecuta GitSpeak.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Retención de datos</h2>
            <p className={styles.text}>
              Mantenemos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, borramos
              tu perfil, historial de comandos y API keys almacenadas en un plazo máximo de 30 días.
              Los registros de métricas anonimizadas pueden conservarse por más tiempo.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Tus derechos</h2>
            <p className={styles.text}>Tienes derecho a:</p>
            <ul className={styles.list}>
              <li>Acceder a los datos que tenemos sobre ti.</li>
              <li>Rectificar datos incorrectos.</li>
              <li>Eliminar tu cuenta y todos tus datos asociados.</li>
              <li>Exportar tu historial de comandos.</li>
              <li>Oponerte al procesamiento de tus datos en ciertos contextos.</li>
            </ul>
            <p className={styles.text}>
              Para ejercer cualquiera de estos derechos, escríbenos a{' '}
              <a href="mailto:contact@zivelo.dev">contact@zivelo.dev</a>.
              Respondemos en un plazo máximo de 7 días hábiles.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Seguridad</h2>
            <p className={styles.text}>
              Usamos HTTPS en todas las comunicaciones. Las API keys se almacenan cifradas en reposo.
              La autenticación se gestiona a través de Supabase Auth con tokens de sesión de corta duración.
              A pesar de estas medidas, ningún sistema es 100% seguro — te notificaremos en caso de
              una brecha que afecte tus datos.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Cambios a esta política</h2>
            <p className={styles.text}>
              Si realizamos cambios materiales a esta política, te lo notificaremos por email con al
              menos 15 días de anticipación. El uso continuado del servicio tras ese plazo implica
              aceptación de los cambios.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Contacto</h2>
            <p className={styles.text}>
              ¿Preguntas sobre privacidad? Escríbenos a{' '}
              <a href="mailto:contact@zivelo.dev">contact@zivelo.dev</a>.
            </p>
          </section>

        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <span className={styles.footerName}>Git<span>Speak</span> · ZIVELO © 2026</span>
            <ul className={styles.footerLinks}>
              <li><Link href="/">Inicio</Link></li>
              <li><a href="/terminos">Términos</a></li>
              <li><a href="mailto:contact@zivelo.dev">Contacto</a></li>
              <li><Link href="/app">App →</Link></li>
            </ul>
          </div>
        </div>
      </footer>

    </div>
  )
}
