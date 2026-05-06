# GitSpeak (Prompt2Git)

> Describe lo que quieres hacer con Git en lenguaje natural. Obtén el comando correcto al instante.

Herramienta web que traduce descripciones en lenguaje natural a comandos Git usando el proveedor de IA que elijas. El plan Free incluye IA gestionada (sin API key propia). El plan Pro soporta BYOK (Bring Your Own Key) con 6 proveedores.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 App Router + TypeScript strict |
| Auth | Supabase Auth (Magic Link + GitHub OAuth) |
| Base de datos | Supabase Postgres + RLS |
| Cifrado de keys | Supabase Vault |
| Deploy | Vercel |
| AI Providers | Anthropic, OpenAI, Gemini, Groq, Mistral, OpenRouter |
| Cache semántico | pgvector (Supabase) — threshold 0.92 |
| Rate limiting | 20 req/mes plan Free, ilimitado Pro |
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
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql     — tablas: provider_keys, commands
│       ├── 002_rls.sql        — Row Level Security
│       ├── 003_cache.sql      — cache semántico con pgvector
│       ├── 004_rate_limit.sql — rate limiting por usuario
│       └── 005_github.sql     — tabla github_connections + Vault
│
└── src/
    ├── lib/
    │   ├── env.ts             — validación de variables de entorno al arrancar
    │   ├── i18n.ts            — diccionario es/en + helper t()
    │   ├── ai-provider.ts     — abstracción multi-proveedor (6 providers)
    │   ├── github.ts          — helpers para GitHub API
    │   └── supabase/
    │       ├── client.ts      — createBrowserClient
    │       ├── server.ts      — createServerClient (Server Components)
    │       └── types.ts       — tipos generados por Supabase CLI
    │
    ├── types/index.ts         — tipos compartidos (Command, FixResult, GitHubRepo…)
    │
    ├── app/
    │   ├── globals.css        — design tokens CSS + reset
    │   ├── layout.tsx         — root layout + fonts + validación env
    │   ├── page.tsx           — landing: hero, features, pricing CTA
    │   ├── pricing/page.tsx   — página de planes detallada
    │   ├── login/page.tsx     — auth screen (Magic Link + GitHub OAuth)
    │   ├── app/
    │   │   ├── page.tsx       — app principal: sidebar + topbar + input + resultado
    │   │   └── settings/
    │   │       └── page.tsx   — API keys por proveedor + repo GitHub activo
    │   └── api/
    │       ├── generate/      — POST: NL → comando Git (cache semántico + rate limit)
    │       ├── commands/      — GET: historial del usuario
    │       ├── settings/keys/ — GET/POST/DELETE: gestión de API keys
    │       └── github/
    │           ├── repos/     — GET: repositorios del usuario (GitHub API)
    │           ├── context/   — GET: rama + último commit + PRs abiertos
    │           └── fix/       — POST: diagnóstico y plan de recuperación Git
    │
    └── components/
        ├── sidebar/           — historial de comandos con búsqueda
        ├── result-card/       — resultado + explicación + flags
        ├── fix-result-card/   — pasos de recuperación numerados con nivel de riesgo
        ├── context-strip/     — barra de contexto repo activo (bajo topbar)
        ├── pricing-modal/     — modal de planes (Free / Pro / Teams)
        ├── onboarding/        — flow de onboarding primera vez
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
# Editar .env.local con tus keys de Supabase
```

Variables requeridas:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 3. Migraciones de Supabase

```bash
# Con Supabase CLI + Docker:
supabase start
supabase db push

# O ejecutar los .sql en el SQL Editor de Supabase Cloud (en orden: 001 → 005)
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

### `github_connections`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → auth.users (único por usuario) |
| `vault_id` | uuid | Token de GitHub cifrado en Vault |
| `username` | text | Login de GitHub del usuario |
| `connected_at` | timestamptz | — |

---

## Seguridad

- **RLS activado** en todas las tablas — cada usuario solo accede a sus propios datos.
- **API keys y tokens nunca en texto plano** — se cifran con Supabase Vault. El valor real solo se recupera en Server Components/Route Handlers.
- **Las keys nunca aparecen en responses** de la API — el cliente solo recibe el resultado de la traducción.
- **Validación de env al arrancar** — `src/lib/env.ts` lanza error descriptivo si faltan variables requeridas.

---

## Planes

| Plan | Comandos | IA | Providers |
|------|----------|----|-----------|
| **Starter (Free)** | 20/mes | Incluida (gestionada) | — |
| **Pro** | Ilimitados | BYOK | 6 providers |
| **Teams** | Ilimitados | BYOK | 6 providers + próximamente |

El Modo Educativo (explicaciones detalladas por flag) está disponible en todos los planes con límite de 5 usos/semana en Free.

---

## Proveedores soportados (Pro / BYOK)

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
| 3 — Distribución | VS Code Extension | ⬜ |
| 4 — Retención | Memory layer + quick actions | ⬜ |
| 5 — Monetización | Freemium completo (Stripe) | ⬜ |

Ver [AI-COLLAB.md](./AI-COLLAB.md) para el detalle de tareas entre Claude y Opencode.
