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

**Fase activa:** 5 — Monetización + AI Gateway
**Última actualización:** 2026-05-10

### Nota de contexto (10/05) — Opencode
- Fases 0–4 completadas y mergeadas a main ✅
- Migraciones `006_favorites.sql` y `007_preferences.sql` corridas en Supabase prod ✅
- **Bugfixes:** Se arreglaron problemas con la API de OpenRouter (rate limited) y Zen (modelos inconsistents). Modelo default free cambiado a `minimax-m2.5-free` vía Zen. Se eliminaron modelos que no funcionaban (`big-pickle`, `ling-2.6-flash`, `hy3-preview`, `llama-3.3-70b`).
- **CHECK constraint:** Se actualizó en Supabase prod vía CLI para permitir `zen` y `openrouter` en `commands`, `provider_keys` y `user_preferences`.
- **Historial:** Se corrigió bug donde `JSON.stringify` se aplicaba sobre columnas `jsonb`, y `/api/commands` no incluía `explanation` ni `flags`.
- **Edu mode:** Se creó `src/lib/flag-knowledge.ts` con diccionario curado de 180+ flags para que siempre se resalten en modo educativo.
- **Tooltip:** Cambiado a `position:fixed` para no recortarse con `overflow:hidden` del contenedor.
- **O-30/O-31:** Completadas — migración `beta_waitlist` y API `/api/beta/signup` creadas y migración aplicada en Supabase prod.

---

## Roadmap

| Fase | Objetivo | Estado |
|------|----------|--------|
| 0 — MVP | Auth, traducción NL→Git, historial, multi-provider, landing | ✅ completo |
| 1 — Escala | Cache semántico pgvector + rate limiting | ✅ completo |
| 2 — Contexto | GitHub read-only + "Fix my repo" | ✅ completo |
| 3 — Distribución | VS Code Extension | ✅ completo |
| 4 — Retención | Memory layer + quick actions | ✅ completo |
| 5 — Monetización | Stripe + enforcement de planes + subscriptions | 🔄 activa |
| 5b — AI Gateway | Model tier routing por plan + proveedores free propios | 🔄 activa |

---

## Tareas activas — Fase 5: AI Gateway

### Contexto de negocio

| Plan | Límite | Acceso a "nuestra IA" | BYOK |
|------|--------|-----------------------|------|
| **Starter** | 20 cmd/mes | Sí — 1-2 modelos free default | No |
| **Pro** | 200 cmd/mes | Sí — ELIGE entre TODOS los modelos free de OpenRouter + OpenCode Zen | Sí (su propia key) |

> **Regla clave:** Pro users tienen dos caminos: (a) su propia API key → modelo que ellos configuren, (b) sin key propia → puede elegir cualquier modelo free del catálogo (OpenRouter + OpenCode Zen). Starter solo tiene 1-2 modelos default. **Costo $0 para la plataforma.**

---

### Proveedores free (plataforma — sin key del usuario)

Usamos **OpenRouter** y **OpenCode** como proveedores de modelos gratuitos para el tier Starter y como fallback para Pro sin BYOK.

#### OpenRouter (ya implementado)
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Modelo free actual: `meta-llama/llama-3.1-8b-instruct:free`

#### OpenCode Zen (nuevo — agregar como provider)
- Endpoint: `https://opencode.ai/zen/v1/chat/completions` (OpenAI-compatible ✅)
- Modelos free disponibles (confirmados en docs opencode.ai):
  - **Big Pickle** — `big-pickle`
  - **MiniMax M2.5 Free** — `minimax-m2.5-free`
  - **Ling 2.6 Flash Free** — `ling-2.6-flash-free`
  - **Hy3 Preview Free** — `hy3-preview-free`
  - **Nemotron 3 Super Free** — `nemotron-3-super-free`
- Autenticación: API key via `Authorization: Bearer <key>` (requiere cuenta + $20 prepago, modelos free no consumen saldo)

---

### Arquitectura AI Gateway

#### Nota de Opencode para Claude (09/05) — Ajuste de estrategia

> **Idea del founder:** En lugar de que Pro tenga modelos premium pagados por la plataforma, que **Pro pueda elegir entre TODOS los modelos free de OpenRouter + OpenCode Zen**. La plataforma nunca paga por inferencia. El upgrade incentive es:
> 1. Límite más alto (200 vs 20 cmd/mes)
> 2. Elección del modelo (Starter tiene 1-2 default, Pro elige entre todos los free)
> 3. BYOK para quien quiera modelos premium
>
> **Mi recomendación:** Implementar esto como estrategia primaria (costo $0). Si en el futuro se necesita un tier superior, se agrega. La elección de modelo da sensación de control sin costarte nada.

### Cambios en `src/types/index.ts`
```ts
// Agregar:
export type Plan = 'starter' | 'pro'

// Extender Provider:
export type Provider = 'anthropic' | 'openai' | 'gemini' | 'groq' | 'mistral' | 'openrouter' | 'zen'
```

#### Cambios en `src/lib/ai-provider.ts`

```ts
// 1. Agregar endpoint Zen al mapa existente
const OPENAI_COMPAT_ENDPOINTS: Partial<Record<Provider, string>> = {
  // ...existentes...
  zen: 'https://opencode.ai/zen/v1/chat/completions',
}

// 2. Modelos default por plan
const DEFAULT_MODELS: Record<Plan, string> = {
  starter: 'meta-llama/llama-3.1-8b-instruct:free',
  pro:     'big-pickle',  // Pro elige, este es el default si no ha elegido
}

// 3. Catálogo completo de modelos free (ambos providers)
const FREE_MODELS: Record<string, { provider: Provider; modelId: string; label: string }> = {
  // OpenRouter free
  'llama-3.1-8b':   { provider: 'openrouter', modelId: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B' },
  // OpenCode Zen free
  'big-pickle':     { provider: 'zen', modelId: 'big-pickle',           label: 'Big Pickle' },
  'minimax-m2.5':   { provider: 'zen', modelId: 'minimax-m2.5-free',    label: 'MiniMax M2.5 Free' },
  'ling-2.6-flash': { provider: 'zen', modelId: 'ling-2.6-flash-free',  label: 'Ling 2.6 Flash Free' },
  'hy3-preview':    { provider: 'zen', modelId: 'hy3-preview-free',     label: 'Hy3 Preview Free' },
  'nemotron-3':     { provider: 'zen', modelId: 'nemotron-3-super-free',label: 'Nemotron 3 Super Free' },
}

// 4. Nueva función exportable
export function selectModel(plan: Plan, preferredModelKey?: string): { provider: Provider; model: string } {
  if (plan === 'pro' && preferredModelKey && FREE_MODELS[preferredModelKey]) {
    const m = FREE_MODELS[preferredModelKey]!
    return { provider: m.provider, model: m.modelId }
  }
  return { provider: 'openrouter', model: DEFAULT_MODELS[plan] }
}
```

#### Cambios en `src/app/api/generate/route.ts` y `github/fix/route.ts`

La función `getProviderConfig` actual devuelve `plan: 'free' | 'pro'`. Migrar a:
1. Tipo → `Plan` (`'starter' | 'pro'`)
2. Sin BYOK + cualquier plan → usa `selectModel(plan, userPrefModel)` que resuelve el modelo según catálogo free
3. Con BYOK → mantiene comportamiento actual (modelo del usuario, fallback openrouter free)
4. Plan del usuario: leer de DB (columna `plan` en `profiles` o tabla `subscriptions`). **Default `'starter'` hasta que Stripe esté activo.**
5. Preferencia de modelo: leer de `user_preferences.selected_model` (nuevo campo opcional)

---

### Tareas

#### Claude (C-27 a C-29) — modelos free como estrategia primaria

| # | Tarea | Estado |
|---|-------|--------|
| C-27 | **Tipos** — Agregar `Plan` a `src/types/index.ts`. Extender `Provider` con `'zen'`. | ⬜ |
| C-28 | **ai-provider.ts** — Agregar `DEFAULT_MODELS`, `FREE_MODELS` catalog, `selectModel()`, `buildFreeConfigs()`. Agregar `zen` a `OPENAI_COMPAT_ENDPOINTS` y al switch de `callOpenAICompat`. | ⬜ |
| C-29 | **Rutas** — Actualizar `getProviderConfig` en `/api/generate` y `/api/github/fix` para usar `Plan`, `selectModel()` con la preferencia del usuario. | ⬜ |

#### Opencode (O-27 a O-28)

| # | Tarea | Estado |
|---|-------|--------|
| O-27 | ✅ **OpenCode Zen API** — endpoint, auth y model IDs confirmados. Ver `AI-COLLAB.md`. | ✅ |
| O-28 | ✅ **Env vars** — `ZEN_API_KEY` agregada a `.env.local`, `.env.example` y `env.ts`. Pendiente agregar en Vercel. | ✅ |
| O-29 | ✅ **DB: user_preferences** — columna `selected_model` agregada vía migración `008_selected_model.sql`. | ✅ |

---

---

## Tarea para Opencode — Beta Waitlist (Landing)

**Solicitado por:** Claude · 2026-05-10  
**Contexto:** La landing va a tener un formulario de registro para la beta cerrada. Los emails se guardan en Supabase **sin crear usuario en auth.users** — solo es una lista de espera. No tienen acceso al app.

### O-30 — Migración: tabla `beta_waitlist`

Crear migración `011_beta_waitlist.sql` con:

```sql
create table if not exists public.beta_waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  source      text default 'landing',   -- de dónde vino el registro
  lang        text default 'es',        -- idioma seleccionado en la landing
  created_at  timestamptz default now(),
  unique(email)
);

-- RLS: solo insert anónimo. Nadie puede leer sin ser admin.
alter table public.beta_waitlist enable row level security;

create policy "anon can insert beta waitlist"
  on public.beta_waitlist for insert
  to anon
  with check (true);
```

> **Sin** FK a auth.users. **Sin** columna de contraseña. Solo emails de espera.

### O-31 — API Route: `POST /api/beta/signup`

Crear `src/app/api/beta/signup/route.ts`:

- Acepta `{ email: string, lang?: string, source?: string }`
- Valida formato de email básico
- Inserta en `beta_waitlist` con cliente Supabase **service role** (para saltarse RLS de lectura si hace falta)
- Si el email ya existe → devuelve `200` igual (no error, no duplicado visible)
- Respuesta: `{ ok: true }` o `{ ok: false, error: string }`
- **No** crea sesión, **no** llama a `auth.signUp`, **no** da acceso al app

**Estado:** ✅ completado por Opencode (10/05)

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


