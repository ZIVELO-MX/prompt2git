# Prompt2Git

> Describe lo que quieres hacer con Git en lenguaje natural. Obtén el comando correcto al instante.

Herramienta web que traduce descripciones en español a comandos Git usando el modelo de IA que el usuario elija. Cada usuario conecta su propia API key — nosotros nunca la almacenamos en texto plano.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 App Router + TypeScript strict |
| Auth | Supabase Auth (Magic Link + GitHub OAuth) |
| Base de datos | Supabase Postgres + RLS |
| Cifrado de keys | Supabase Vault |
| Deploy | Vercel |
| AI Providers | Anthropic, OpenAI, Google Gemini |
| Estilos | CSS custom properties (sin Tailwind, sin CSS-in-JS) |

---

## Estructura del proyecto

```
Prompt2Git/
├── Prompt2Git.html              — prototipo HTML de referencia (no tocar)
├── ROADMAP.md                 — fases y decisiones de producto
├── AI-COLLAB.md               — canal de comunicación Claude ↔ Opencode
├── middleware.ts              — protección de rutas con Supabase Auth
├── .env.example               — variables de entorno necesarias
│
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql     — tablas: provider_keys, commands
│       └── 002_rls.sql        — Row Level Security
│
└── src/
    ├── app/
    │   ├── layout.tsx         — root layout + fonts
    │   ├── globals.css        — design tokens CSS + reset
    │   ├── page.tsx           — landing (redirige a /app en Fase 0)
    │   ├── login/page.tsx     — auth screen (Magic Link + GitHub)
    │   ├── app/
    │   │   ├── layout.tsx     — layout protegido
    │   │   ├── page.tsx       — app principal (sidebar + main)
    │   │   └── settings/
    │   │       └── page.tsx   — gestión de API keys por proveedor
    │   └── api/
    │       └── generate/
    │           └── route.ts   — endpoint: traduce input → comando Git
    │
    ├── components/
    │   ├── sidebar/           — historial de comandos
    │   ├── result-card/       — bloque de resultado + explicación
    │   ├── command-with-flags/— syntax highlighting con tooltips edu
    │   └── ui/                — primitivas compartidas (Button, Toggle…)
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts      — createBrowserClient
    │   │   ├── server.ts      — createServerClient (Server Components)
    │   │   └── types.ts       — tipos generados por Supabase CLI
    │   └── ai-provider.ts     — capa de abstracción multi-proveedor
    │
    ├── hooks/
    │   └── use-commands.ts    — historial paginado desde Supabase
    └── types/
        └── index.ts           — tipos compartidos (Command, Flag, Provider…)
```

---

## Setup local

### 1. Clonar y dependencias

```bash
git clone <repo>
cd Prompt2Git
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus keys de Supabase
```

### 3. Supabase local (opcional)

```bash
# Requiere Docker + Supabase CLI
supabase start
supabase db push
```

O ejecutar las migraciones directamente en el SQL Editor de Supabase Cloud.

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
| `provider` | text | `anthropic` \| `openai` \| `gemini` |
| `model` | text | Modelo preferido |
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
| `created_at` | timestamptz | — |

---

## Seguridad

- **RLS activado** en todas las tablas — cada usuario solo accede a sus propios datos.
- **API keys nunca en texto plano** — se cifran con Supabase Vault antes de persistir. El valor real solo se recupera en Server Components/Route Handlers, nunca en el cliente.
- **Las keys nunca aparecen en responses** de la API — el cliente solo recibe el resultado de la traducción.

---

## Proveedores soportados

| Proveedor | Modelo por defecto | Cómo obtener key |
|-----------|-------------------|-----------------|
| Anthropic | `claude-haiku-4-5-20251001` | console.anthropic.com |
| OpenAI | `gpt-4o-mini` | platform.openai.com |
| Google Gemini | `gemini-1.5-flash` | aistudio.google.com |

---

## Diseño

Los design tokens viven en `src/app/globals.css`. El prototipo visual de referencia está en `Prompt2Git.html` — no modificar ese archivo, es la fuente de verdad visual.

Paleta:
- **Accent (verde eléctrico):** `oklch(0.75 0.22 142)`
- **Amber (flags/warnings):** `oklch(0.78 0.18 72)`
- **Fondo base:** `oklch(0.12 0.01 240)`
- **Fuentes:** JetBrains Mono (código) + DM Sans (UI)

---

## Roadmap

Ver [ROADMAP.md](./ROADMAP.md) para el plan de fases completo.

---

## Agentes AI en este proyecto

Ver [AI-COLLAB.md](./AI-COLLAB.md) para el canal de comunicación y asignación de tareas entre Claude y Opencode.
