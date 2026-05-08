import { createClient } from './supabase/server'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: string
}

export const FREE_LIMIT = 20
export const PRO_LIMIT = 999_999

export async function checkRateLimit(userId: string, monthlyLimit: number = FREE_LIMIT): Promise<RateLimitResult> {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

  const supabase = await createClient()
  const { count, error } = await supabase
    .from('commands')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString())

  if (error) {
    console.error('Rate limit check error:', error)
    return { allowed: true, remaining: monthlyLimit, resetAt: nextMonth.toISOString() }
  }

  const used = count ?? 0
  const remaining = Math.max(0, monthlyLimit - used)

  return {
    allowed: remaining > 0,
    remaining,
    resetAt: nextMonth.toISOString(),
  }
}
