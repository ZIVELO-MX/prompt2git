import * as vscode from 'vscode'
import { initAuth, handleAuthCallback } from './auth'
import { openPanel } from './panel'

class AuthUriHandler implements vscode.UriHandler {
  handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
    handleAuthCallback(uri)
  }
}

export function activate(context: vscode.ExtensionContext) {
  initAuth(context)

  context.subscriptions.push(
    vscode.window.registerUriHandler(new AuthUriHandler()),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('gitspeak.open', () => openPanel(context)),
  )
}

export function deactivate() {}
