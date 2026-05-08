import Link from 'next/link'
import type { Metadata } from 'next'
import styles from './terminos.module.css'

export const metadata: Metadata = {
  title: 'Términos de Servicio — GitSpeak',
  description: 'Condiciones de uso del servicio GitSpeak operado por ZIVELO.',
}

export default function TerminosPage() {
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
          <h1 className={styles.title}>Términos de <strong>Servicio</strong></h1>
          <p className={styles.updated}>Última actualización: mayo de 2026</p>

          <div className={styles.highlight}>
            <p>
              <strong>Resumen:</strong> GitSpeak es un servicio de buena fe. Úsalo para aprender
              y trabajar con Git. No lo uses para hacer daño. Si tienes dudas,{' '}
              <a href="mailto:contact@zivelo.dev">escríbenos</a>.
            </p>
          </div>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Aceptación de los términos</h2>
            <p className={styles.text}>
              Al acceder o usar GitSpeak, aceptas estos Términos de Servicio y nuestra{' '}
              <Link href="/privacidad">Política de Privacidad</Link>. Si no estás de acuerdo,
              no uses el servicio. GitSpeak es operado por <strong>ZIVELO</strong>.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Descripción del servicio</h2>
            <p className={styles.text}>
              GitSpeak es una aplicación web que traduce instrucciones en lenguaje natural a comandos
              Git usando modelos de inteligencia artificial. El servicio incluye:
            </p>
            <ul className={styles.list}>
              <li>Traducción de lenguaje natural a comandos Git.</li>
              <li>Modo Educativo con explicación de flags y opciones.</li>
              <li>Historial de comandos sincronizado entre dispositivos.</li>
              <li>Context awareness: rama activa y último commit (plan Pro).</li>
              <li>Modo &quot;Fix my repo&quot; para diagnóstico de problemas Git (plan Pro).</li>
              <li>Soporte para múltiples proveedores de IA con clave propia — BYOK (plan Pro).</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Planes y límites de uso</h2>
            <p className={styles.text}>
              GitSpeak ofrece distintos planes con diferentes niveles de acceso:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>Plan Starter (gratuito):</strong> 20 comandos por mes, IA incluida,
                Modo Educativo con 5 usos por semana. Sin costo, siempre.
              </li>
              <li>
                <strong>Plan Pro ($9/mes o $7/mes anual):</strong> comandos ilimitados, BYOK,
                Modo Educativo ilimitado, comandos avanzados y context awareness.
              </li>
              <li>
                <strong>Plan Teams (próximamente):</strong> funcionalidades colaborativas para equipos.
              </li>
            </ul>
            <p className={styles.text}>
              Nos reservamos el derecho de ajustar los límites del plan gratuito con previo aviso de
              30 días. Los planes de pago mantienen sus condiciones durante el período contratado.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Uso aceptable</h2>
            <p className={styles.text}>Puedes usar GitSpeak para:</p>
            <ul className={styles.list}>
              <li>Aprender Git y sus comandos.</li>
              <li>Acelerar tu flujo de trabajo en proyectos propios o de tu equipo.</li>
              <li>Diagnosticar y resolver problemas en repositorios que administras.</li>
            </ul>
            <p className={styles.text}>No puedes usar GitSpeak para:</p>
            <ul className={styles.list}>
              <li>Generar comandos destinados a dañar repositorios de terceros sin autorización.</li>
              <li>Intentar eludir los límites de uso mediante bots, scripts o múltiples cuentas.</li>
              <li>Revender, redistribuir o sublicenciar el servicio sin autorización escrita de ZIVELO.</li>
              <li>Enviar contenido ilegal, ofensivo o que viole derechos de terceros.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. API keys propias (BYOK)</h2>
            <p className={styles.text}>
              Si usas el plan Pro con tu propia API key (Bring Your Own Key), eres responsable de:
            </p>
            <ul className={styles.list}>
              <li>Mantener tu clave segura y no compartirla.</li>
              <li>Los costos generados por el uso de tu clave en los proveedores de IA.</li>
              <li>Cumplir los términos de uso del proveedor de IA que elijas.</li>
            </ul>
            <p className={styles.text}>
              GitSpeak almacena tu API key cifrada y la usa exclusivamente para enviar tus solicitudes
              al proveedor configurado.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Pagos y cancelación</h2>
            <ul className={styles.list}>
              <li>Los planes de pago se cobran por adelantado (mensual o anual).</li>
              <li>Puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta.</li>
              <li>Al cancelar, mantendrás acceso al plan pagado hasta el final del período contratado.</li>
              <li>No emitimos reembolsos prorrateados por cancelaciones anticipadas, salvo que la ley aplicable lo exija.</li>
              <li>En caso de fallo técnico imputable a GitSpeak, evaluamos compensaciones caso por caso.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Propiedad intelectual</h2>
            <p className={styles.text}>
              GitSpeak y todos sus componentes (interfaz, lógica, marca) son propiedad de ZIVELO.
              Los comandos Git generados para ti son de uso libre — no reclamamos ningún derecho sobre ellos.
            </p>
            <p className={styles.text}>
              Al usar el servicio, no adquieres ninguna licencia sobre el código fuente de GitSpeak
              más allá de la necesaria para el uso normal de la aplicación.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Disponibilidad y cambios al servicio</h2>
            <p className={styles.text}>
              Nos esforzamos por mantener GitSpeak disponible, pero no garantizamos un uptime específico
              en el plan Starter. El plan Pro incluye soporte prioritario por email con respuesta en menos
              de 24 horas en días hábiles.
            </p>
            <p className={styles.text}>
              Podemos modificar, suspender o descontinuar funcionalidades con aviso previo razonable.
              En caso de descontinuación del servicio completo, notificaremos con al menos 60 días de anticipación.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Limitación de responsabilidad</h2>
            <p className={styles.text}>
              GitSpeak proporciona comandos Git generados por IA como sugerencias. Eres responsable
              de revisar y comprender cualquier comando antes de ejecutarlo en tu repositorio.
              ZIVELO no se hace responsable de pérdidas de datos, daños a repositorios u otros
              perjuicios derivados del uso o mal uso de los comandos generados.
            </p>
            <p className={styles.text}>
              En ningún caso la responsabilidad total de ZIVELO hacia ti superará el importe pagado
              por el servicio en los últimos 3 meses.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Cambios a estos términos</h2>
            <p className={styles.text}>
              Podemos actualizar estos términos periódicamente. Te notificaremos por email con al menos
              15 días de anticipación ante cambios materiales. El uso continuado del servicio tras
              ese plazo implica aceptación de los nuevos términos.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>11. Contacto</h2>
            <p className={styles.text}>
              ¿Preguntas sobre estos términos? Escríbenos a{' '}
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
              <li><Link href="/privacidad">Privacidad</Link></li>
              <li><a href="mailto:contact@zivelo.dev">Contacto</a></li>
              <li><Link href="/app">App →</Link></li>
            </ul>
          </div>
        </div>
      </footer>

    </div>
  )
}
