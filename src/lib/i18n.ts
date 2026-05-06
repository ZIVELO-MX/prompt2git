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
