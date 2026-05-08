export type AILogEntry = {
  userId: string
  provider: string
  model: string
  latencyMs: number
  success: boolean
  inputLength: number
  error?: string
  isFallback?: boolean
}

export function logAIRequest(entry: AILogEntry): void {
  const status = entry.success ? 'OK  ' : 'FAIL'
  const fallback = entry.isFallback ? ' [fallback]' : ''
  const errorPart = entry.error ? ` error="${entry.error}"` : ''
  console.log(
    `[AI:${status}]${fallback} provider=${entry.provider} model=${entry.model}` +
    ` latency=${entry.latencyMs}ms inputLen=${entry.inputLength}${errorPart}`
  )
}
