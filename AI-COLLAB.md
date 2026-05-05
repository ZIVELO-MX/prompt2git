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

## Tareas activas — Fase 1

### Claude

| # | Tarea | Estado |
|---|-------|--------|
| C-13 | Indicador visual de cache hit en `ResultCard` (badge "⚡ Desde cache") | ✅ completo |
| C-14 | UI de rate limit: banner 429 + contador `X queries restantes hoy` | ✅ completo |

### Opencode

| # | Tarea | Estado |
|---|-------|--------|
| O-10 | Activar extensión `pgvector` en Supabase + migración `004_embeddings.sql` (columna `embedding vector(1536)` en `commands`) | ✅ completo |
| O-11 | Pipeline en `/api/generate`: normalize → embedding → similarity search (threshold 0.92) → cache hit return / cache miss call AI + save | ✅ completo |
| O-12 | Rate limiting por usuario en `/api/generate`: ventana diaria, límite configurable por tier, header `X-RateLimit-Remaining` | ✅ completo |

---

## Roadmap (ver `PROMPT2GIT.md` para detalle completo)

| Fase | Objetivo | Estado |
|------|----------|--------|
| 0 — MVP | Auth, traducción NL→Git, historial, multi-provider, landing | ✅ completo |
| 1 — Escala | Cache semántico pgvector + rate limiting | ✅ completo |
| 2 — Contexto | GitHub read-only + "Fix my repo" | ⬜ |
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

## Notas entre agentes

### Para Opencode
- Migración `004_embeddings.sql`: pgvector + columna `embedding vector(1536)` + índice IVFFlat + función `match_commands()` + fix de constraints de provider (6 providers). Subir con `supabase db push --linked`.
- Pipeline `/api/generate`: `normalize(input) → generateEmbedding(input) → supabase.rpc('match_commands')` con threshold 0.92. Si cache hit → return `from_cache: true`. Si no → call AI, save con embedding. Graceful degradation si falla embedding.
- Rate limit: 50 req/día, ventana UTC, headers `X-RateLimit-Remaining` y `X-RateLimit-Reset`, status `429` con `{ error: 'rate_limit', remaining: 0, reset_at }`.
- `src/lib/ai-provider.ts` tiene 6 providers. Groq/Mistral/OpenRouter usan `callOpenAICompat`. No modificar firma de `generate()`.

### Para Claude
- C-13: la respuesta de `/api/generate` ahora incluye `from_cache: boolean`. Si es `true`, mostrar badge "⚡ Desde cache" en `ResultCard`.
- C-14: el rate limit devuelve `429` con `{ error: 'rate_limit', remaining: 0, reset_at: ISO_DATE }` y headers `X-RateLimit-Remaining`, `X-RateLimit-Reset`. Mostrar toast con `X/50 queries restantes hoy`.
- Opencode rediseñó la UI de `/app/settings` — grid de 2 columnas, iconos con color de marca, header con icono decorativo, responsive.
