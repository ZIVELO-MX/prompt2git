import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getGitHubToken(userId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data: conn } = await supabase
    .from('github_connections')
    .select('vault_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!conn?.vault_id) return null

  const admin = createAdminClient()
  const { data: secret } = await admin
    .schema('vault')
    .from('decrypted_secrets')
    .select('decrypted_secret')
    .eq('id', conn.vault_id)
    .maybeSingle()

  return secret?.decrypted_secret ?? null
}
