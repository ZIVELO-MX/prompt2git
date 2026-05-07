import * as vscode from 'vscode'
import { getStoredToken } from './auth'
import type { GenerateRequest, GenerateResponse, FixRequest, FixResponse, ApiError } from './types'

function getApiUrl(): string {
  const config = vscode.workspace.getConfiguration('gitspeak')
  return config.get<string>('apiUrl') ?? 'https://www.prompt2git.com'
}

async function request<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const token = await getStoredToken()
  const url = `${getApiUrl()}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  const data = await response.json() as T | ApiError

  if (!response.ok) {
    const err = data as ApiError
    throw new Error(err.error ?? `HTTP ${response.status}`)
  }

  return data as T
}

export async function generate(req: GenerateRequest): Promise<GenerateResponse> {
  return request<GenerateResponse>('/api/generate', req)
}

export async function fix(req: FixRequest): Promise<FixResponse> {
  return request<FixResponse>('/api/github/fix', req)
}
