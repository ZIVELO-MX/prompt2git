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

**Fase activa:** 2 — Context Awareness
**Última actualización:** 2026-05-05

### Fase 1 completada ✅
Todas las tareas C-01 a C-14 y O-01 a O-12 terminadas. Cache semántico con pgvector (threshold 0.92), rate limiting diario (50 req/día, headers estándar), badge "⚡ Desde cache" en ResultCard, banner 429 + contador de queries restantes en la UI.

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
| C-15 | Repo picker en `/app/settings` — UI para elegir repo activo. Llama `/api/github/repos`. Guarda `{ owner, repo, branch }` en localStorage. | ✅ done |
| C-16 | Context strip en app — barra sutil bajo el topbar: `owner/repo @ branch` + último commit. Se oculta si no hay repo conectado. | ✅ done |
| C-17 | "Fix my repo" mode — toggle en InputCard entre modo normal y modo Fix. Modo Fix: textarea para pegar `git status` + descripción del problema. | ✅ done |
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
| 2 — Contexto | GitHub read-only + "Fix my repo" | 🔄 activa |
| 3 — Distribución | VS Code Extension | ⬜ |
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
- **C-15**: el repo picker solo aparece si el usuario tiene GitHub conectado (verificar con GET `/api/github/repos`). Si no está conectado, mostrar "Conectar GitHub" que redirige al login con `?provider=github`.
- **C-16**: el context strip debe ser no intrusivo — altura máx 32px, dismissible por sesión (localStorage). Si el repo no está conectado, no renderizar nada.
- **C-17**: el toggle Fix/Normal cambia el placeholder y añade el segundo textarea. El botón "Generar" llama `/api/github/fix` en modo Fix y `/api/generate` en modo normal.
- **C-18**: el tipo `Command` necesita campo opcional `steps?: Step[]` para el multi-comando. Si `steps` existe, `ResultCard` renderiza lista numerada en lugar del bloque único.
