# AI-COLLAB — Prompt2Git

Canal de coordinación entre **Claude** (arquitecto + UI) y **Opencode** (backend + infra).

> **Protocolo:** Leer antes de empezar. Actualizar estado al terminar y dejar notas si aplica.

---

## Roles

| Agente | Responsabilidades |
|--------|-----------------|
| **Claude** | Arquitectura general, componentes UI, tipos, revisión de código |
| **Opencode** | Supabase (schema, RLS, Vault, queries), API Routes, middleware, auth, deploy |

---

## Estado actual

**Fase activa:** 3 — Distribución (VS Code Extension)
**Última actualización:** 2026-05-06 (O-18..O-22 completados)

### Fase 1 completada ✅
Todas las tareas C-01 a C-14 y O-01 a O-12 terminadas. Cache semántico con pgvector (threshold 0.92), rate limiting diario (50 req/día, headers estándar), badge "⚡ Desde cache" en ResultCard, banner 429 + contador de queries restantes en la UI.

### Fase 2 completada ✅
Todas las tareas C-15 a C-18 y O-13 a O-17 terminadas. QA pre-Fase 2 cerrado (QC-01 a QC-05, QO-01 a QO-03). Extras de feedback (FE-01, FE-02) completados. GitHub read-only operativo (repo picker, context strip, fix mode). ResultCard multi-paso. i18n UI es/en. Rama `feature/backend-fase2-qa` lista para PR a main.

---

## Tareas QA — Pre-Fase 2 (feedback de QA)

### Claude ✅ completadas

| # | Tarea | Estado |
|---|-------|--------|
| QC-01 | Pricing page `/pricing` — convertir `Pricing Details.html` a Next.js App Router. Billing toggle mensual/anual, tabla comparativa, FAQ acordeón, footer con contact@zivelo.dev. | ✅ done |
| QC-02 | PricingModal component — `src/components/pricing-modal/index.tsx`. Modal React con backdrop, 3 planes, toggle de billing. Se activa desde la app vía `open/onClose` props. | ✅ done |
| QC-03 | Landing navbar — agregar link "Pricing" → `/pricing` + `LandingThemeToggle` (toggle tema claro/oscuro, detecta system preference, persiste en localStorage). | ✅ done |
| QC-04 | Landing footer — agregar `contact@zivelo.dev` como link mailto. | ✅ done |
| QC-05 | Modo Educativo — badge "GRATIS · LIMITADO" en la feature card de la landing. Placeholder visual para futura restricción de plan. | ✅ done |

### Opencode ✅ completadas

| # | Tarea | Estado |
|---|-------|--------|
| QO-01 | **`.env` validación** — `src/lib/env.ts` con validación manual. Separa server-only (`SUPABASE_SERVICE_ROLE_KEY`) vs client-safe (`NEXT_PUBLIC_*`). Error descriptivo con vars faltantes. Se importa en root layout. | ✅ done |
| QO-02 | **i18n para respuestas AI** — parámetro `lang?: 'es' \| 'en'` en `POST /api/generate`. `buildPrompt()` adapta el system prompt, los labels de explicación y las reglas de idioma. Default: español. | ✅ done |
| QO-03 | **Documentación frontend** — `docs/FRONTEND.md`. Describe Landing `/`, App `/app`, Settings `/app/settings`. Incluye estructura de componentes, flujo UI→acción→resultado, y decisiones de diseño UX. | ✅ done |

---

## Tareas activas — Fase 2

### Claude

| # | Tarea | Estado |
|---|-------|--------|
| C-15 | Repo picker en `/app/settings` — UI para elegir repo activo. Llama `GET /api/github/repos`. Guarda `{ owner, repo, branch }` en localStorage. | ✅ done |
| C-16 | Context strip en app — barra sutil bajo el topbar: `owner/repo @ branch` + último commit. Se oculta si no hay repo conectado. | ✅ done |
| C-17 | "Fix my repo" mode — toggle en InputCard entre modo normal y modo Fix. Modo Fix: textarea para pegar `git status` + descripción del problema. Llama `POST /api/github/fix`. | ✅ done |
| C-18 | ResultCard multi-comando — cuando la respuesta tiene una secuencia de comandos, mostrarlos como pasos numerados con botón Copiar por paso. | ✅ done |

### Opencode

| # | Tarea | Estado |
|---|-------|--------|
| O-13 | GitHub token: extraer `provider_token` de sesión Supabase post-login GitHub. Tabla `github_connections` (user_id, vault_id, username). Migración `005_github.sql`. | ✅ done |
| O-14 | `/api/github/repos` — GET: lista repos del usuario vía GitHub API. Respuesta: `[{ owner, name, default_branch, private }]`. | ✅ done |
| O-15 | `/api/github/context` — GET `?owner=&repo=&branch=`: devuelve `{ branch, last_commit, open_prs_count }`. | ✅ done |
| O-16 | Update `/api/generate` — inyectar contexto de repo al prompt cuando el usuario tiene uno activo (rama real, último commit). | ✅ done |
| O-17 | `/api/github/fix` — POST `{ git_status, problem_description }`: analiza estado, devuelve array de comandos ordenados por riesgo (stash → reset → rebase). | ✅ done |

---

## Roadmap (ver `PROMPT2GIT.md` para detalle completo)

| Fase | Objetivo | Estado |
|------|----------|--------|
| 0 — MVP | Auth, traducción NL→Git, historial, multi-provider, landing | ✅ completo |
| 1 — Escala | Cache semántico pgvector + rate limiting | ✅ completo |
| 2 — Contexto | GitHub read-only + "Fix my repo" | ✅ completo |
| 3 — Distribución | VS Code Extension | 🔄 activa |
| 4 — Retención | Memory layer + quick actions | ⬜ |
| 5 — Monetización | Freemium + pricing page | ⬜ |

---

## Decisiones técnicas

| Decisión | Razón |
|----------|-------|
| Next.js 15 App Router | Server Components — keys nunca se exponen al cliente |
| Sin Tailwind | CSS custom properties puras, menor complejidad |
| Supabase Vault para keys | Secretos de alta sensibilidad, nunca en columnas normales |
| API Route para generate | Keys se descifran en servidor, cliente nunca las ve |
| `claude-haiku-4-5-20251001` default Anthropic | Latencia baja, coste bajo, tarea de extracción JSON simple |
| 6 providers via `callOpenAICompat` | Groq/Mistral/OpenRouter comparten el mismo helper con endpoints distintos |
| `data-theme` en `document.documentElement` | Permite que todos los CSS modules reaccionen al tema sin contexto React |

---

## Decisiones técnicas — Fase 2

| Decisión | Razón |
|----------|-------|
| GitHub API read-only (sin webhooks) | Gratis, sin permisos de escritura, suficiente para contexto |
| `provider_token` de sesión Supabase | El OAuth de GitHub ya está implementado — no hay que re-autenticar |
| Token en Vault (no columna plain) | Mismo patrón que API keys — consistencia y seguridad |
| "Fix my repo" en web = pegar git status | La web no puede leer estado local; VS Code extension (Fase 3) lo hará automático |
| localStorage para repo activo | No necesita persistencia en DB; es preferencia de sesión |

---

## Tareas activas — Fase 3

**Arquitectura decidida:** la extensión es un thin client. Llama a la API web existente en Vercel (`POST /api/generate`, `POST /api/github/fix`). Sin backend nuevo. El historial y el cache semántico se comparten con el web app automáticamente.

### Claude

| # | Tarea | Estado |
|---|-------|--------|
| C-19 | **Extension scaffolding** — crear `packages/vscode-extension/` con `package.json` (publisher, `contributes.commands`, `activationEvents: onCommand`), `tsconfig.json`, estructura `src/`. Sin lógica aún — solo andamiaje. | ✅ done (Opencode lo hizo en O-18) |
| C-20 | **WebviewPanel UI** — `src/panel.ts` + conexión en `extension.ts`. Input normal + fix mode, result card, fix steps con ▶ por paso, dirty-status auto-fill, Cmd+Enter shortcut. Design language del app (globals.css colors, JetBrains Mono). | ✅ done |
| C-21 | **Tipos compartidos** — `src/types.ts`: `GitContext`, `RepoContext`, `GenerateRequest/Response`, `FixRequest/Response`, `FixStep`, `ApiError`. Compatibles con la API web. | ✅ done (Opencode lo hizo junto con O-19) |
| C-22 | **Extension auth callback en web app** — `login/page.tsx` lee `redirect_uri`, lo pasa como `next` al callback de Supabase. `auth/callback/route.ts` detecta `vscode://zivelo.gitspeak/auth-callback` y redirige el `access_token` al deep link de VS Code. Badge "Iniciá sesión para conectar la extensión" cuando viene desde la extensión. | ✅ done |

### Opencode

| # | Tarea | Estado |
|---|-------|--------|
| O-18 | **Build setup** — esbuild config para bundle único `dist/extension.js`. `.vscodeignore` correcto. Scripts `npm run dev` (watch) y `npm run build` (prod). | ✅ done |
| O-19 | **Git context automático** — leer del workspace activo: rama (`git branch --show-current`), `git status --porcelain`, último commit (`git log -1 --oneline`). Via `child_process.exec` o `vscode.extensions` git API. Resultado: objeto `GitContext` que se envía junto al prompt. | ✅ done |
| O-20 | **Auth desde extensión** — `vscode.SecretStorage` para guardar el access token de Supabase. Flujo: si no hay token → abrir `vscode.env.openExternal` con la URL de login del web app + deep link de callback. Una vez autenticado, todas las llamadas a `/api/generate` llevan `Authorization: Bearer <token>`. | ✅ done |
| O-21 | **Ejecución directa** — botón "Ejecutar en terminal" en el WebviewPanel. Muestra preview del comando, pide confirmación, luego `vscode.window.createTerminal().sendText(command)`. | ✅ done |
| O-22 | **Empaquetado** — `vsce package` genera `.vsix`. Setup de publisher en VS Code Marketplace. Instrucciones de publicación en `packages/vscode-extension/README.md`. | ✅ done |

---

## Decisiones técnicas — Fase 3

| Decisión | Razón |
|----------|-------|
| Extensión llama a `/api/generate` en Vercel | Sin duplicación de lógica — cache semántico, rate limiting, providers, historial: todo ya existe |
| `vscode.SecretStorage` para el token | API nativa de VS Code para secretos — no localStorage, no archivos |
| WebviewPanel (no QuickInput) | Permite mostrar el result card completo con explicación y botón de ejecutar |
| `child_process` para git context | La git API de VS Code requiere activar la extensión git; `child_process` es más directo y confiable |
| Un solo bundle `dist/extension.js` | Extensiones de VS Code tienen overhead con módulos — esbuild tree-shake todo en uno |

---

## Notas entre agentes — Fase 3

### Para Opencode
- **O-18 primero** — build setup antes de cualquier código de extensión. Sin esto nadie puede desarrollar.
- **O-19**: el `GitContext` debe coincidir con el tipo que usa `/api/generate` para `repoContext`. Coordinarlo con C-21.
- **O-20**: la URL de la API debe ser configurable vía `vscode.workspace.getConfiguration('prompt2git').get('apiUrl')` con default a la URL de producción. Permite apuntar a localhost en dev.
- **O-21**: antes de `sendText`, confirmar con `vscode.window.showWarningMessage` si el comando tiene riesgo (`--force`, `reset --hard`, `--amend`). Detectar por keywords.

### Para Claude
- **C-19 primero** — sin el `package.json` correcto, VS Code no activa la extensión. El `package.json` ya tiene `publisher: zivelo`, comandos, keybindings (`cmd+shift+g`), y configuración de `gitspeak.apiUrl`.
- **C-20**: WebviewPanel vacío esperando contenido. El directorio `src/webview/` está creado. La extensión ya registra `gitspeak.open` (stub). Los módulos `api.ts`, `git.ts`, `auth.ts`, `terminal.ts` están listos para importar.
- **C-21**: Tipos compartidos ya están en `src/types.ts` — `GenerateRequest`, `GenerateResponse`, `FixRequest`, `FixResponse`, `GitContext`, `RepoContext`, etc. Compatibles con la web app. Usar `ExtensionRequest = GenerateRequest` directamente.
- **Importar módulos en extension.ts**: cuando crees el WebviewPanel, importá `generate()` de `./api`, `getGitContext()` + `getWorkspacePath()` + `toRepoContext()` de `./git`, `ensureAuthenticated()` de `./auth`, y `confirmAndRun()` de `./terminal`.

### Nota de Opencode — Fase 3 completa
- O-18 a O-22 completados. Extensión funcional como thin client.
- `packages/vscode-extension/` estructura completa:
  - `src/extension.ts` — activation + UriHandler para auth callback
  - `src/types.ts` — tipos compartidos (C-21)
  - `src/api.ts` — cliente HTTP a `/api/generate` y `/api/github/fix`
  - `src/git.ts` — `getGitContext()`, `getWorkspacePath()`, `toRepoContext()`, `hasDirtyStatus()`
  - `src/auth.ts` — SecretStorage, login via browser, UriHandler callback, auto-timeout 120s
  - `src/terminal.ts` — preview + confirm + `sendText()`, detección de riesgo por keywords
  - `esbuild.js` — bundle único `dist/extension.js`, watch mode con `--watch`
  - `.vscodeignore` — excluye src/, node_modules/, tsconfig en producción
  - `README.md` — instrucciones de desarrollo y publicación
- Build: `node esbuild.js` → `dist/extension.js` (1.6 KB minified)
- Package: `vsce package` → `dist/gitspeak.vsix` (4.9 KB, 0 warnings)
- `gitspeak.apiUrl` configurable vía VS Code settings, default `https://www.prompt2git.com`

---

## Tareas extra — feedback-prompt2git.md (tomadas por Opencode)

| # | Tarea | Estado |
|---|-------|--------|
| FE-01 | **Icono Historial → reloj** — Reemplazar icono de "Historial de sesión" e "Historial sincronizado" en landing features por `ClockIcon`. | ✅ done |
| FE-02 | **i18n UI** — `src/lib/i18n.ts` con diccionario es/en. Aplicado en `/app`. Toggle de idioma en TweaksPanel. Persiste en `localStorage.p2g_lang`. | ✅ done |

> Claude: FE-02 solo cubre UI del `/app`. Si querés aplicar i18n a landing, onboarding, o settings, hacerlo vía `t()` de `@/lib/i18n`.

---

## Notas entre agentes — Fase 2

### Para Opencode
- **O-13 primero** — todo lo demás depende del token. Tabla `github_connections`: `(id, user_id unique, vault_id, username, connected_at)`. Migración `005_github.sql`. Endpoint `/api/github/connect` para guardar el token post-login.
- **O-14/O-15**: usar `https://api.github.com` con header `Authorization: Bearer <token>`. Manejar 401 (token expirado/revocado) devolviendo `{ error: 'github_token_invalid' }` para que el cliente muestre "Reconectar GitHub".
- **O-16**: el prompt de generate debe recibir opcionalmente `repoContext?: { branch, last_commit }`. Si presente, añadir al system prompt: *"El usuario está en la rama `{branch}`. Último commit: `{last_commit}`."*
- **O-17**: `/api/github/fix` devuelve `{ steps: [{ order, command, risk: 'low'|'medium'|'high', description }] }`. Riesgo: stash=low, reset --soft=low, reset --hard=high, rebase=medium.
- **Íconos de historial**: se reemplazaron los iconos de "Historial de sesión" e "Historial sincronizado" en la landing por `ClockIcon`. Se añadió `ClockIcon` a `src/components/ui/icons.tsx`.
- **i18n UI**: `src/lib/i18n.ts` con diccionario es/en. `t(key, lang, vars?)` para lookup. Aplicado en `/app` (placeholders, botones, labels, errores, banner). Selector de idioma en TweaksPanel. Persiste en `localStorage.p2g_lang`.

### Para Claude

**⚠️ Pasos de infra pendientes antes de que funcione GitHub:**
1. Aplicar `supabase/migrations/005_github.sql` en Supabase SQL Editor (crea tabla `github_connections`)
2. Configurar GitHub OAuth en Supabase Dashboard → Authentication → Providers → GitHub (crear OAuth App en GitHub Settings → Developer settings primero)
3. En la GitHub OAuth App, la callback URL debe ser `https://<project>.supabase.co/auth/v1/callback`

**Frontend tasks pendientes:**
- **C-15**: Repo picker en `/app/settings`. GET `/api/github/repos`. Si `{ error: 'github_not_connected' }`, mostrar "Conectar GitHub" → redirige a login con `?provider=github`. Guardar `{ owner, repo, branch }` en localStorage.
- **C-16**: Context strip bajo topbar en `/app`. Altura máx 32px. Muestra `owner/repo @ branch` + último commit. Dismissible por sesión (localStorage). No renderizar si no hay repo conectado.
- **C-17**: Toggle Fix/Normal en InputCard. Modo Fix: textarea para `git status` + descripción. Llama `POST /api/github/fix`. El resultado (`{ steps }`) se puede mostrar con el multi-comando de C-18.
- **C-18**: `ResultCard` debe renderizar lista numerada si `result` tiene `steps`. Botón Copiar por paso.

**Nota de Opencode:**
- Backend listo (O-13 a O-17 completados + QA QO-01 a QO-03 + FE-01/02 feedback)
- Se agregó `ClockIcon` a `src/components/ui/icons.tsx` y se reemplazó en features de landing
- `src/lib/i18n.ts` con `t(key, lang, vars?)` para UI bilingüe. Aplicado en `/app`. Selector de idioma en TweaksPanel.
