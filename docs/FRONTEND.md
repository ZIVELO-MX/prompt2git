# Frontend — Prompt2Git

## Módulos

### Landing (`/`)

Página de marketing estática. Sin estado, sin fetch. Componentes:

| Archivo | Rol |
|---------|-----|
| `src/app/page.tsx` | Página principal — hero, features, comparativa, testimonios, CTA, footer |
| `src/app/page.module.css` | Estilos de la landing |
| `src/components/landing/how-it-works.tsx` | Carrusel interactivo de 3 pasos (auto-rotación 4s, clic para navegar) |
| `src/components/landing/theme-toggle.tsx` | Toggle claro/oscuro. Lee `localStorage.p2g_theme`, fallback a `prefers-color-scheme`. Setea `data-theme` en `<html>`. |
| `src/components/landing/email-cta.tsx` | Captura de email con 3 estados: `idle`, `error`, `done` |

### App (`/app`)

Núcleo de la aplicación. Single-page interactiva con sidebar y área de generación. `'use client'`.

| Archivo | Rol |
|---------|-----|
| `src/app/app/page.tsx` | Página principal del app — orquesta toda la UI |
| `src/app/app/page.module.css` | Estilos del layout del app |
| `src/app/app/layout.tsx` | Layout passthrough (sesión ya validada por middleware) |
| `src/components/sidebar/index.tsx` | Sidebar de historial (280px). Search debounced 300ms vía `/api/commands/search`. |
| `src/components/result-card/index.tsx` | Muestra el comando generado + explicación colapsable + badge de caché |
| `src/components/command-with-flags/index.tsx` | Renderizado tokenizado del comando. Colores: `git` verde, subcomando cyan, flags naranja. En Modo Educativo las flags son clickeables con tooltip. |
| `src/components/onboarding/index.tsx` | Modal de 3 pasos para primer uso. Persiste en `localStorage.p2g_onboarded`. |

### Settings (`/app/settings`)

Configuración de proveedores de IA. Grid de 6 tarjetas con formulario inline.

| Archivo | Rol |
|---------|-----|
| `src/app/app/settings/page.tsx` | Grid de 6 proveedores, formulario de conexión, selector de modelo |
| `src/app/app/settings/settings.module.css` | Estilos de settings |

### Componentes compartidos

| Archivo | Rol |
|---------|-----|
| `src/components/ui/icons.tsx` | 17 iconos SVG inline |
| `src/components/ui/utils.ts` | `timeAgo()` — timestamps relativos en español |
| `src/components/pricing-modal/index.tsx` | Modal de pricing (3 planes, toggle billing, backdrop, Escape cierra) |

---

## Flujo UI → acción → resultado

```
1. Usuario escribe en textarea (textarea, 280 chars, placeholders rotativos)
       │
2. [Opcional] ⌘+Enter o clic en "Generar →"
       │
3. Client → POST /api/generate { input, lang? }
       │
       ├── 200 → ResultCard: comando + explicación + flags
       ├── 429 → Banner: "Límite diario alcanzado" + reset time
       ├── 400 "not_git" → Error: "No parece relacionado con Git"
       └── 5xx → Error message
       │
4. Resultado se muestra debajo del input
   Sidebar se actualiza con nuevo item al tope
```

Estados del textarea:
- **Normal**: placeholder rotativo, contador de caracteres
- **Warning**: contador >240 en amarillo
- **Loading**: textarea deshabilitado, spinner en botón
- **Blocked (rate limit 0)**: textarea deshabilitado, banner 429 visible
- **Error**: mensaje de error debajo del textarea

---

## Decisiones de diseño UX

| Decisión | Razón |
|----------|-------|
| **Sin Tailwind** | CSS custom properties + CSS Modules. Menor complejidad, sin capa extra. |
| **`data-theme` en `<html>`** | Todos los CSS modules reaccionan al tema sin contexto React ni providers. El theming vive a nivel de DOM, no de estado. |
| **localStorage para preferencias** | Tema, onboarding completado, sidebar visible. No requieren persistencia server-side. |
| **Sidebar opcional** | El usuario puede ocultarla para más espacio horizontal. Preferencia persiste en localStorage. |
| **Modo Educativo** | Clic en flags del comando muestra tooltip con significado. Decide en el frontend — el servidor siempre devuelve flags, el cliente decide si mostrarlas interactivas. |
| **Rotación de placeholders** | Muestra ejemplos distintos cada ~3s para inspirar al usuario sin abrumar con chips. |
| **Debounce 300ms en search** | Evita llamadas innecesarias al API mientras el usuario escribe. Suficiente para no sentir latencia. |
| **Onboarding solo 1 vez** | `localStorage.p2g_onboarded` evita que usuarios recurrentes vean el modal. Fácil de resetear. |
| **Sin React Query / SWR** | Fetch directo con `useState` + `useEffect`. Suficiente para app sin polling ni revalidación frecuente. |
| **Caché semántica** | El badge "⚡ Desde caché" en ResultCard indica que el resultado vino de pgvector, no del AI. Tranparencia para el usuario. |
| **Banner 429 con cuenta regresiva** | Muestra queries restantes. Al llegar a 0, bloquea input. El usuario sabe exactamente cuándo se resetea. |
