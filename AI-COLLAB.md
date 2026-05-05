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

**Fase activa:** 4 — Multi-provider + UX polish + Despliegue
**Última actualización:** 2026-05-04

### Completado ✅
- [x] Prototipo HTML funcional (`GitSpeak.html`) — referencia visual y de UX
- [x] Roadmap definido (`ROADMAP.md`)
- [x] Estructura de proyecto Next.js 15 + TypeScript scaffoldeada
- [x] Design tokens migrados a `globals.css`
- [x] Capa de abstracción multi-proveedor (`src/lib/ai-provider.ts`)
- [x] Schema de Supabase (`supabase/migrations/`)
- [x] Middleware de protección de rutas
- [x] C-01 — Componente `Sidebar` + `HistoryItem` (`src/components/sidebar/`)
- [x] C-02 — Componente `ResultCard` (`src/components/result-card/`)
- [x] C-03 — Componente `CommandWithFlags` con tooltips edu (`src/components/command-with-flags/`)
- [x] C-04 — Página principal `/app` con estado completo, mock data y TODOs marcados
- [x] Tipos compartidos (`src/types/index.ts`)
- [x] O-01 — Proyecto Supabase Cloud configurado + `.env.local`
- [x] O-02 — Migraciones ejecutadas (001_schema + 002_rls)
- [x] O-03 — Tipos generados (`src/lib/supabase/types.ts`)
- [x] O-04 — Login page con Magic Link + GitHub OAuth + callback route
- [x] O-05 — Vault activo + `/api/keys` para gestionar API keys cifradas
- [x] O-06 — `/api/generate` funcional: valida sesión, lee Vault, llama AI provider, guarda en commands
- [x] O-08 — FTS en historial: migration 003_fts.sql + `/api/commands/search` + search bar en sidebar
- [x] C-07 — Landing page `/` portada desde `Landing-Page.html` a Next.js (`page.tsx` + `page.module.css` + componentes `HowItWorks` y `EmailCTA`)
- [x] C-08 — Onboarding post-registro: modal 3 pasos con localStorage, montado en `/app`
- [x] C-09 — Multi-provider expandido: Groq, Mistral AI (+ Codestral), OpenRouter — `ai-provider.ts` + types + settings UI
- [x] C-10 — Dark/Light mode toggle con `data-theme` en `document.documentElement`, persistido en localStorage
- [x] C-11 — Settings navegación: botón "← Volver" en settings + link "🔑 Configurar API keys" en TweaksPanel
- [x] C-12 — Revisión de seguridad: flujo landing → app confirmado — `/app/*` protegido por middleware, API routes con auth propio

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
| C-07 | Landing page `/` — hero, demo, CTA | 4 | ✅ completo |
| C-08 | Onboarding post-registro — guía 3 pasos | 4 | ✅ completo |
| C-09 | Multi-provider: Groq, Mistral, OpenRouter | 4 | ✅ completo |
| C-10 | Dark/Light mode toggle | 4 | ✅ completo |
| C-11 | Settings: navegación + acceso desde TweaksPanel | 4 | ✅ completo |

### Opencode

| # | Tarea | Fase | Estado |
|---|-------|------|--------|
| O-01 | Crear proyecto en Supabase Cloud y configurar `.env.local` | 0 | ✅ completo |
| O-02 | Ejecutar migraciones en Supabase (001_schema + 002_rls) | 0 | ✅ completo |
| O-03 | Generar tipos con `npm run db:types` | 0 | ✅ completo |
| O-04 | Implementar login page con Magic Link + GitHub OAuth | 1 | ✅ completo |
| O-05 | Activar Supabase Vault y función server para cifrar/descifrar keys | 2 | ✅ completo |
| O-06 | Implementar `POST /api/generate` — validar sesión + leer Vault + llamar AI | 2 | ✅ completo |
| O-07 | Guardar cada comando generado en tabla `commands` | 3 | ✅ completo (incluido en O-06) |
| O-08 | Búsqueda full-text en historial (Supabase FTS) | 3 | ✅ completo |
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
- `src/lib/ai-provider.ts` tiene 6 providers: Anthropic, OpenAI, Gemini, Groq, Mistral, OpenRouter. En O-06 solo llamas `generate(config, input)` con la config que recuperas de Vault. Groq/Mistral/OpenRouter usan el mismo helper `callOpenAICompat` con endpoints distintos.
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
