# AI-COLLAB — GitSpeak

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

**Fase activa:** 4 — Retención (Memory layer + quick actions)
**Última actualización:** 2026-05-07

### Fases completadas
- **Fase 0 ✅** — Auth, traducción NL→Git, historial, multi-provider, landing
- **Fase 1 ✅** — Cache semántico pgvector (threshold 0.92), rate limiting (50 req/día), badge "⚡ Desde cache", banner 429
- **Fase 2 ✅** — GitHub read-only, context strip, Fix my repo mode, ResultCard multi-paso, i18n es/en
- **Fase 3 ✅** — VS Code Extension: thin client en `packages/vscode-extension/`, auth via SecretStorage, git context automático, ejecución directa en terminal, empaquetado VSIX

### Completado 2026-05-07 (Claude — fuera de fase)
- `middleware.ts` restaurado (había sido eliminado — `/app` quedó sin protección de auth)
- Landing: social icons → solo X e Instagram, `EmailCTA` redirige a `/login`
- `layout.tsx` metadata: "Prompt2Git" → "GitSpeak"
- Páginas `/privacidad` y `/terminos` creadas con diseño del sistema
- Login: checkbox de aceptación de Términos + Privacidad obligatorio para ambos métodos de auth

---

## Roadmap

| Fase | Objetivo | Estado |
|------|----------|--------|
| 0 — MVP | Auth, traducción NL→Git, historial, multi-provider, landing | ✅ completo |
| 1 — Escala | Cache semántico pgvector + rate limiting | ✅ completo |
| 2 — Contexto | GitHub read-only + "Fix my repo" | ✅ completo |
| 3 — Distribución | VS Code Extension | ✅ completo |
| 4 — Retención | Memory layer + quick actions | 🔄 activa |
| 5 — Monetización | Stripe + enforcement de planes + subscriptions | ⬜ |

---

## Tareas activas — Fase 4

### Claude

| # | Tarea | Estado |
|---|-------|--------|
| C-23 | **Quick Actions bar** — barra horizontal bajo el input con los 5 comandos más frecuentes del usuario. Click pre-llena el input. Se hidrata desde `GET /api/commands/popular`. Skeleton si carga, oculta si usuario nuevo. | ✅ done |
| C-24 | **Favoritos** — botón estrella (⭐) en ResultCard e ítems de historial. Sidebar: sección "Favoritos" sobre el historial general. Optimistic UI — actualiza local antes de confirmar API. Llama `POST/DELETE /api/favorites`. | ✅ done |
| C-25 | **Usage indicator** — en topbar del app: badge con comandos restantes del mes ("18/20"). Badge rojo si <5. Al llegar a 0, modal de upgrade (reutilizar `PricingModal`). Solo visible en plan Starter. | ✅ done |
| C-26 | **Settings: plan badge** — en `/app/settings`, sección "Plan activo" con nombre del plan, comandos usados/mes y CTA de upgrade si Starter. Datos desde `GET /api/usage/month`. | ✅ done |

### Opencode

| # | Tarea | Estado |
|---|-------|--------|
| O-23 | **Tabla `user_favorites`** — `(id, user_id, command_id, input, command, explanation, provider, model, created_at)` con RLS. Migración `006_favorites.sql`. Endpoints: `GET /api/favorites`, `POST /api/favorites`, `DELETE /api/favorites?id=`. | ✅ |
| O-24 | **Usage tracking + popular** — `GET /api/usage/month` → `{ used, limit: 20, plan }`. `GET /api/commands/popular` → top 5 del historial por frecuencia (agrupado por comando, no global). | ✅ |
| O-25 | **Enforce límite Starter** — `rate-limit.ts` cambiado de conteo diario a mensual con límite 20. `checkRateLimit` aplica en `POST /api/generate` y `POST /api/github/fix`. Header `X-RateLimit-Remaining` en respuestas. | ✅ |
| O-26 | **User preferences en DB** — migración `007_preferences.sql`. Tabla `user_preferences` con `lang`, `show_sidebar`, `edu_mode`, `provider`. Endpoints `GET/PATCH /api/preferences`. Upsert automático (insert si no existe, update si existe). | ✅ |

---

## Notas entre agentes — Fase 4

### Para Opencode
- **O-25 primero** — el enforcement es la base del modelo freemium. Sin esto el límite de 20/mes es solo visual.
- **O-23**: incluir `command_text` + `explanation` + `provider` en favoritos. El historial ya existe — favoritos son un subconjunto marcado.
- **O-24**: `popular` = top 5 por frecuencia del historial propio del usuario, no ranking global.
- **O-26**: migración suave — leer localStorage como fallback si no hay row, persistir al primer cambio consciente.

### Para Claude
- **C-25 primero** — el indicador de uso es lo más visible para el usuario y el principal driver de conversión a Pro.
- **C-23**: ocultar la barra completa si `popular` devuelve array vacío (usuario nuevo sin historial).
- **C-24**: optimistic UI en el ⭐ — togglear estado local inmediatamente y revertir si la API falla.
- **C-26**: el plan badge en settings puede abrir el `PricingModal` directamente como CTA de upgrade.

---

## Decisiones técnicas

| Decisión | Razón |
|----------|-------|
| Next.js 15 App Router | Server Components — keys nunca se exponen al cliente |
| Sin Tailwind | CSS custom properties puras, menor complejidad |
| Supabase Vault para API keys | Secretos de alta sensibilidad, nunca en columnas normales |
| API Route para generate | Keys se descifran en servidor, cliente nunca las ve |
| `claude-haiku-4-5-20251001` default Anthropic | Latencia baja, coste bajo, tarea de extracción JSON simple |
| 6 providers via `callOpenAICompat` | Groq/Mistral/OpenRouter comparten el mismo helper con endpoints distintos |
| `data-theme` en `document.documentElement` | Permite que todos los CSS modules reaccionen al tema sin contexto React |
| GitHub API read-only | Gratis, sin permisos de escritura, suficiente para contexto de rama/commit |
| `provider_token` de sesión Supabase | El OAuth de GitHub ya está implementado — no hay que re-autenticar |
| Extensión llama a `/api/generate` en Vercel | Sin duplicación de lógica — cache, rate limiting, providers, historial: todo ya existe |
| `vscode.SecretStorage` para el token | API nativa de VS Code para secretos — no localStorage, no archivos |
| WebviewPanel (no QuickInput) | Permite mostrar el result card completo con explicación y botón de ejecutar |
| localStorage para repo activo | No necesita persistencia en DB — preferencia de sesión |

---

## Hotfixes — Post-Fase 3 (Opencode)

| # | Tarea | Estado |
|---|-------|--------|
| H-01 | **Fix mode bug** — servidor esperaba `problem_description` pero cliente enviaba `problem_desc` → 400 siempre. Cambiada variable a `problem_desc`. | ✅ |
| H-02 | **GitHub repos sin username** — endpoint `/api/github/repos` no devolvía `username`; settings mostraba siempre "Sin conectar". Agregada llamada a `/user` de GitHub. | ✅ |
| H-03 | **Settings apuntaba a stub** — llamaba a `/api/settings/keys` (stub vacío). Cambiado a `/api/keys` real. | ✅ |
| H-04 | **POST body key mal nombrado** — enviaba `{ key }`, servidor esperaba `{ apiKey }`. Corregido. | ✅ |
| H-05 | **Login `?provider=github` ignorado** — agregado `useEffect` que dispara GitHub OAuth automático. | ✅ |
| H-06 | **Sidebar sin usuario** — agregado footer con avatar + email/GitHub username desde `supabase.auth.getUser()`. | ✅ |
| H-07 | **DELETE /api/keys sin limpiar Vault** — se eliminaba `provider_keys` pero el secreto en Vault quedaba huérfano. Agregado `admin.rpc('delete_secret')`. | ✅ |
| H-08 | **Rate-limit con service_role innecesario** — `checkRateLimit()` usaba `createAdminClient()`. Cambiado a `createClient()` normal. | ✅ |
| H-09 | **Build roto por typedRoutes** — `/privacidad` usaba `<Link href="/terminos">` y esa ruta no existía como página. Cambiado a `<a>`. (Claude creó la página posteriormente — OK). | ✅ |
