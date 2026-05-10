type EnvVar = {
  key: string
  required: boolean
  serverOnly: boolean
  description: string
}

const ENV_VARS: EnvVar[] = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    serverOnly: false,
    description: 'URL del proyecto en Supabase',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    serverOnly: false,
    description: 'Clave anónima de Supabase (client-safe)',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    serverOnly: true,
    description: 'Clave service_role de Supabase — solo se usa en servidor para Vault',
  },
  {
    key: 'NEXT_PUBLIC_APP_URL',
    required: false,
    serverOnly: false,
    description: 'URL base de la app para redirects',
  },
  {
    key: 'OPENROUTER_API_KEY',
    required: false,
    serverOnly: true,
    description: 'Key de OpenRouter para el plan free (solo servidor)',
  },
  {
    key: 'ZEN_API_KEY',
    required: false,
    serverOnly: true,
    description: 'Key de OpenCode Zen para modelos free (solo servidor)',
  },
]

export function validateEnv(): void {
  const missing: string[] = []
  const leaked: string[] = []

  for (const v of ENV_VARS) {
    if (v.required && !process.env[v.key]) {
      missing.push(v.key)
    }
    if (v.serverOnly && v.key.startsWith('NEXT_PUBLIC_')) {
      leaked.push(v.key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[env] Faltan variables de entorno obligatorias:\n` +
      missing.map((k) => {
        const v = ENV_VARS.find((e) => e.key === k)
        return `  • ${k} — ${v?.description ?? ''}`
      }).join('\n') +
      '\n\nCreá un archivo .env.local basado en .env.example'
    )
  }

  if (leaked.length > 0) {
    throw new Error(
      `[env] Variables server-only expuestas al cliente (prefijo NEXT_PUBLIC_):\n` +
      leaked.map((k) => `  • ${k}`).join('\n')
    )
  }
}

if (typeof window === 'undefined') {
  validateEnv()
}
