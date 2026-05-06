import type { Provider, GenerateResult, FixResult } from '@/types'

export interface ProviderConfig {
  provider: Provider
  apiKey: string
  model: string
  lang?: 'es' | 'en'
  repoContext?: { branch: string; last_commit: string }
}

const MODELS: Record<Provider, string> = {
  anthropic:   'claude-haiku-4-5-20251001',
  openai:      'gpt-4o-mini',
  gemini:      'gemini-1.5-flash',
  groq:        'llama-3.1-8b-instant',
  mistral:     'mistral-small-latest',
  openrouter:  'meta-llama/llama-3.1-8b-instruct:free',
}

const OPENAI_COMPAT_ENDPOINTS: Partial<Record<Provider, string>> = {
  openai:     'https://api.openai.com/v1/chat/completions',
  groq:       'https://api.groq.com/openai/v1/chat/completions',
  mistral:    'https://api.mistral.ai/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
}

export const DEFAULT_MODELS = MODELS

function buildPrompt(input: string, lang: 'es' | 'en' = 'es', repoContext?: { branch: string; last_commit: string }): string {
  const isEn = lang === 'en'
  const repoInfo = repoContext
    ? `\n\nEl usuario está en la rama \`${repoContext.branch}\`. Último commit: \`${repoContext.last_commit}\`.`
    : ''

  return `You are a Git expert assistant. The user will describe a Git action in natural language (${isEn ? 'in English' : 'in Spanish'}).

Your task:
1. Translate the description into the most appropriate Git command
2. Provide a 3-part explanation ${isEn ? 'in English' : 'in Spanish'}
3. List all flags/arguments in the command with their meanings ${isEn ? 'in English' : 'in Spanish'}

Respond with ONLY valid JSON in this exact format:
{
  "command": "git <command>",
  "explanation": [
    { "what": "${isEn ? 'What does it do?' : '¿Qué hace?'}", "text": "..." },
    { "what": "${isEn ? 'How does it work?' : '¿Cómo funciona?'}", "text": "..." },
    { "what": "${isEn ? 'Why use it?' : '¿Por qué usarlo?'}", "text": "..." }
  ],
  "flags": [
    { "flag": "--flag-name", "meaning": "..." }
  ]
}

Rules:
- Only include flags/arguments that actually appear in the command
- All explanation text and flag meanings must be ${isEn ? 'in English' : 'in Spanish'}
- command must be a syntactically correct git command
- If the command has no flags or special arguments, return "flags": []
- If the request is not related to Git version control, return: {"error": "not_git"}

User request: "${input}"${repoInfo}`
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

async function callOpenAICompat(config: ProviderConfig, prompt: string): Promise<string> {
  const endpoint = OPENAI_COMPAT_ENDPOINTS[config.provider]!
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
  }
  if (config.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://prompt2git.app'
    headers['X-Title'] = 'Prompt2Git'
  }
  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `${config.provider} error ${res.status}`)
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
  const prompt = buildPrompt(input, config.lang ?? 'es', config.repoContext)
  let raw: string

  switch (config.provider) {
    case 'anthropic':  raw = await callAnthropic(config, prompt);    break
    case 'openai':
    case 'groq':
    case 'mistral':
    case 'openrouter': raw = await callOpenAICompat(config, prompt); break
    case 'gemini':     raw = await callGemini(config, prompt);       break
    default: throw new Error(`Proveedor no soportado: ${config.provider}`)
  }

  return parseResponse(raw)
}

function buildFixPrompt(gitStatus: string, problemDescription: string, lang: 'es' | 'en'): string {
  const isEn = lang === 'en'

  return `You are a Git expert assistant specialized in diagnosing and fixing repository issues.

The user has provided their current git status and a description of the problem they are facing.

Git status:
\`\`\`
${gitStatus}
\`\`\`

Problem description: "${problemDescription}"

Your task is to analyze the situation and provide a step-by-step plan to fix it. Each step should be a single git command ordered by risk.

Respond with ONLY valid JSON in this exact format:
{
  "steps": [
    {
      "order": 1,
      "command": "git <command>",
      "risk": "low",
      "description": "${isEn ? 'Clear explanation of what this step does' : 'Explicación clara de lo que hace este paso'}"
    }
  ]
}

Risk levels:
- "low": Safe operations that don't lose data (stash, log, status, diff, checkout file, reset --soft)
- "medium": Operations that modify history or require force (rebase, reset --mixed, commit --amend)
- "high": Destructive operations that can lose data (reset --hard, push --force, branch -D)

Rules:
- Order steps from lowest risk to highest risk
- Try to solve the problem with the safest approach first
- Each command must be a syntactically correct git command
- ${isEn ? 'All descriptions must be in English' : 'Todas las descripciones deben estar en español'}
- If the request is not related to Git version control, return: {"error": "not_git"}
- If there is no clear fix, suggest the safest diagnostic step first`
}

function parseFixResponse(raw: string): FixResult {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Formato de respuesta inválido')
  const parsed = JSON.parse(match[0]) as { error?: string } & FixResult
  if (parsed.error === 'not_git') throw new Error('not_git')
  return { steps: parsed.steps ?? [] }
}

export async function generateFix(config: ProviderConfig, gitStatus: string, problemDescription: string): Promise<FixResult> {
  const prompt = buildFixPrompt(gitStatus, problemDescription, config.lang ?? 'es')
  let raw: string

  switch (config.provider) {
    case 'anthropic':  raw = await callAnthropic(config, prompt);    break
    case 'openai':
    case 'groq':
    case 'mistral':
    case 'openrouter': raw = await callOpenAICompat(config, prompt); break
    case 'gemini':     raw = await callGemini(config, prompt);       break
    default: throw new Error(`Proveedor no soportado: ${config.provider}`)
  }

  return parseFixResponse(raw)
}
