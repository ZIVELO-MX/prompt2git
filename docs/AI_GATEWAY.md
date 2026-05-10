# AI Gateway — Prompt2Git

Sistema de enrutamiento de modelos de IA por plan de usuario. Permite que la plataforma use modelos gratuitos de terceros sin incurrir en costo de inferencia, y que usuarios Pro elijan el modelo que prefieran.

---

## Problema que resuelve

Sin un gateway, la plataforma tendría que:

- Pagar por inferencia de modelos premium para todos los usuarios, o
- Dar a todos el mismo modelo sin distinción de plan.

El gateway permite:

- **Costo $0 de inferencia** — todos los modelos disponibles son gratuitos (OpenRouter free tier + OpenCode Zen free models).
- **Diferenciación de plan** — Starter tiene un modelo default fijo; Pro elige entre todo el catálogo.
- **BYOK sin cambios** — usuarios con API key propia bypasean el gateway completamente.

---

## Arquitectura

```
POST /api/generate
        │
        ▼
getProviderConfig(userId, selectedModelOverride?)
        │
        ├─ ¿Tiene BYOK? ──YES──► su key + su modelo configurado  (plan: pro)
        │
        └─ NO
             │
             ▼
        selectModel(plan, selectedModel?)
             │
             ├─ plan: starter ──► llama-3.1-8b en OpenRouter (default fijo)
             │
             └─ plan: pro ──────► modelo elegido por el usuario del catálogo FREE_MODELS
                                  default: llama-3.1-8b si no ha elegido
             │
             ▼
        apiKey = ZEN_API_KEY | OPENROUTER_API_KEY  (según provider del modelo)
             │
             ▼
        generateWithFallback([primaryConfig, openrouterFallback], input, userId)
```

---

## Proveedores free

### OpenRouter

- **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
- **Auth:** `Authorization: Bearer $OPENROUTER_API_KEY`
- **Compatibilidad:** OpenAI-compatible
- **Modelo usado:** `meta-llama/llama-3.1-8b-instruct:free`

### OpenCode Zen

- **Endpoint:** `https://opencode.ai/zen/v1/chat/completions`
- **Auth:** `Authorization: Bearer $ZEN_API_KEY`
- **Compatibilidad:** OpenAI-compatible
- **Nota:** requiere cuenta + $20 de prepago; los modelos marcados `:free` no consumen saldo.

---

## Catálogo de modelos — `FREE_MODELS`

Definido en `src/lib/models.ts`. Importado tanto en el cliente (selector UI) como en el servidor (ruta de generate).

| Key | Provider | Model ID | Label |
|-----|----------|----------|-------|
| `llama-3.1-8b` | openrouter | `meta-llama/llama-3.1-8b-instruct:free` | Llama 3.1 8B |
| `big-pickle` | zen | `big-pickle` | Big Pickle |
| `minimax-m2.5` | zen | `minimax-m2.5-free` | MiniMax M2.5 |
| `ling-2.6-flash` | zen | `ling-2.6-flash-free` | Ling 2.6 Flash |
| `hy3-preview` | zen | `hy3-preview-free` | Hy3 Preview |
| `nemotron-3` | zen | `nemotron-3-super-free` | Nemotron 3 Super |

---

## Planes

| Plan | Límite | Modelos disponibles | BYOK |
|------|--------|---------------------|------|
| **Starter** | 20 cmd/mes | Llama 3.1 8B (fijo, sin elección) | No |
| **Pro** | 200 cmd/mes | Todo el catálogo FREE_MODELS (6 modelos) | Sí |

> **Regla:** La plataforma nunca paga por inferencia. El diferenciador de Pro es el límite más alto + elección de modelo + BYOK.

---

## Flujo de selección de modelo

### En el cliente (`src/app/app/page.tsx`)

```
montar página
    │
    ├─ fetch /api/preferences ──► selectedModel (estado local)
    │
    └─ fetch /api/usage/month ──► plan ('starter' | 'pro')
                                        │
                                        ▼
                              plan === 'pro'
                                  │
                                  YES ──► renderiza <select> con FREE_MODELS
                                  NO  ──► sin selector (modelo fijo no visible)
```

El selector aparece entre el contador de caracteres y el botón Generar. Al cambiar:

1. Actualiza estado local (inmediato).
2. `PATCH /api/preferences` con `{ selected_model: key }` (persistencia).
3. El key seleccionado se incluye en el body del fetch a `/api/generate`.

### En el servidor (`src/app/api/generate/route.ts`)

```ts
// Prioridad de resolución del modelo (sin BYOK):
const resolvedModel = selectedModelOverride   // 1. body del request (UI)
                   ?? prefs?.selected_model   // 2. DB (user_preferences)
                   ?? null                    // 3. default: llama-3.1-8b

const { provider, model } = selectModel(plan, resolvedModel)
const apiKey = provider === 'zen' ? ZEN_API_KEY : OPENROUTER_API_KEY
```

---

## API pública del gateway

### `selectModel(plan, preferredModelKey?)`

```ts
// src/lib/ai-provider.ts
export function selectModel(
  plan: Plan,
  preferredModelKey?: string | null
): { provider: Provider; model: string }
```

- Si `plan === 'pro'` y `preferredModelKey` existe en `FREE_MODELS` → usa ese modelo.
- En cualquier otro caso → Llama 3.1 8B en OpenRouter (Starter default).

### `FREE_MODELS`

```ts
// src/lib/models.ts — cliente y servidor
export const FREE_MODELS: Record<string, FreeModel>
```

Catálogo completo de modelos gratuitos disponibles. Importar desde aquí, no desde `ai-provider.ts` directamente en el cliente.

---

## Variables de entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `OPENROUTER_API_KEY` | Key de plataforma para OpenRouter | Sí |
| `ZEN_API_KEY` | Key de plataforma para OpenCode Zen | Sí |

Ambas son keys de la **plataforma** (no del usuario). Se leen únicamente en Server Components y Route Handlers — nunca se exponen al cliente.

---

## Archivos involucrados

```
src/
├── types/index.ts              — Plan = 'starter' | 'pro', Provider + 'zen'
├── lib/
│   ├── models.ts               — FREE_MODELS catalog, FreeModel type
│   └── ai-provider.ts          — selectModel(), endpoint zen, switch zen
└── app/
    ├── app/
    │   ├── page.tsx            — estado selectedModel, selector UI, handleModelChange
    │   └── page.module.css     — .modelSelect styles
    └── api/
        ├── generate/route.ts   — getProviderConfig con selectedModelOverride
        └── github/fix/route.ts — misma lógica de getProviderConfig

supabase/migrations/
└── 008_selected_model.sql      — columna selected_model en user_preferences
```

---

## Integración futura con Stripe

El gateway está preparado para cuando Stripe esté activo. Hoy el plan está hardcodeado a `'starter'` en `getProviderConfig`. Cuando los webhooks de Stripe actualicen el plan del usuario en DB, solo hay que leer ese campo y pasarlo a `selectModel()` — cero cambios en `ai-provider.ts` ni en el catálogo de modelos.

```ts
// Hoy:
const plan: Plan = 'starter'

// Cuando Stripe esté activo (cambio en getProviderConfig):
const { data: profile } = await supabase
  .from('profiles')
  .select('plan')
  .eq('id', userId)
  .single()
const plan: Plan = (profile?.plan as Plan) ?? 'starter'
```

---

## Fallback chain

Si el modelo primario falla (timeout, error 5xx), `generateWithFallback` intenta el siguiente en la lista:

```
[primaryConfig (zen o openrouter)]
    └─ falla ──► [openrouter llama-3.1-8b] (si el primario no era openrouter)
                    └─ falla ──► throw lastError
```

BYOK users tienen el mismo fallback: su modelo → openrouter free.
