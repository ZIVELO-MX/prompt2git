# AI-COLLAB — Prompt2Git

Canal de comunicación y coordinación entre **Claude** (arquitecto + UI) y **Opencode** (backend + infra).

> **Protocolo:** Leer este archivo antes de empezar cualquier tarea. Al terminar, actualizar el estado de la tarea correspondiente y dejar notas para el otro agente si aplica.

---

## Roles

| Agente | Responsabilidades |
|--------|-----------------|
| **Claude** | Arquitectura general, componentes UI, diseño de tipos, revisión de código, este archivo |
| **Opencode** | Supabase (schema, RLS, Vault, queries), API Routes, middleware, auth flows, deploy |

---

## Estado actual del proyecto

**Fase activa:** 2 — API keys y generación (Vault + endpoint /api/generate)
**Última actualización:** 2026-05-03

### Completado ✅
- [x] Prototipo HTML funcional (`Prompt2Git.html`) — referencia visual y de UX
- [x] Roadmap definido (`ROADMAP.md`)
- [x] Estructura de proyecto Next.js 15 + TypeScript scaffoldeada
- [x] Design tokens migrados a `globals.css`
- [x] Capa de abstracción multi-proveedor (`src/lib/ai-provider.ts`)
- [x] Schema de Supabase (`supabase/migrations/`)
- [x] Middleware de protección de rutas
- [x] C-01 — Componente `Sidebar` + `HistoryItem` (`src/components/sidebar/`)
- [x] C-02 — Componente `ResultCard` (`src/components/result-card/`)
- [x] C-03 — Componente `CommandWithFlags` con tooltips edu (`src/components/command-with-flags/`)
- [x] C-04 — Página principal `/app` conectada a `useCommands()`
- [x] C-05 — `src/hooks/use-commands.ts` — historial paginado con Supabase
- [x] C-06 — Página `/app/settings` — UI de API keys por proveedor
- [x] Tipos compartidos (`src/types/index.ts`)
- [x] O-01 — Proyecto Supabase Cloud configurado + `.env.local`
- [x] O-02 — Migraciones ejecutadas (001_schema + 002_rls)
- [x] O-03 — Tipos generados (`src/lib/supabase/types.ts`)
- [x] O-04 — Login page con Magic Link + GitHub OAuth + callback route

---

## Tareas pendientes

### Claude

| # | Tarea | Fase | Estado |
|---|-------|------|--------|
| C-01 | Portar componente `Sidebar` del HTML a `src/components/sidebar/` | 0 | ✅ completo |
| C-02 | Portar componente `ResultCard` a `src/components/result-card/` | 0 | ✅ completo |
| C-03 | Portar componente `CommandWithFlags` a `src/components/command-with-flags/` | 0 | ✅ completo |
| C-04 | Implementar `src/app/app/page.tsx` — UI principal completa | 0 | ✅ completo |
| C-05 | Implementar `src/hooks/use-commands.ts` — historial con Supabase | 3 | ✅ completo |
| C-06 | UI de `/app/settings` — formulario para conectar API keys | 2 | ✅ completo |
| C-07 | Landing page `/` — hero, demo, CTA | 4 | ⬜ pendiente |
| C-08 | Onboarding post-registro — guía 3 pasos | 4 | ⬜ pendiente |

### Opencode

| # | Tarea | Fase | Estado |
|---|-------|------|--------|
| O-01 | Crear proyecto en Supabase Cloud y configurar `.env.local` | 0 | ✅ completo |
| O-02 | Ejecutar migraciones en Supabase (001_schema + 002_rls) | 0 | ✅ completo |
| O-03 | Generar tipos con `npm run db:types` | 0 | ✅ completo |
| O-04 | Implementar login page con Magic Link + GitHub OAuth | 1 | ✅ completo |
| O-05 | Activar Supabase Vault y función server para cifrar/descifrar keys | 2 | ⬜ pendiente |
| O-06 | Implementar `POST /api/generate` — validar sesión + leer Vault + llamar AI | 2 | ⬜ pendiente |
| O-07 | Guardar cada comando generado en tabla `commands` | 3 | ⬜ pendiente |
| O-08 | Búsqueda full-text en historial (Supabase FTS) | 3 | ⬜ pendiente |
| O-09 | Configurar proyecto en Vercel y conectar repo | 0 | ⬜ pendiente |

---

## Decisiones tomadas

| Decisión | Razón | Quién |
|----------|-------|-------|
| Next.js 15 App Router | Server Components nativos — keys nunca se exponen al cliente | Claude |
| Sin Tailwind | El diseño usa CSS custom properties puras; menor complejidad | Claude |
| Supabase Vault para keys | Las API keys son secretos de alta sensibilidad — no pueden estar en columnas normales | Claude |
| API Route para generate | Keys se descifran en servidor; el cliente nunca ve la key real | Claude |
| `claude-haiku-4-5-20251001` default Anthropic | Latencia baja, coste bajo, tarea de extracción JSON simple | Claude |
| `gpt-4o-mini` default OpenAI | Mismo criterio | Claude |
| Magic Link como auth principal | Sin fricción de contraseña, suficiente para MVP | Claude |

---

## Notas entre agentes

### Para Opencode
- `src/lib/ai-provider.ts` ya tiene las 3 integraciones listas. En O-06 solo llamas `generate(config, input)` con la config que recuperas de Vault.
- El middleware protege `/app/**` — no repetir validación de sesión en Server Components, solo en Route Handlers.
- Para Vault: función server recibe `user_id` → busca `vault_id` en `provider_keys` → llama `vault.decryptSecret(vault_id)`.
- El prototipo de referencia está en `Prompt2Git.html` — útil para entender el flujo completo antes de tocar la API.

### Para Claude
- Esperar a que Opencode termine O-01 y O-02 antes de implementar C-05 (use-commands necesita la DB lista).
- C-01, C-02, C-03 se pueden hacer en paralelo con las tareas de Opencode — no tienen dependencias de DB.
- Respetar `'use client'` solo donde sea estrictamente necesario (estado interactivo). Todo lo estático debe ser Server Component.

---

## Convenciones del proyecto

- **Commits:** `type: descripción corta` — feat | fix | refactor | docs | chore
- **Branches:** `feat/<descripcion>`, `fix/<descripcion>`
- **PR:** siempre con descripción de qué hace y cómo probarlo — no push directo a `main`
- **TypeScript strict:** sin `any`, sin `!` innecesarios, sin `@ts-ignore`
- **Server vs Client:** preferir Server Components; `'use client'` solo cuando hay estado interactivo o hooks del browser
