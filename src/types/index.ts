export type Provider = 'anthropic' | 'openai' | 'gemini'

export interface ExplanationItem {
  what: string
  text: string
}

export interface Flag {
  flag: string
  meaning: string
}

export interface Command {
  id: string
  user_id: string
  input: string
  command: string
  explanation: ExplanationItem[]
  flags: Flag[]
  provider: Provider
  model: string
  created_at: string
}

export interface ProviderKey {
  id: string
  user_id: string
  provider: Provider
  model: string
  created_at: string
  // encrypted_key nunca sale del servidor
}

export interface GenerateResult {
  command: string
  explanation: ExplanationItem[]
  flags: Flag[]
}
