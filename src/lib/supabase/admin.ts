import { createServerClient } from '@supabase/ssr'

// Cliente con service_role key — solo para operaciones de servidor que requieren
// privilegios elevados (leer secrets de Vault, operaciones administrativas).
// Nunca exponer este cliente al cliente ni en Server Components.
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}
