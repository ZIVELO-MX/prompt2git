export type Lang = 'es' | 'en'

const STORAGE_KEY = 'p2g_lang'

const dict: Record<string, { es: string; en: string }> = {
  'app.title':                     { es: 'Describe lo que quieres hacer con Git',        en: 'Describe what you want to do with Git' },
  'app.aria.input':                { es: 'Describe la acción de Git en lenguaje natural', en: 'Describe the Git action in natural language' },
  'app.placeholder.0':             { es: 'deshacer el último commit sin perder cambios…', en: 'undo the last commit without losing changes…' },
  'app.placeholder.1':             { es: 'subir mi rama al remoto por primera vez…',      en: 'push my branch to remote for the first time…' },
  'app.placeholder.2':             { es: 'ver solo los commits de la última semana…',     en: 'see only commits from the last week…' },
  'app.placeholder.3':             { es: 'fusionar dos ramas sin crear un merge commit…', en: 'merge two branches without a merge commit…' },
  'app.placeholder.4':             { es: 'guardar mis cambios temporalmente y limpiar…',  en: 'stash my changes temporarily and clean up…' },
  'app.suggestion.0':              { es: 'deshacer último commit',                        en: 'undo last commit' },
  'app.suggestion.1':              { es: 'crear rama nueva',                              en: 'create new branch' },
  'app.suggestion.2':              { es: 'stash mis cambios',                             en: 'stash my changes' },
  'app.suggestion.3':              { es: 'ver log compacto',                              en: 'view compact log' },
  'app.generate':                  { es: 'Generar →',                                     en: 'Generate →' },
  'app.generating':                { es: 'Generando…',                                    en: 'Generating…' },
  'app.hint.shortcut':             { es: '⌘↵ para generar',                               en: '⌘↵ to generate' },
  'app.hint.queries_left':         { es: '⚠ {{n}} queries restantes hoy',                 en: '⚠ {{n}} queries left today' },
  'app.error.max_length':          { es: 'Máximo 280 caracteres.',                        en: 'Maximum 280 characters.' },
  'app.error.not_git':             { es: 'Esta instrucción no parece estar relacionada con Git.', en: 'This request does not seem to be related to Git.' },
  'app.error.generic':             { es: 'Ocurrió un error. Intenta de nuevo.',           en: 'An error occurred. Try again.' },
  'app.empty.hint':                { es: 'Escribe en lenguaje natural y obtén el comando Git correcto', en: 'Write in natural language and get the right Git command' },
  'app.edu_mode':                  { es: 'Modo Educativo',                                 en: 'Edu Mode' },
  'app.plans':                     { es: 'Planes',                                        en: 'Plans' },
  'app.theme.light':               { es: 'Cambiar a modo claro',                          en: 'Switch to light mode' },
  'app.theme.dark':                { es: 'Cambiar a modo oscuro',                         en: 'Switch to dark mode' },
  'app.settings':                  { es: 'Ajustes',                                       en: 'Settings' },
  'app.rate_limit.title':          { es: 'Límite diario alcanzado',                       en: 'Daily limit reached' },
  'app.rate_limit.resets_at':      { es: 'Se reinicia a las ',                            en: 'Resets at ' },
  'app.rate_limit.view_plans':     { es: 'Ver planes →',                                  en: 'View plans →' },
  'tweaks.section.interface':      { es: 'INTERFAZ',                                       en: 'INTERFACE' },
  'tweaks.label.sidebar':          { es: 'Sidebar de historial',                          en: 'History sidebar' },
  'tweaks.label.edu_mode':         { es: 'Modo Educativo',                                en: 'Edu Mode' },
  'tweaks.section.account':        { es: 'CUENTA',                                        en: 'ACCOUNT' },
  'tweaks.link.api_keys':          { es: '🔑 Configurar API keys',                        en: '🔑 Configure API keys' },
  'tweaks.button.logout':          { es: 'Cerrar sesión',                                 en: 'Sign out' },

  // ── Fix mode (C-17) ────────────────────────────────────────────────────────
  'app.fix.toggle':                { es: 'Fix my repo',                                   en: 'Fix my repo' },
  'app.fix.normal_toggle':         { es: 'Modo normal',                                   en: 'Normal mode' },
  'app.fix.status_placeholder':    { es: 'Pega el output de git status aquí…',            en: 'Paste git status output here…' },
  'app.fix.problem_placeholder':   { es: 'Describe el problema (ej: "borré la rama equivocada")…', en: 'Describe the problem (e.g. "deleted wrong branch")…' },
  'app.fix.status_label':          { es: 'git status',                                    en: 'git status' },
  'app.fix.problem_label':         { es: 'Problema',                                      en: 'Problem' },
  'app.fix.diagnose':              { es: 'Diagnosticar →',                                en: 'Diagnose →' },
  'app.fix.diagnosing':            { es: 'Diagnosticando…',                               en: 'Diagnosing…' },

  // ── Fix result card (C-18) ─────────────────────────────────────────────────
  'fix.result.title':              { es: 'Plan de recuperación',                          en: 'Recovery plan' },
  'fix.result.copy_all':           { es: 'Copiar todo',                                   en: 'Copy all' },
  'fix.result.copied':             { es: 'Copiado',                                       en: 'Copied' },
  'fix.result.step':               { es: 'Paso',                                          en: 'Step' },
  'fix.result.risk.low':           { es: 'Seguro',                                        en: 'Safe' },
  'fix.result.risk.medium':        { es: 'Moderado',                                      en: 'Moderate' },
  'fix.result.risk.high':          { es: 'Riesgo alto',                                   en: 'High risk' },

  // ── Context strip (C-16) ───────────────────────────────────────────────────
  'context.dismiss':               { es: 'Ocultar',                                       en: 'Hide' },
  'context.open_prs':              { es: '{{n}} PR abiertos',                             en: '{{n}} open PRs' },

  // ── Settings GitHub (C-15) ─────────────────────────────────────────────────
  'settings.github.section':       { es: 'REPOSITORIO GITHUB',                            en: 'GITHUB REPOSITORY' },
  'settings.github.desc':          { es: 'Conecta GitHub para usar el contexto de tu repo activo en la generación de comandos.', en: 'Connect GitHub to inject your active repo context into command generation.' },
  'settings.github.connect':       { es: 'Conectar GitHub →',                             en: 'Connect GitHub →' },
  'settings.github.connected_as':  { es: 'Conectado como',                                en: 'Connected as' },
  'settings.github.active_repo':   { es: 'Repositorio activo',                            en: 'Active repository' },
  'settings.github.no_repo':       { es: 'Ninguno seleccionado',                          en: 'None selected' },
  'settings.github.clear':         { es: 'Limpiar selección',                             en: 'Clear selection' },
  'settings.github.loading':       { es: 'Cargando repos…',                               en: 'Loading repos…' },
  'settings.github.error':         { es: 'No se pudieron cargar los repositorios.',       en: 'Could not load repositories.' },

  // ── Landing page ───────────────────────────────────────────────────────────
  'landing.nav.how':               { es: 'Cómo funciona',                                en: 'How it works' },
  'landing.nav.features':          { es: 'Features',                                     en: 'Features' },
  'landing.nav.compare':           { es: 'Comparativa',                                  en: 'Comparison' },
  'landing.nav.pricing':           { es: 'Pricing',                                      en: 'Pricing' },
  'landing.nav.cta':               { es: 'Únete →',                                     en: 'Join →' },
  'landing.hero.badge':            { es: 'Beta cerrada · IA incluida · Registro gratuito', en: 'Closed beta · AI included · Free signup' },
  'landing.hero.title':            { es: 'Escribe.<br /><em>Git</em> hace el resto.', en: 'Write.<br /><em>Git</em> does the rest.' },
  'landing.hero.sub':              { es: 'Describe lo que quieres hacer con tu repositorio en lenguaje natural y obtén el comando Git exacto, explicado línea por línea.', en: 'Describe what you want to do with your repo in natural language and get the exact Git command, explained line by line.' },
  'landing.hero.cta':              { es: 'Registrarme al beta',                           en: 'Join the beta' },
  'landing.stats.label':           { es: 'IA incluida en el plan Free · Mayo 2026',       en: 'AI included in the Free plan · May 2026' },
  'landing.stats.free_cmds':       { es: 'Comandos gratis',                               en: 'Free commands' },
  'landing.stats.ai_included':     { es: 'IA incluida · sin key',                         en: 'AI included · no key needed' },
  'landing.stats.response_time':   { es: 'Tiempo de respuesta',                           en: 'Response time' },
  'landing.stats.providers':       { es: 'Providers en Pro · BYOK',                       en: 'Providers in Pro · BYOK' },
  'landing.how.label':             { es: 'Cómo funciona',                                 en: 'How it works' },
  'landing.how.title':             { es: 'De intención a comando<br /><strong>en tres pasos</strong>', en: 'From intention to command<br /><strong>in three steps</strong>' },
  'landing.how.sub':               { es: 'Sin memorizar flags. Sin buscar en Stack Overflow. Sin cometer errores costosos.', en: 'Without memorizing flags. Without Stack Overflow. Without costly mistakes.' },
  'landing.features.label':        { es: 'Features',                                     en: 'Features' },
  'landing.features.title':        { es: 'Todo lo que necesitas<br /><strong>para dominar Git</strong>', en: 'Everything you need<br /><strong>to master Git</strong>' },
  'landing.features.exact_translation':    { es: 'Traducción exacta',                     en: 'Exact translation' },
  'landing.features.exact_translation_d':  { es: 'Generamos el comando preciso para tu intención, con los flags y argumentos correctos. Sin aproximaciones.', en: 'We generate the precise command for your intent, with the right flags and arguments. No approximations.' },
  'landing.features.history':              { es: 'Historial de sesión',                   en: 'Session history' },
  'landing.features.history_d':            { es: 'Todos tus comandos generados guardados y accesibles. Busca, reutiliza y adapta sin repetir tu intención.', en: 'All your generated commands saved and accessible. Search, reuse, and adapt without repeating yourself.' },
  'landing.features.edu':                  { es: 'Modo Educativo',                        en: 'Edu Mode' },
  'landing.features.edu_d':                { es: 'Activa el modo educativo y aprende el significado de cada flag con tooltips interactivos. <strong>20 comandos gratis al mes</strong> — ilimitado en Pro.', en: 'Enable edu mode and learn the meaning of each flag with interactive tooltips. <strong>20 free commands per month</strong> — unlimited on Pro.' },
  'landing.features.edu_badge':            { es: 'GRATIS',                                en: 'FREE' },
  'landing.features.validation':           { es: 'Validación de intención',               en: 'Intent validation' },
  'landing.features.validation_d':         { es: 'Si tu solicitud no es Git-relacionada, te lo indicamos. Sin comandos inventados ni alucinaciones peligrosas.', en: 'If your request is not Git-related, we tell you. No made-up commands or dangerous hallucinations.' },
  'landing.features.multi_provider':       { es: 'Multi-provider · Pro',                  en: 'Multi-provider · Pro' },
  'landing.features.multi_provider_d':     { es: 'En el plan Pro conecta tu propia API key (BYOK) del proveedor que prefieras: Anthropic, OpenAI, Gemini, Groq, Mistral u OpenRouter. Comandos ilimitados, tus costos.', en: 'On the Pro plan, bring your own API key (BYOK) from any provider: Anthropic, OpenAI, Gemini, Groq, Mistral or OpenRouter. Unlimited commands, your costs.' },
  'landing.features.sync_history':         { es: 'Historial sincronizado',                en: 'Synced history' },
  'landing.features.sync_history_d':       { es: 'Inicia sesión con Magic Link o GitHub y tu historial de comandos se sincroniza entre todos tus dispositivos.', en: 'Sign in with Magic Link or GitHub and your command history syncs across all your devices.' },
  'landing.compare.label':                 { es: 'Comparativa',                           en: 'Comparison' },
  'landing.compare.title':                 { es: 'Antes y después de<br /><strong>Prompt2Git</strong>', en: 'Before and after<br /><strong>Prompt2Git</strong>' },
  'landing.compare.sub':                   { es: 'El flujo de trabajo tradicional con Git tiene demasiada fricción para quienes están aprendiendo.', en: 'The traditional Git workflow has too much friction for those who are learning.' },
  'landing.compare.before_badge':          { es: 'SIN PROMPT2GIT',                        en: 'WITHOUT PROMPT2GIT' },
  'landing.compare.after_badge':           { es: '✓ CON PROMPT2GIT',                      en: '✓ WITH PROMPT2GIT' },
  'landing.compare.row1':                  { es: 'Buscar en Google <em>"git undo last commit"</em>, elegir entre 5 respuestas contradictorias', en: 'Search Google for <em>"git undo last commit"</em>, pick from 5 conflicting answers' },
  'landing.compare.row2':                  { es: 'Leer la documentación de <code>git reset</code> sin entender cuándo usar <code>--soft</code> vs <code>--hard</code>', en: 'Read the <code>git reset</code> docs without understanding when to use <code>--soft</code> vs <code>--hard</code>' },
  'landing.compare.row3':                  { es: 'Ejecutar el comando equivocado y perder cambios del working tree', en: 'Run the wrong command and lose working tree changes' },
  'landing.compare.row4':                  { es: 'Volver a buscar cómo deshacer el comando incorrecto', en: 'Search again for how to undo the wrong command' },
  'landing.compare.row5':                  { es: 'Escribes <em>"deshacer último commit manteniendo los cambios"</em> en español', en: 'Type <em>"undo last commit keeping changes"</em> in English' },
  'landing.compare.row6_pre':              { es: 'Obtienes ',                              en: 'Get ' },
  'landing.compare.row6_post':             { es: ' con explicación clara en segundos',      en: ' with a clear explanation in seconds' },
  'landing.compare.row7':                  { es: 'Activas Modo Educativo y entiendes exactamente qué hace cada flag antes de ejecutar', en: 'Enable Edu Mode and understand exactly what each flag does before running' },
  'landing.compare.row8':                  { es: 'Copias con un clic y ejecutas con confianza. El historial guarda el comando para reutilizar.', en: 'Copy with one click and run with confidence. History saves the command for reuse.' },
  'landing.testimonials.label':            { es: 'Comunidad beta',                        en: 'Beta community' },
  'landing.testimonials.title':            { es: 'Lo que dicen los<br /><strong>primeros usuarios</strong>', en: 'What our first<br /><strong>users are saying</strong>' },
  'landing.cta.title':                     { es: '¿Listo para ser<br /><strong>beta tester</strong>?', en: 'Ready to be a<br /><strong>beta tester</strong>?' },
  'landing.cta.sub':                       { es: 'Regístrate en la lista de espera y sé de los primeros en acceder. Te avisamos cuando abramos tu lugar — sin spam, sin compromisos.', en: 'Sign up for the waitlist and be among the first to get access. We\'ll notify you when your spot opens — no spam, no strings attached.' },
  'landing.cta.note':                      { es: 'Sin spam · Solo un aviso cuando abramos tu acceso · Gratis para beta testers', en: 'No spam · One email when your access opens · Free for beta testers' },
  'landing.footer.by':                     { es: 'By',                                       en: 'By' },
  'landing.stats.per_month':               { es: '/mes',                                     en: '/mo' },
  'landing.stats.second':                  { es: 's',                                         en: 's' },
  'landing.features.multi_provider_code':  { es: '6 providers · BYOK en Pro',                 en: '6 providers · BYOK in Pro' },
  'landing.terminal.title':                { es: 'PROMPT2GIT — bash',                        en: 'PROMPT2GIT — bash' },
  'landing.terminal.aria':                 { es: 'Terminal interactivo demostrando la generación de comandos Git', en: 'Interactive terminal showing Git command generation' },
  'landing.how.steps_label':               { es: 'Pasos para generar un comando Git',      en: 'Steps to generate a Git command' },
  'landing.beta.placeholder':              { es: 'tu@email.com',                           en: 'you@email.com' },
  'landing.beta.placeholder_error':        { es: 'Ingresa un email válido',                en: 'Enter a valid email' },
  'landing.beta.submit':                   { es: 'Registrarme →',                          en: 'Join waitlist →' },
  'landing.beta.done_btn':                 { es: '✓ ¡Listo!',                              en: '✓ You\'re in!' },
  'landing.beta.note':                     { es: 'Sin spam · Te avisamos cuando abramos acceso',  en: 'No spam · We\'ll notify you when access opens' },
  'landing.beta.note_done':               { es: '¡Anotado! Te avisamos en cuanto abramos tu lugar.',  en: 'Got it! We\'ll email you when your spot is ready.' },
  'landing.footer.privacidad':             { es: 'Privacidad',                             en: 'Privacy' },
  'landing.footer.terminos':               { es: 'Términos',                               en: 'Terms' },
  'landing.footer.app':                    { es: 'App →',                                 en: 'App →' },

  // ── How it works ───────────────────────────────────────────────────────────
  'landing.how.step1_title':               { es: 'Describe tu intención',                  en: 'Describe your intent' },
  'landing.how.step1_text':                { es: 'Escribe exactamente lo que quieres hacer con tu repositorio en lenguaje natural. No necesitas saber la sintaxis de Git ni recordar nombres de comandos.', en: 'Write exactly what you want to do with your repository in natural language. No need to know Git syntax or remember command names.' },
  'landing.how.step2_title':               { es: 'La IA interpreta y genera',              en: 'AI interprets & generates' },
  'landing.how.step2_text':                { es: 'Elige entre 6 proveedores (Anthropic, OpenAI, Gemini, Groq, Mistral, OpenRouter). Analizamos tu solicitud y generamos el comando preciso con los flags adecuados.', en: 'Choose from 6 providers (Anthropic, OpenAI, Gemini, Groq, Mistral, OpenRouter). We analyze your request and generate the precise command with the right flags.' },
  'landing.how.step3_title':               { es: 'Entiende y ejecuta',                     en: 'Understand & execute' },
  'landing.how.step3_text':                { es: 'Recibe el comando con explicación detallada y, en Modo Educativo, el significado exacto de cada flag. Copia con un clic y ejecuta con confianza.', en: 'Get the command with detailed explanation and, in Edu Mode, the exact meaning of each flag. Copy with one click and run with confidence.' },
  'landing.how.card1_prompt_prefix':       { es: 'necesito fusionar la rama ',            en: 'need to merge branch ' },
  'landing.how.card1_prompt_mid':          { es: ' en ',                                   en: ' into ' },
  'landing.how.card1_prompt_suffix':       { es: ' sin fast-forward para preservar el historial', en: ' without fast-forward to preserve history' },
  'landing.how.card2_title':              { es: 'analizando…',                             en: 'analyzing…' },
  'landing.how.card3_title':              { es: '✓ generado',                              en: '✓ generated' },
  'landing.how.card2_intent':              { es: 'Intención detectada:',                    en: 'Intent detected:' },
  'landing.how.card2_flag':                { es: 'Flag requerido:',                         en: 'Required flag:' },
  'landing.how.card2_branch':              { es: 'Rama origen:',                            en: 'Source branch:' },
  'landing.how.card3_explain':             { es: 'Crea un commit de merge explícito incluso si es posible hacer fast-forward, preservando el contexto de la rama en el historial.', en: 'Creates an explicit merge commit even when fast-forward is possible, preserving branch context in the history.' },

  // ── Terminal demo ──────────────────────────────────────────────────────────
  'landing.terminal.prompt':               { es: 'quiero deshacer mi último commit pero conservar los archivos', en: 'I want to undo my last commit but keep my files' },
  'landing.terminal.generated':            { es: 'COMANDO GENERADO',                       en: 'GENERATED COMMAND' },
  'landing.terminal.explanation_label':    { es: 'EXPLICACIÓN',                            en: 'EXPLANATION' },
  'landing.terminal.explanation':          { es: 'Mueve HEAD un commit hacia atrás conservando todos los cambios en el staging area. Perfecto para reescribir el mensaje de commit o añadir más cambios antes de confirmar.', en: 'Moves HEAD back one commit while keeping all changes in the staging area. Perfect for rewriting the commit message or adding more changes before committing.' },

  // ── Testimonials ───────────────────────────────────────────────────────────
  'landing.testi.1.quote':                 { es: 'Llevo 2 meses aprendiendo Git y siempre me trababa con los flags de reset. Prompt2Git me los explicó mejor que cualquier tutorial.', en: 'I\'ve been learning Git for 2 months and always got stuck with reset flags. Prompt2Git explained them better than any tutorial.' },
  'landing.testi.1.initials':             { es: 'AR',                                      en: 'AR' },
  'landing.testi.1.name':                 { es: 'Antonio Ramos',                           en: 'Antonio Ramos' },
  'landing.testi.1.role':                 { es: 'Dev Junior',                              en: 'Dev Junior' },
  'landing.testi.2.quote':                 { es: 'Finalmente puedo trabajar con ramas sin abrir Stack Overflow cada 5 minutos. El modo educativo es oro para el equipo.', en: 'I can finally work with branches without opening Stack Overflow every 5 minutes. Edu Mode is gold for the team.' },
  'landing.testi.2.initials':             { es: 'BR',                                      en: 'BR' },
  'landing.testi.2.name':                 { es: 'Benjamin Rodriguez',                       en: 'Benjamin Rodriguez' },
  'landing.testi.2.role':                 { es: 'Dev Junior · Oracle',                      en: 'Dev Junior · Oracle' },
  'landing.testi.3.quote':                 { es: 'Lo uso para onboarding de nuevos devs. Les digo que usen Prompt2Git las primeras semanas y aprenden los comandos sin fricción.', en: 'I use it for onboarding new devs. I tell them to use Prompt2Git the first few weeks and they learn commands without friction.' },
  'landing.testi.3.initials':             { es: 'SC',                                      en: 'SC' },
  'landing.testi.3.name':                 { es: 'Sofía Cárdenas',                           en: 'Sofía Cárdenas' },
  'landing.testi.3.role':                 { es: 'Engineering Manager · Colombia',           en: 'Engineering Manager · Colombia' },
}

export function getDict(): Record<string, { es: string; en: string }> {
  return dict
}

export function getStoredLang(): Lang {
  if (typeof window === 'undefined') return 'es'
  return (localStorage.getItem(STORAGE_KEY) as Lang) ?? 'es'
}

export function setStoredLang(lang: Lang): void {
  localStorage.setItem(STORAGE_KEY, lang)
}

export function t(key: string, lang: Lang, vars?: Record<string, string | number>): string {
  const entry = dict[key]
  if (!entry) return key
  let text = entry[lang]
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{{${k}}}`, String(v))
    }
  }
  return text
}
