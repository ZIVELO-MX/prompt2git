export type Lang = 'es' | 'en'

export interface GitContext {
  branch: string
  status: string
  lastCommit: string
}

export interface RepoContext {
  branch: string
  last_commit: string
}

export interface GenerateRequest {
  input: string
  lang?: Lang
  repoContext?: RepoContext
}

export interface ExplanationItem {
  what: string
  text: string
}

export interface Flag {
  flag: string
  meaning: string
}

export interface CommandResult {
  id: string
  user_id: string
  input: string
  command: string
  explanation: ExplanationItem[]
  flags: Flag[]
  provider: string
  model: string
  created_at: string
  from_cache?: boolean
}

export interface GenerateResponse {
  command: CommandResult
}

export interface FixStep {
  order: number
  command: string
  risk: 'low' | 'medium' | 'high'
  description: string
}

export interface FixRequest {
  git_status: string
  problem_description: string
  lang?: Lang
}

export interface FixResponse {
  steps: FixStep[]
}

export interface ApiError {
  error: string
}
