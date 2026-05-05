import { createAdminClient } from './supabase/admin'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: string
}

const DAILY_LIMIT = 50

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const admin = createAdminClient()
  const { count, error } = await admin
    .from('commands')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())

  if (error) {
    console.error('Rate limit check error:', error)
    return { allowed: true, remaining: DAILY_LIMIT, resetAt: '' }
  }

  const used = count ?? 0
  const remaining = Math.max(0, DAILY_LIMIT - used)

  const tomorrow = new Date(today)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

  return {
    allowed: remaining > 0,
    remaining,
    resetAt: tomorrow.toISOString(),
  }
}
