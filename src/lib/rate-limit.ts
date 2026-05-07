import { createAdminClient } from './supabase/admin'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: string
}

export const FREE_LIMIT = 10
export const PRO_LIMIT = 500

export async function checkRateLimit(userId: string, dailyLimit: number = FREE_LIMIT): Promise<RateLimitResult> {
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
    return { allowed: true, remaining: dailyLimit, resetAt: '' }
  }

  const used = count ?? 0
  const remaining = Math.max(0, dailyLimit - used)

  const tomorrow = new Date(today)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

  return {
    allowed: remaining > 0,
    remaining,
    resetAt: tomorrow.toISOString(),
  }
}
