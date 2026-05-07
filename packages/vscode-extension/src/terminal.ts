import * as vscode from 'vscode'

const HIGH_RISK_KEYWORDS = ['--force', 'reset --hard', '--amend', 'push --force', 'push -f', 'rebase --onto']

function hasHighRisk(command: string): boolean {
  return HIGH_RISK_KEYWORDS.some((kw) => command.includes(kw))
}

export async function confirmAndRun(command: string): Promise<void> {
  const isRisky = hasHighRisk(command)
  const preview = `$ ${command}`

  const confirm = isRisky
    ? await vscode.window.showWarningMessage(
        `Comando de riesgo alto:\n\n${preview}\n\n¿Ejecutar de todas formas?`,
        { modal: true, detail: 'Este comando puede destruir cambios no guardados.' },
        'Ejecutar',
        'Cancelar',
      )
    : await vscode.window.showInformationMessage(
        `Ejecutar:\n\n${preview}`,
        { modal: true },
        'Ejecutar',
        'Cancelar',
      )

  if (confirm !== 'Ejecutar') return

  const terminal = vscode.window.createTerminal('GitSpeak')
  terminal.show()
  terminal.sendText(command)
}
