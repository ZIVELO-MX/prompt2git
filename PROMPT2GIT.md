# Prompt2Git

**Describe lo que quieres hacer con Git en lenguaje natural. Obtén el comando correcto al instante.**

Aplicación web que traduce descripciones en lenguaje natural (español) a comandos Git correctos usando IA. El usuario escribe algo como *"deshacer el ultimo commit sin perder los cambios"* y la app devuelve el comando exacto (`git reset --soft HEAD~1`) con una explicación estructurada.

---

## Features

### Traducción Lenguaje Natural -> Git
- Input de texto con límite de 280 caracteres y contador en vivo
- Placeholders rotativos que cambian cada 3.5s mostrando ejemplos de uso
- Sugerencias rápidas (chips): "deshacer ultimo commit", "crear rama nueva", "stash mis cambios", "ver log compacto"
- Atajo de teclado: Cmd+Enter / Ctrl+Enter para generar
- Respuesta estructurada: comando + panel de explicación (Qué hace / Cómo funciona / Por qué usarlo)

### Modo Educativo
- Toggle que activa highlight en los flags del comando (color ámbar, subrayado punteado)
- Tooltips emergentes al hacer clic sobre cada flag (ej. `--soft`, `HEAD~1`)
- Hint educativo al pie del bloque de comando

### Historial y Búsqueda
- Persistencia del historial de comandos en Supabase Postgres
- Sidebar con historial: input truncado + comando + timestamp relativo
- Búsqueda full-text sobre input (español) y command (inglés) con debounce de 300ms
- Botón para limpiar todo el historial

### Multi-Provider IA
- Soporte para Anthropic (Claude), OpenAI (GPT) y Google Gemini
- Capa de abstracción en `src/lib/ai-provider.ts`
- Configuración de provider y modelo desde la página de settings
- Cada usuario trae su propia API key — la app nunca las almacena en texto plano

### Autenticación
- Supabase Auth con Magic Link (email) y GitHub OAuth
- Middleware que protege las rutas `/app/*`
- Sesión basada en cookies via `@supabase/ssr`

### Gestión de API Keys
- Página de settings con tarjetas por provider (icono, nombre, badge de conexión)
- Formulario inline para ingresar API key y seleccionar modelo
- Cifrado con Supabase Vault — las keys nunca llegan al cliente
- CRUD completo: GET / POST / DELETE via Route Handlers

### UX / UI
- Copy-to-clipboard con feedback de 2s ("Copiado")
- Loader giratorio con texto "Generando..." durante la llamada a IA
- Estados de error con borde rojo, texto de error y glow rojo
- Sidebar colapsable
- Dark mode exclusivo

---

## Diseño

### Enfoque
- **Dark theme only** — estética de terminal / dashboard oscuro
- **CSS Modules** (`*.module.css`) por componente + design tokens globales en `globals.css`
- Sin frameworks CSS — propiedades personalizadas nativas
- Sin Tailwind, sin CSS-in-JS, sin librerías externas de UI
- Animaciones globales: `spin`, `fadeIn`, `popIn`
- Scrollbar delgada personalizada (4px)
- `focus-visible` outlines en color acento

### Arquitectura de Componentes

```
┌─────────────────────────────────────────────────┐
│  Sidebar (historial + búsqueda)                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  InputCard (textarea + chips + botón)   │    │
│  ├─────────────────────────────────────────┤    │
│  │  ResultCard (comando + explicación)     │    │
│  │  └── CommandWithFlags (flags + tooltip) │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
├─────────────────────────────────────────────────┤
│  Tweaks (Modo Educativo / Sidebar toggle)       │
└─────────────────────────────────────────────────┘
```

### Tipografía
- **DM Sans** (sans-serif) — textos de UI, labels, cuerpo
- **JetBrains Mono** (monospace) — comandos, código, brand name, headings

---

## Paleta de Colores

| Token | OKLCH | Uso |
|-------|-------|-----|
| `--bg-base` | `oklch(0.12 0.01 240)` | Fondo principal (azul-negro muy oscuro) |
| `--bg-surface` | `oklch(0.16 0.012 240)` | Sidebar, input card, top bar |
| `--bg-elevated` | `oklch(0.19 0.012 240)` | Dropdowns, modales |
| `--bg-card` | `oklch(0.17 0.012 240)` | Fondos de tarjetas de resultado |
| `--border` | `oklch(0.26 0.015 240)` | Bordes y divisores |
| `--border-subtle` | `oklch(0.20 0.012 240)` | Bordes sutiles (interior de cards) |
| `--text-primary` | `oklch(0.92 0.01 240)` | Texto principal (blanco sucio) |
| `--text-secondary` | `oklch(0.62 0.015 240)` | Texto secundario |
| `--text-muted` | `oklch(0.44 0.012 240)` | Texto muted, labels, hints |
| `--accent` | `oklch(0.75 0.22 142)` | **Verde eléctrico** — acento principal, botones, subcomandos git |
| `--accent-dim` | `oklch(0.75 0.22 142 / 0.15)` | Fondo verde sutil para items activos |
| `--accent-glow` | `oklch(0.75 0.22 142 / 0.35)` | Efecto glow |
| `--amber` | `oklch(0.78 0.18 72)` | **Ámbar** — flags educativos, warnings |
| `--amber-dim` | `oklch(0.78 0.18 72 / 0.15)` | Fondo ámbar sutil para flags |
| `--red` | `oklch(0.65 0.20 22)` | **Rojo** — errores, acciones destructivas |
| `--red-dim` | `oklch(0.65 0.20 22 / 0.15)` | Fondo rojo sutil para errores |
| `--blue` | `oklch(0.72 0.16 240)` | **Azul** — acento OpenAI |
| `--blue-dim` | `oklch(0.72 0.16 240 / 0.15)` | Fondo azul sutil |

---

## Estructura del Proyecto

```
Prompt2Git/
├── Prompt2Git.html               # Prototipo visual de referencia (NO MODIFICAR)
├── middleware.ts                  # Next.js Middleware: protección de rutas via Auth
├── next.config.ts                 # Config Next.js (typedRoutes)
├── package.json                   # next 15.3, react 19, supabase-js, supabase/ssr
├── .env.local                     # Supabase URL, anon key, service role key, app URL
│
├── supabase/migrations/
│   ├── 001_schema.sql             # Tablas: provider_keys, commands
│   ├── 002_rls.sql                # Políticas Row Level Security
│   └── 003_fts.sql                # Full-text search + GIN index
│
└── src/
    ├── app/
    │   ├── layout.tsx             # Root layout: HTML shell + fonts + metadata
    │   ├── globals.css            # Design tokens, reset, animations
    │   ├── page.tsx               # Landing page (redirige a /app)
    │   │
    │   ├── app/
    │   │   ├── layout.tsx         # Layout protegido (wrapper vacío)
    │   │   ├── page.tsx           # PÁGINA PRINCIPAL — UI completa
    │   │   ├── page.module.css
    │   │   └── settings/
    │   │       ├── page.tsx       # Settings: gestión de API keys por provider
    │   │       └── settings.module.css
    │   │
    │   ├── login/
    │   │   ├── page.tsx           # Login: Magic Link + GitHub OAuth
    │   │   └── login.module.css
    │   │
    │   ├── auth/callback/
    │   │   └── route.ts           # Intercambia código OAuth por sesión
    │   │
    │   └── api/
    │       ├── generate/route.ts  # POST: valida sesión, llama IA, guarda comando
    │       ├── commands/
    │       │   ├── route.ts       # GET: historial paginado (cursor-based)
    │       │   └── search/route.ts# GET: full-text search
    │       ├── keys/route.ts      # GET/POST/DELETE: API keys via Vault
    │       └── settings/keys/route.ts # GET/POST/DELETE: (pendiente integración Vault)
    │
    ├── components/
    │   ├── sidebar/
    │   │   ├── index.tsx          # Sidebar: logo, búsqueda, historial, clear
    │   │   └── sidebar.module.css
    │   ├── result-card/
    │   │   ├── index.tsx          # ResultCard: comando + explicación colapsable
    │   │   └── result-card.module.css
    │   ├── command-with-flags/
    │   │   ├── index.tsx          # Syntax highlighting + tooltips educativos
    │   │   └── command-with-flags.module.css
    │   └── ui/
    │       ├── icons.tsx          # 8 componentes SVG (Git, Copy, Search, etc.)
    │       └── utils.ts           # timeAgo() helper
    │
    ├── hooks/
    │   └── use-commands.ts        # Hook: consulta paginada a Supabase (50 por página)
    │
    ├── lib/
    │   ├── ai-provider.ts         # Abstracción multi-provider (Anthropic, OpenAI, Gemini)
    │   └── supabase/
    │       ├── client.ts          # Cliente browser
    │       ├── server.ts          # Cliente server-side (cookies)
    │       ├── admin.ts           # Cliente admin (service_role)
    │       └── types.ts           # Tipos generados de Supabase
    │
    └── types/
        └── index.ts               # Tipos compartidos: Provider, Command, Flag, etc.
```

### Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15.3 (App Router) |
| Lenguaje | TypeScript strict |
| Estilos | CSS Modules + Custom Properties |
| Base de datos | Supabase Postgres + RLS |
| Autenticación | Supabase Auth (Magic Link + GitHub OAuth) |
| Cifrado | Supabase Vault |
| IA | Anthropic Claude, OpenAI GPT, Google Gemini |
| Despliegue | Vercel |

---

## Roadmap

### Fase 0 — Base ✅ (completada)
Todo lo documentado arriba: traducción NL→Git, modo educativo, historial + FTS, multi-provider, auth, Vault, RLS.

---

### Fase 1 — Infraestructura de escala
**Objetivo:** reducir costos operativos y proteger el sistema antes de crecer.

- [ ] **Cache semántico con pgvector** — migración `004_embeddings.sql`, columna `embedding vector(1536)` en tabla `commands`. Pipeline: `normalize → embedding → similarity search → if hit return cached, else call AI + save`.
- [ ] **Rate limiting por usuario** — middleware en `/api/generate` con conteo por ventana de tiempo en Redis o tabla Supabase. Evita abuso antes de tener plan de pago.
- [ ] **Completar integración Vault** en `settings/keys/route.ts` (marcado como pendiente).

> Desbloquea: reducción de costos de API antes de escalar usuarios.

---

### Fase 2 — Context awareness del repositorio
**Objetivo:** pasar de herramienta pasiva a asistente que entiende dónde está el usuario.

- [ ] **GitHub read-only integration** — usar el OAuth de GitHub ya implementado para leer: rama actual, archivos staged/unstaged, último commit, estado del repo.
- [ ] **Prompt contextualizado** — inyectar el contexto del repo al prompt de IA para que genere comandos precisos (ej. `git push origin feature-branch` con la rama real).
- [ ] **"Fix my repo"** — feature diferencial: el usuario describe un problema ("rompí mi repo"), el sistema analiza el estado y sugiere soluciones ordenadas por riesgo (stash → reset → rebase).

> Desbloquea: el argumento de venta real. Sin esto el producto sigue siendo un wrapper.

---

### Fase 3 — Distribución: VS Code Extension
**Objetivo:** llegar al flujo real del developer, no al browser.

- [ ] **Scaffolding de la extensión** — proyecto separado en `packages/vscode-extension/`, publicado en Marketplace.
- [ ] **Command Palette:** `Prompt2Git: Describe action` — abre input flotante, llama a la misma API web, muestra resultado.
- [ ] **Context automático** — la extensión lee el workspace de VS Code (rama, git status) y lo envía junto al input.
- [ ] **Ejecución directa** — botón "Run in terminal" con preview antes de ejecutar.

> Depende de Fase 2: el context del repo tiene que estar listo antes de que la extensión lo envíe.

---

### Fase 4 — Inteligencia y retención (Memory Layer)
**Objetivo:** que el producto mejore con el uso, generando hábito.

- [ ] **Detección de patrones frecuentes** — analizar historial por usuario, detectar secuencias comunes (add → commit → push).
- [ ] **Quick Actions** — superficie en la UI/extensión con acciones de 1 click basadas en el historial del usuario.
- [ ] **Sugerencias automáticas** — al abrir la app, mostrar "¿Querés hacer lo mismo que ayer?" basado en contexto temporal.

> Depende de Fase 1 (cache) y Fase 2 (contexto). Sin datos reales de uso no se puede construir esto bien.

---

### Fase 5 — Monetización
**Objetivo:** convertir el valor creado en las fases anteriores en ingresos sostenibles.

- [ ] **Stripe** — conectar y configurar pasarela de pagos (productos, precios, webhooks, checkout session, customer portal)
- [ ] **Tabla `subscriptions`** en Supabase vinculada a `auth.users` para reflejar estado de suscripción desde webhooks de Stripe
- [ ] **Tier Free** — límite diario de queries, sin cache semántico, sin contexto GitHub.
- [ ] **Tier Pro ($8–12/mes)** — cache inteligente, historial completo, multi-provider, contexto GitHub, extensión VS Code.
- [ ] **BYOK como diferencial** — usuarios con sus propias keys no cuentan contra el límite de queries (incentivo para traer key).
- [ ] **Página de pricing** — landing actualizada con comparativa de planes.

> No implementar antes de tener retención real de usuarios (Fase 3 completada).

---

### Posicionamiento objetivo

> "El copiloto de Git que entiende tu repo y te saca de donde estás atascado."

No vender IA. Vender tiempo recuperado y errores evitados.
