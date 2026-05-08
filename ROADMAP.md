# Prompt2Git — Roadmap

> De prototipo local a plataforma web multi-proveedor con auth y persistencia.

**Estado actual:** Standalone HTML. API key hardcodeada en localStorage. Sin auth, sin persistencia cross-device.  
**Objetivo final:** SaaS ligero. El usuario se registra, conecta su propia API key del proveedor que prefiera, y su historial de comandos se sincroniza en todos sus dispositivos.

---

## Fase 0 — Cimientos (semana 1–2)

Migrar el prototipo HTML a una base moderna antes de añadir nada más.

- [ ] Inicializar proyecto **Next.js 14+ App Router** con TypeScript strict
- [ ] Instalar y configurar **Supabase** (proyecto en cloud, CLI local, variables de entorno)
- [ ] Configurar **Vercel** y conectar repo (deploy automático en cada push a `main`)
- [ ] Migrar la UI del HTML a componentes React — mantener el diseño pixel-perfect
- [ ] Separar design tokens en `globals.css` con las variables CSS actuales

**Entregable:** La misma app que existe hoy, pero en Next.js, desplegada en Vercel, con URL pública.

---

## Fase 1 — Auth con Supabase (semana 2–3)

Registro e inicio de sesión antes de tocar features.

- [ ] Activar **Supabase Auth** con Magic Link (sin contraseña) + GitHub OAuth
- [ ] Crear middleware de Next.js para proteger rutas autenticadas
- [ ] Página de landing pública (`/`) con propuesta de valor y CTA de registro
- [ ] Página de auth (`/login`) — formulario minimalista, on-brand
- [ ] Redirigir a `/app` tras login; redirigir a `/login` si no hay sesión

**Schema inicial en Supabase:**
```sql
-- Los usuarios los gestiona Supabase Auth (tabla auth.users)
-- Nada más por ahora; el perfil de proveedor va en Fase 2
```

---

## Fase 2 — API Keys de proveedores (semana 3–4)

Cada usuario conecta su propia key. Nosotros nunca la almacenamos en texto plano.

- [ ] Tabla `provider_keys` en Supabase con RLS estricto (solo el dueño puede leer/escribir)
- [ ] Cifrar la key con **Supabase Vault** o AES-256 antes de persistir
- [ ] UI de configuración en `/app/settings` para gestionar keys por proveedor
- [ ] Soportar desde el día 1: **Anthropic**, **OpenAI**, **Google Gemini**
- [ ] Capa de abstracción `lib/ai-provider.ts` — interfaz única `complete(prompt)` para todos los proveedores

```
Schema:
provider_keys (
  id uuid PK,
  user_id uuid FK → auth.users,
  provider text,         -- 'anthropic' | 'openai' | 'gemini'
  encrypted_key text,
  model text,            -- modelo preferido por proveedor
  created_at timestamptz
)
```

**RLS:** `user_id = auth.uid()` en todas las operaciones.

---

## Fase 3 — Persistencia del historial (semana 4–5)

El historial de comandos sobrevive entre sesiones y dispositivos.

- [ ] Tabla `commands` con historial por usuario
- [ ] Migrar la lógica de estado local → queries a Supabase (con `@supabase/ssr`)
- [ ] Paginación del sidebar (primeros 50, lazy load al hacer scroll)
- [ ] Búsqueda en historial por texto libre (Supabase Full Text Search)
- [ ] Borrado individual y borrado total con confirmación

```
Schema:
commands (
  id uuid PK,
  user_id uuid FK → auth.users,
  input text NOT NULL,
  command text NOT NULL,
  explanation jsonb NOT NULL,
  flags jsonb NOT NULL DEFAULT '[]',
  provider text NOT NULL,
  model text NOT NULL,
  created_at timestamptz DEFAULT now()
)
```

---

## Fase 4 — Polish y lanzamiento (semana 5–6)

Antes de compartir el link con el mundo.

- [ ] Landing page completa: hero, demo animado, "Cómo funciona" (3 pasos), FAQ
- [ ] Onboarding post-registro: guía de 3 pasos para conectar la primera API key
- [ ] Límite de rate por usuario en servidor (middleware de Next.js) para evitar abuso
- [ ] Error boundaries y estados vacíos cuidados en toda la app
- [ ] Meta tags, og:image, favicon — identidad visual de Prompt2Git
- [ ] Dominio propio (ej. `prompt2git.dev` o `prompt2git.app`)

---

## Fase 5 — Crecimiento (post-lanzamiento)

### AI Gateway — Plan-based model routing
Cuando la monetización esté activa, extender el sistema de fallback para seleccionar el modelo según el plan del usuario:
- `free` → siempre modelo económico (openrouter free tier)
- `pro` → modelo balanceado (ej. gpt-4o-mini, claude-haiku)
- `pro_plus` → mejor modelo disponible (ej. gpt-4o, claude-sonnet)

Implementar en `src/lib/ai-provider.ts` como una función `selectModelTier(plan, provider)` que devuelve el model ID correcto. No requiere nuevas dependencias; extiende el `PROVIDER_MAP` existente.



Features que agregan valor sin comprometer la simpleza.

- [ ] **Comandos públicos** — opción de marcar un comando como público y obtener un link para compartir (`prompt2git.app/c/<slug>`)
- [ ] **Colecciones** — agrupar comandos frecuentes en "recetarios" (ej. "Mi flujo de rebase")
- [ ] **Modo offline** — Service Worker para cachear la app y funcionar sin red con el historial local
- [ ] **CLI companion** — script de bash que apunta a la API de Prompt2Git para usarlo desde la terminal
- [ ] **Analytics de uso** — qué comandos se generan más, qué proveedores usan los usuarios (datos agregados, sin PII)

---

## Stack decidido

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 App Router + TypeScript |
| Estilos | CSS custom properties (tokens del prototipo actual) |
| Auth | Supabase Auth — Magic Link + GitHub OAuth |
| Base de datos | Supabase Postgres + RLS |
| Secretos | Supabase Vault (cifrado de API keys) |
| Deploy | Vercel |
| AI providers | Anthropic, OpenAI, Google Gemini (capa de abstracción propia) |

---

## Principios de diseño

- **El usuario es dueño de sus keys** — nunca las almacenamos en texto plano, nunca las logueamos, nunca las enviamos a terceros que no sea el proveedor elegido.
- **Zero lock-in** — si el usuario quiere migrar de proveedor, cambia la key y listo. Sus datos (historial) son exportables.
- **Simplicidad primero** — cada fase debe poder usarse sin completar la siguiente. Si falla Fase 3, la app sigue siendo útil con historial local.
