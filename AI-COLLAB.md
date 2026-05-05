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
**Última actualización:** 2026-05-04

### Fase 1 completada ✅
Todas las tareas C-01 a C-14 y O-01 a O-12 terminadas. Cache semántico con pgvector (threshold 0.92), rate limiting diario (50 req/día, headers estándar), badge "⚡ Desde cache" en ResultCard, banner 429 + contador de queries restantes en la UI.

---

## Tareas activas — Fase 2

### Claude

| # | Tarea | Estado |
|---|-------|--------|
| C-15 | Repo picker en `/app/settings` — UI para elegir repo activo. Llama `/api/github/repos`. Guarda `{ owner, repo, branch }` en localStorage. | ⬜ pendiente |
| C-16 | Context strip en app — barra sutil bajo el topbar: `owner/repo @ branch` + último commit. Se oculta si no hay repo conectado. | ⬜ pendiente (depende de O-15) |
| C-17 | "Fix my repo" mode — toggle en InputCard entre modo normal y modo Fix. Modo Fix: textarea para pegar `git status` + descripción del problema. | ⬜ pendiente (depende de O-17) |
| C-18 | ResultCard multi-comando — cuando la respuesta tiene una secuencia de comandos, mostrarlos como pasos numerados con botón Copiar por paso. | ⬜ pendiente (depende de O-17) |

### Opencode

| # | Tarea | Estado |
|---|-------|--------|
| O-13 | GitHub token: extraer `provider_token` de sesión Supabase post-login GitHub. Tabla `github_connections` (user_id, vault_id, username). Migración `005_github.sql`. | ⬜ pendiente |
| O-14 | `/api/github/repos` — GET: lista repos del usuario vía GitHub API. Respuesta: `[{ owner, name, default_branch, private }]`. | ⬜ pendiente (depende de O-13) |
| O-15 | `/api/github/context` — GET `?owner=&repo=&branch=`: devuelve `{ branch, last_commit, open_prs_count }`. | ⬜ pendiente (depende de O-13) |
| O-16 | Update `/api/generate` — inyectar contexto de repo al prompt cuando el usuario tiene uno activo (rama real, último commit). | ⬜ pendiente (depende de O-15) |
| O-17 | `/api/github/fix` — POST `{ git_status, problem_description }`: analiza estado, devuelve array de comandos ordenados por riesgo (stash → reset → rebase). | ⬜ pendiente (depende de O-13) |

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

## Notas entre agentes — Fase 2

### Para Opencode
- **O-13 primero** — todo lo demás depende del token. Tabla `github_connections`: `(id, user_id unique, vault_id, username, connected_at)`. Migración `005_github.sql`. Endpoint `/api/github/connect` para guardar el token post-login.
- **O-14/O-15**: usar `https://api.github.com` con header `Authorization: Bearer <token>`. Manejar 401 (token expirado/revocado) devolviendo `{ error: 'github_token_invalid' }` para que el cliente muestre "Reconectar GitHub".
- **O-16**: el prompt de generate debe recibir opcionalmente `repoContext?: { branch, last_commit }`. Si presente, añadir al system prompt: *"El usuario está en la rama `{branch}`. Último commit: `{last_commit}`."*
- **O-17**: `/api/github/fix` devuelve `{ steps: [{ order, command, risk: 'low'|'medium'|'high', description }] }`. Riesgo: stash=low, reset --soft=low, reset --hard=high, rebase=medium.

### Para Claude
- **C-15**: el repo picker solo aparece si el usuario tiene GitHub conectado (verificar con GET `/api/github/repos`). Si no está conectado, mostrar "Conectar GitHub" que redirige al login con `?provider=github`.
- **C-16**: el context strip debe ser no intrusivo — altura máx 32px, dismissible por sesión (localStorage). Si el repo no está conectado, no renderizar nada.
- **C-17**: el toggle Fix/Normal cambia el placeholder y añade el segundo textarea. El botón "Generar" llama `/api/github/fix` en modo Fix y `/api/generate` en modo normal.
- **C-18**: el tipo `Command` necesita campo opcional `steps?: Step[]` para el multi-comando. Si `steps` existe, `ResultCard` renderiza lista numerada en lugar del bloque único.
