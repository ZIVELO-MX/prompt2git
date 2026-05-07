import * as vscode from 'vscode'
import { exec } from 'child_process'
import { promisify } from 'util'
import type { GitContext, RepoContext } from './types'

const execAsync = promisify(exec)

export function getWorkspacePath(): string | undefined {
  const folders = vscode.workspace.workspaceFolders
  if (!folders || folders.length === 0) return undefined
  return folders[0]!.uri.fsPath
}

export async function getGitContext(workspacePath: string): Promise<GitContext> {
  const [branchResult, statusResult, logResult] = await Promise.allSettled([
    execAsync('git branch --show-current', { cwd: workspacePath }),
    execAsync('git status --porcelain', { cwd: workspacePath }),
    execAsync('git log -1 --oneline', { cwd: workspacePath }),
  ])

  const branch = branchResult.status === 'fulfilled' ? branchResult.value.stdout.trim() : ''
  const status = statusResult.status === 'fulfilled' ? statusResult.value.stdout.trim() : ''
  const lastCommit = logResult.status === 'fulfilled' ? logResult.value.stdout.trim() : ''

  return { branch, status, lastCommit }
}

export function toRepoContext(ctx: GitContext): RepoContext | undefined {
  if (!ctx.branch) return undefined
  return { branch: ctx.branch, last_commit: ctx.lastCommit }
}

export function hasDirtyStatus(ctx: GitContext): boolean {
  return ctx.status.length > 0
}
