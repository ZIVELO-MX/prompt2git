import type { Provider, GenerateResult } from '@/types'

export interface ProviderConfig {
  provider: Provider
  apiKey: string
  model: string
}

const MODELS: Record<Provider, string> = {
  anthropic: 'claude-haiku-4-5-20251001',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-1.5-flash',
}

export const DEFAULT_MODELS = MODELS

function buildPrompt(input: string): string {
  return `You are a Git expert assistant. The user will describe a Git action in natural language (in Spanish).

Your task:
1. Translate the description into the most appropriate Git command
2. Provide a 3-part explanation in Spanish
3. List all flags/arguments in the command with their meanings in Spanish

Respond with ONLY valid JSON in this exact format:
{
  "command": "git <command>",
  "explanation": [
    { "what": "¿Qué hace?", "text": "..." },
    { "what": "¿Cómo funciona?", "text": "..." },
    { "what": "¿Por qué usarlo?", "text": "..." }
  ],
  "flags": [
    { "flag": "--flag-name", "meaning": "..." }
  ]
}

Rules:
- Only include flags/arguments that actually appear in the command
- All explanation text and flag meanings must be in Spanish
- command must be a syntactically correct git command
- If the command has no flags or special arguments, return "flags": []
- If the request is not related to Git version control, return: {"error": "not_git"}

User request: "${input}"`
}

async function callAnthropic(config: ProviderConfig, prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `Anthropic error ${res.status}`)
  }
  const data = await res.json() as { content: Array<{ text: string }> }
  return data.content[0]?.text ?? ''
}

async function callOpenAI(config: ProviderConfig, prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `OpenAI error ${res.status}`)
  }
  const data = await res.json() as { choices: Array<{ message: { content: string } }> }
  return data.choices[0]?.message.content ?? ''
}

async function callGemini(config: ProviderConfig, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024 },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `Gemini error ${res.status}`)
  }
  const data = await res.json() as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> }
  return data.candidates[0]?.content.parts[0]?.text ?? ''
}

function parseResponse(raw: string): GenerateResult {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Formato de respuesta inválido')
  const parsed = JSON.parse(match[0]) as { error?: string } & GenerateResult
  if (parsed.error === 'not_git') throw new Error('not_git')
  return {
    command: parsed.command,
    explanation: parsed.explanation,
    flags: parsed.flags ?? [],
  }
}

export async function generate(config: ProviderConfig, input: string): Promise<GenerateResult> {
  const prompt = buildPrompt(input)
  let raw: string

  switch (config.provider) {
    case 'anthropic': raw = await callAnthropic(config, prompt); break
    case 'openai':    raw = await callOpenAI(config, prompt);    break
    case 'gemini':    raw = await callGemini(config, prompt);    break
    default: throw new Error(`Proveedor no soportado: ${config.provider}`)
  }

  return parseResponse(raw)
}
