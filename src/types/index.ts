export type Provider = 'anthropic' | 'openai' | 'gemini' | 'groq' | 'mistral' | 'openrouter'

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
  from_cache?: boolean
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

export interface GitHubConnection {
  id: string
  user_id: string
  username: string
  connected_at: string
}

export interface GitHubRepo {
  owner: string
  name: string
  default_branch: string
  private: boolean
}

export interface GitHubContext {
  branch: string
  last_commit: string
  open_prs_count: number
}

export interface FixStep {
  order: number
  command: string
  risk: 'low' | 'medium' | 'high'
  description: string
}

export interface FixResult {
  steps: FixStep[]
}
