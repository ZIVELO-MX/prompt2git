# GitSpeak (Prompt2Git)

> Describe lo que quieres hacer con Git en lenguaje natural. Obtén el comando correcto al instante.

Herramienta web que traduce descripciones en lenguaje natural a comandos Git usando IA. El plan Starter incluye IA gestionada gratuita (sin API key propia). El plan Pro desbloquea elección de modelo y BYOK con 6 proveedores adicionales.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 App Router + TypeScript strict |
| Auth | Supabase Auth (Magic Link + GitHub OAuth) |
| Base de datos | Supabase Postgres + RLS |
| Cifrado de keys | Supabase Vault |
| Deploy | Vercel |
| AI Gateway | OpenRouter + OpenCode Zen (6 modelos free) |
| AI Providers (BYOK) | Anthropic, OpenAI, Gemini, Groq, Mistral, OpenRouter |
| Cache semántico | pgvector (Supabase) — threshold 0.92 |
| Rate limiting | 20 cmd/mes Starter · 200 cmd/mes Pro |
| Estilos | CSS custom properties (sin Tailwind, sin CSS-in-JS) |
| i18n | Diccionario es/en en `src/lib/i18n.ts` |

---

## Estructura del proyecto

```
GitSpeak/
├── AI-COLLAB.md               — canal de comunicación Claude ↔ Opencode
├── CONTRIBUTING.md            — convenciones de commits y ramas
├── middleware.ts              — protección de rutas con Supabase Auth
├── .env.example               — variables de entorno necesarias
│
├── docs/
│   └── AI_GATEWAY.md          — arquitectura del sistema de enrutamiento de modelos
│
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql     — tablas: provider_keys, commands
│       ├── 002_rls.sql        — Row Level Security
│       ├── 003_cache.sql      — cache semántico con pgvector
│       ├── 004_rate_limit.sql — rate limiting por usuario
│       ├── 005_github.sql     — tabla github_connections + Vault
│       ├── 006_favorites.sql  — tabla user_favorites
│       ├── 007_preferences.sql— tabla user_preferences (lang, theme, provider)
│       └── 008_selected_model.sql — columna selected_model en user_preferences
│
└── src/
    ├── lib/
    │   ├── env.ts             — validación de variables de entorno al arrancar
    │   ├── i18n.ts            — diccionario es/en + helper t()
    │   ├── models.ts          — catálogo FREE_MODELS (cliente + servidor)
    │   ├── ai-provider.ts     — abstracción multi-proveedor + selectModel()
    │   ├── ai-logger.ts       — logger de requests de IA
    │   ├── github.ts          — helpers para GitHub API
    │   └── supabase/
    │       ├── client.ts      — createBrowserClient
    │       ├── server.ts      — createServerClient (Server Components)
    │       └── types.ts       — tipos generados por Supabase CLI
    │
    ├── types/index.ts         — tipos compartidos (Command, Plan, Provider, FixResult…)
    │
    ├── app/
    │   ├── globals.css        — design tokens CSS + reset
    │   ├── layout.tsx         — root layout + fonts + validación env
    │   ├── page.tsx           — landing: hero, features, pricing CTA (es/en)
    │   ├── pricing/page.tsx   — página de planes detallada
    │   ├── login/page.tsx     — auth screen (Magic Link + GitHub OAuth)
    │   ├── app/
    │   │   ├── page.tsx       — app principal: sidebar + topbar + input + resultado + selector de modelo
    │   │   └── settings/
    │   │       └── page.tsx   — API keys por proveedor + repo GitHub activo
    │   └── api/
    │       ├── generate/      — POST: NL → comando Git (gateway + cache + rate limit)
    │       ├── commands/      — GET: historial · GET /popular: top 5 frecuentes
    │       ├── favorites/     — GET/POST/DELETE: favoritos del usuario
    │       ├── preferences/   — GET/PATCH: preferencias (lang, model, sidebar…)
    │       ├── usage/month/   — GET: comandos usados en el mes + plan
    │       ├── keys/          — GET/POST/DELETE: gestión de API keys (BYOK)
    │       └── github/
    │           ├── repos/     — GET: repositorios del usuario
    │           ├── context/   — GET: rama + último commit + PRs abiertos
    │           └── fix/       — POST: diagnóstico y plan de recuperación Git
    │
    └── components/
        ├── sidebar/           — historial + favoritos con búsqueda
        ├── result-card/       — resultado + explicación + flags + favorito
        ├── fix-result-card/   — pasos de recuperación con nivel de riesgo
        ├── quick-actions/     — chips de los 5 comandos más frecuentes
        ├── context-strip/     — barra de contexto repo activo
        ├── pricing-modal/     — modal de planes
        ├── onboarding/        — flow de primer uso
        └── ui/                — iconos SVG, primitivas compartidas
```

---

## Setup local

### 1. Clonar y dependencias

```bash
git clone <repo>
cd GitSpeak
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
# Completar con las keys requeridas
```

Variables requeridas:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
ZEN_API_KEY=
```

### 3. Migraciones de Supabase

```bash
# Con Supabase CLI + Docker:
supabase start
supabase db push

# O ejecutar los .sql en el SQL Editor de Supabase Cloud (en orden: 001 → 008)
```

### 4. Generar tipos de Supabase

```bash
npm run db:types
```

### 5. Servidor de desarrollo

```bash
npm run dev
# → http://localhost:3000
```

---

## AI Gateway

El gateway enruta cada request al modelo correcto según el plan del usuario, sin costo de inferencia para la plataforma. Ver [`docs/AI_GATEWAY.md`](./docs/AI_GATEWAY.md) para la arquitectura completa.

### Modelos disponibles (sin BYOK)

| Modelo | Provider | Plan |
|--------|----------|------|
| Llama 3.1 8B | OpenRouter | Starter (default) |
| Big Pickle | OpenCode Zen | Pro |
| MiniMax M2.5 | OpenCode Zen | Pro |
| Ling 2.6 Flash | OpenCode Zen | Pro |
| Hy3 Preview | OpenCode Zen | Pro |
| Nemotron 3 Super | OpenCode Zen | Pro |

Usuarios Pro ven un selector de modelo junto al botón Generar. La preferencia se persiste en `user_preferences.selected_model`.

---

## Modelo de datos

### `provider_keys`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → auth.users |
| `provider` | text | `anthropic` \| `openai` \| `gemini` \| `groq` \| `mistral` \| `openrouter` |
| `model` | text | Modelo preferido por el usuario |
| `vault_id` | uuid | Referencia al secreto en Supabase Vault |
| `created_at` | timestamptz | — |

### `commands`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → auth.users |
| `input` | text | Descripción en lenguaje natural |
| `command` | text | Comando Git generado |
| `explanation` | jsonb | Array de `{what, text}` |
| `flags` | jsonb | Array de `{flag, meaning}` |
| `provider` | text | Proveedor usado |
| `model` | text | Modelo usado |
| `embedding` | vector(1536) | Embedding para cache semántico (pgvector) |
| `created_at` | timestamptz | — |

### `user_preferences`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `user_id` | uuid | PK, FK → auth.users |
| `lang` | text | `es` \| `en` |
| `provider` | text | Proveedor preferido (BYOK) |
| `selected_model` | text | Key del modelo elegido del catálogo FREE_MODELS |
| `show_sidebar` | bool | Sidebar visible |
| `edu_mode` | bool | Modo educativo |

### `user_favorites`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → auth.users |
| `command_id` | uuid | Referencia al comando guardado |
| `created_at` | timestamptz | — |

---

## Seguridad

- **RLS activado** en todas las tablas — cada usuario solo accede a sus propios datos.
- **API keys y tokens nunca en texto plano** — se cifran con Supabase Vault. El valor real solo se recupera en Route Handlers.
- **Las keys de plataforma (`OPENROUTER_API_KEY`, `ZEN_API_KEY`) nunca se exponen al cliente** — solo se usan en el servidor.
- **Validación de env al arrancar** — `src/lib/env.ts` lanza error descriptivo si faltan variables requeridas.

---

## Planes

| Plan | Comandos/mes | IA gestionada | Elección de modelo | BYOK |
|------|-------------|---------------|-------------------|------|
| **Starter** | 20 | Llama 3.1 8B (fijo) | No | No |
| **Pro** | 200 | 6 modelos a elegir | Sí | Sí (6 providers) |

---

## Proveedores BYOK (Pro)

| Proveedor | Modelo por defecto | Cómo obtener key |
|-----------|-------------------|-----------------|
| Anthropic | `claude-haiku-4-5-20251001` | console.anthropic.com |
| OpenAI | `gpt-4o-mini` | platform.openai.com |
| Google Gemini | `gemini-1.5-flash` | aistudio.google.com |
| Groq | `llama-3.1-8b-instant` | console.groq.com |
| Mistral | `mistral-small-latest` | console.mistral.ai |
| OpenRouter | `meta-llama/llama-3.1-8b-instruct:free` | openrouter.ai |

---

## Diseño

Design tokens en `src/app/globals.css`. Paleta:
- **Accent (verde eléctrico):** `oklch(0.75 0.22 142)`
- **Amber (flags/warnings):** `oklch(0.78 0.18 72)`
- **Fondo base:** `oklch(0.12 0.01 240)`
- **Fuentes:** JetBrains Mono (código) + DM Sans (UI)

Modo oscuro/claro vía `data-theme` en `document.documentElement`.

---

## Roadmap

| Fase | Objetivo | Estado |
|------|----------|--------|
| 0 — MVP | Auth, traducción NL→Git, historial, multi-provider, landing | ✅ |
| 1 — Escala | Cache semántico pgvector + rate limiting | ✅ |
| 2 — Contexto | GitHub read-only + "Fix my repo" | ✅ |
| 3 — Distribución | VS Code Extension | ✅ |
| 4 — Retención | Quick actions, favoritos, usage badge, plan badge | ✅ |
| 5 — Monetización | AI Gateway + Stripe + enforcement de planes | 🔄 |

Ver [AI-COLLAB.md](./AI-COLLAB.md) para el detalle de tareas entre Claude y Opencode.

---

## VS Code Extension

GitSpeak tiene una extensión oficial para VS Code en `packages/vscode-extension/`.

### Instalar desde Marketplace

1. Abre VS Code → Extensions (`Cmd+Shift+X`).
2. Busca **GitSpeak**.
3. Click **Install**.

### Instalar manualmente (VSIX)

1. Descarga el `.vsix` desde [Releases](https://github.com/ZIVELO-MX/prompt2git/releases).
2. Extensions panel → `···` → **Install from VSIX…** → selecciona el archivo.

### Primer uso

En el primer uso la extensión abre el browser en `https://www.prompt2git.com/login`. Después de autenticarte, el token queda en VS Code Secret Storage — no hace falta volver a loguearse.

### Uso

- `Cmd+Shift+G` (macOS) / `Ctrl+Shift+G` (Windows/Linux) para abrir el panel.
- Escribe en lenguaje natural → revisa el comando → **Run in terminal**.
- Modo **Fix my repo**: describe el problema y GitSpeak sugiere un plan de recuperación paso a paso.
- El modelo de IA activo es el mismo que el usuario tiene configurado en la web.

Ver [`packages/vscode-extension/README.md`](./packages/vscode-extension/README.md) para desarrollo local y publicación.
