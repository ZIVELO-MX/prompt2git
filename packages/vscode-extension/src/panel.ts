import * as vscode from 'vscode'
import { generate, fix } from './api'
import { getWorkspacePath, getGitContext, toRepoContext, hasDirtyStatus } from './git'
import { ensureAuthenticated } from './auth'
import { confirmAndRun } from './terminal'
import type { GitContext, FixStep } from './types'

type PanelMessage =
  | { type: 'generate'; prompt: string }
  | { type: 'fix'; gitStatus: string; description: string }
  | { type: 'execute'; command: string }
  | { type: 'ready' }

let currentPanel: vscode.WebviewPanel | undefined

export async function openPanel(context: vscode.ExtensionContext): Promise<void> {
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.Two)
    return
  }

  const panel = vscode.window.createWebviewPanel(
    'gitspeak',
    'GitSpeak',
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  )

  currentPanel = panel

  const workspacePath = getWorkspacePath()
  let gitCtx: GitContext | undefined

  if (workspacePath) {
    try {
      gitCtx = await getGitContext(workspacePath)
    } catch {
      gitCtx = undefined
    }
  }

  panel.webview.html = getWebviewHtml(gitCtx)

  panel.webview.onDidReceiveMessage(
    async (message: PanelMessage) => {
      switch (message.type) {
        case 'ready': {
          if (gitCtx && hasDirtyStatus(gitCtx)) {
            panel.webview.postMessage({ type: 'dirty-status', status: gitCtx.status })
          }
          break
        }

        case 'generate': {
          panel.webview.postMessage({ type: 'loading' })
          try {
            await ensureAuthenticated()
            const repoCtx = gitCtx ? toRepoContext(gitCtx) : undefined
            const res = await generate({ input: message.prompt, repoContext: repoCtx, lang: 'es' })
            panel.webview.postMessage({ type: 'result', data: res.command })
          } catch (err) {
            panel.webview.postMessage({ type: 'error', message: String(err) })
          }
          break
        }

        case 'fix': {
          panel.webview.postMessage({ type: 'loading' })
          try {
            await ensureAuthenticated()
            const res = await fix({ git_status: message.gitStatus, problem_description: message.description, lang: 'es' })
            panel.webview.postMessage({ type: 'fix-result', steps: res.steps })
          } catch (err) {
            panel.webview.postMessage({ type: 'error', message: String(err) })
          }
          break
        }

        case 'execute': {
          await confirmAndRun(message.command)
          break
        }
      }
    },
    undefined,
    context.subscriptions,
  )

  panel.onDidDispose(() => {
    currentPanel = undefined
  })
}

function riskBadge(risk: FixStep['risk']): string {
  const map = { low: '#3dd680', medium: '#5b8fd4', high: '#e07060' }
  return `<span class="risk-badge" style="color:${map[risk]};background:${map[risk]}1a">${risk}</span>`
}

function getWebviewHtml(gitCtx: GitContext | undefined): string {
  const branch = gitCtx?.branch ?? ''
  const lastCommit = gitCtx?.lastCommit ?? ''
  const hasCtx = !!branch

  return /* html */`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GitSpeak</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      #141821;
      --surface: #1b2230;
      --elev:    #212a38;
      --border:  #2c3a4e;
      --fg:      #e2e8f0;
      --fg2:     #7d90a5;
      --fg3:     #52627a;
      --accent:  #3dd680;
      --blue:    #5b8fd4;
      --red:     #e07060;
      --radius:  8px;
    }

    body {
      background: var(--bg);
      color: var(--fg);
      font-family: -apple-system, 'DM Sans', sans-serif;
      font-size: 13px;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px 10px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .logo {
      font-weight: 700;
      font-size: 14px;
      color: var(--fg);
      letter-spacing: -0.01em;
    }
    .logo-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--accent);
      margin-left: auto;
    }

    /* ── Context strip ── */
    .context-strip {
      display: ${hasCtx ? 'flex' : 'none'};
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--fg3);
      flex-shrink: 0;
    }
    .ctx-branch {
      color: var(--accent);
      font-weight: 500;
    }
    .ctx-sep { color: var(--border); }

    /* ── Mode toggle ── */
    .mode-bar {
      display: flex;
      gap: 2px;
      padding: 10px 16px 0;
      flex-shrink: 0;
    }
    .mode-btn {
      flex: 1;
      padding: 6px 0;
      background: none;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--fg2);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .mode-btn.active {
      background: var(--surface);
      border-color: var(--accent);
      color: var(--fg);
    }
    .mode-btn:first-child { border-radius: var(--radius) 0 0 var(--radius); }
    .mode-btn:last-child  { border-radius: 0 var(--radius) var(--radius) 0; }

    /* ── Scroll area ── */
    .scroll {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .scroll::-webkit-scrollbar { width: 4px; }
    .scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

    /* ── Input section ── */
    .section-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--fg3);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    textarea {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--fg);
      font-family: inherit;
      font-size: 13px;
      padding: 10px 12px;
      resize: vertical;
      min-height: 72px;
      line-height: 1.5;
      outline: none;
      transition: border-color 0.15s;
    }
    textarea:focus { border-color: var(--accent); }
    textarea::placeholder { color: var(--fg3); }

    /* ── Generate button ── */
    .btn-generate {
      width: 100%;
      padding: 9px 16px;
      background: var(--accent);
      color: #141821;
      border: none;
      border-radius: var(--radius);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .btn-generate:hover { opacity: 0.88; }
    .btn-generate:disabled { opacity: 0.45; cursor: not-allowed; }

    /* ── Suggestions ── */
    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--fg2);
      padding: 3px 10px;
      border: 1px solid var(--border);
      border-radius: 20px;
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s;
      background: none;
    }
    .chip:hover { border-color: var(--accent); color: var(--fg); }

    /* ── States ── */
    .state-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px;
      display: none;
    }
    .state-box.visible { display: block; }

    .loading-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--fg3);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .spinner {
      width: 14px; height: 14px;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-box {
      background: rgba(224,112,96,0.08);
      border-color: rgba(224,112,96,0.3);
      color: var(--red);
      font-size: 12px;
      line-height: 1.5;
    }

    /* ── Result card ── */
    .result-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--fg3);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .command-line {
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      color: var(--accent);
      line-height: 1.5;
      word-break: break-all;
    }
    .command-line::before { content: '$ '; color: var(--fg3); }

    .divider { height: 1px; background: var(--border); margin: 10px 0; }

    .explanation {
      font-size: 12px;
      color: var(--fg2);
      line-height: 1.65;
      border-left: 2px solid rgba(61,214,128,0.28);
      padding-left: 10px;
    }

    .badge-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 6px;
    }
    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(61,214,128,0.1);
      color: var(--accent);
      border: 1px solid rgba(61,214,128,0.2);
    }
    .badge-blue {
      background: rgba(91,143,212,0.1);
      color: var(--blue);
      border-color: rgba(91,143,212,0.2);
    }

    .btn-execute {
      margin-top: 10px;
      width: 100%;
      padding: 7px 14px;
      background: rgba(61,214,128,0.12);
      border: 1px solid rgba(61,214,128,0.3);
      border-radius: var(--radius);
      color: var(--accent);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-execute:hover { background: rgba(61,214,128,0.2); }

    /* ── Fix steps ── */
    .step-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      background: var(--elev);
      border-radius: 6px;
      border: 1px solid var(--border);
      margin-bottom: 6px;
    }
    .step-num {
      width: 20px; height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      flex-shrink: 0;
    }
    .step-cmd {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      flex: 1;
      word-break: break-all;
    }
    .risk-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .step-run {
      background: none;
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--fg2);
      font-size: 11px;
      padding: 3px 8px;
      cursor: pointer;
      flex-shrink: 0;
    }
    .step-run:hover { border-color: var(--accent); color: var(--accent); }

    /* ── Fix mode dirty hint ── */
    .dirty-hint {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--fg3);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 10px;
      display: none;
    }
    .dirty-hint.visible { display: block; }
    .dirty-hint pre {
      margin-top: 4px;
      white-space: pre-wrap;
      word-break: break-all;
      color: var(--fg2);
      font-size: 11px;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <span class="logo">GitSpeak</span>
    <span class="logo-sub">Natural Language → Git</span>
  </div>

  <!-- Context strip -->
  <div class="context-strip">
    <span class="ctx-branch">${branch}</span>
    ${lastCommit ? `<span class="ctx-sep">·</span><span>${lastCommit}</span>` : ''}
  </div>

  <!-- Mode toggle -->
  <div class="mode-bar">
    <button class="mode-btn active" id="btn-normal" onclick="setMode('normal')">Normal</button>
    <button class="mode-btn" id="btn-fix" onclick="setMode('fix')">🛠 Fix my repo</button>
  </div>

  <!-- Scroll area -->
  <div class="scroll">

    <!-- Normal mode input -->
    <div id="pane-normal">
      <div class="section-label">Prompt</div>
      <textarea id="input-normal" rows="3"
        placeholder="Describe lo que querés hacer con Git…"></textarea>

      <div class="suggestions" style="margin-top:8px;">
        <button class="chip" onclick="fillPrompt('deshacer el último commit sin perder cambios')">deshacer último commit</button>
        <button class="chip" onclick="fillPrompt('crear una rama nueva desde main')">crear rama nueva</button>
        <button class="chip" onclick="fillPrompt('guardar mis cambios con stash')">stash mis cambios</button>
        <button class="chip" onclick="fillPrompt('ver el historial de commits en una línea')">ver log compacto</button>
      </div>

      <button class="btn-generate" id="btn-gen-normal"
        style="margin-top:10px;" onclick="doGenerate()">Generar →</button>
    </div>

    <!-- Fix mode input -->
    <div id="pane-fix" style="display:none;">
      <div class="dirty-hint" id="dirty-hint">
        <span>Estado actual del repo detectado:</span>
        <pre id="dirty-text"></pre>
      </div>

      <div class="section-label" style="margin-top:8px;">git status (pegar salida)</div>
      <textarea id="input-status" rows="4"
        placeholder="$ git status&#10;On branch main&#10;Changes not staged..."></textarea>

      <div class="section-label" style="margin-top:8px;">Descripción del problema</div>
      <textarea id="input-desc" rows="2"
        placeholder="Ej: commité en la rama equivocada y necesito moverlo…"></textarea>

      <button class="btn-generate" id="btn-gen-fix"
        style="margin-top:10px;" onclick="doFix()">Analizar y sugerir pasos →</button>
    </div>

    <!-- Loading -->
    <div class="state-box" id="box-loading">
      <div class="loading-text">
        <div class="spinner"></div>
        Generando…
      </div>
    </div>

    <!-- Error -->
    <div class="state-box error-box" id="box-error"></div>

    <!-- Generate result -->
    <div class="state-box" id="box-result">
      <div class="result-label">Comando generado</div>
      <div class="command-line" id="res-command"></div>
      <div class="divider"></div>
      <div class="result-label">Explicación</div>
      <div class="explanation" id="res-explanation"></div>
      <div class="badge-row" id="res-badges"></div>
      <button class="btn-execute" id="btn-execute" onclick="doExecute()">
        ▶ Ejecutar en terminal
      </button>
    </div>

    <!-- Fix result -->
    <div class="state-box" id="box-fix-result">
      <div class="result-label">Pasos sugeridos</div>
      <div id="fix-steps"></div>
    </div>

  </div>

  <script>
    const vscode = acquireVsCodeApi()

    let mode = 'normal'
    let lastCommand = ''

    // ── Mode toggle ──
    function setMode(m) {
      mode = m
      document.getElementById('btn-normal').classList.toggle('active', m === 'normal')
      document.getElementById('btn-fix').classList.toggle('active', m === 'fix')
      document.getElementById('pane-normal').style.display = m === 'normal' ? 'block' : 'none'
      document.getElementById('pane-fix').style.display   = m === 'fix'    ? 'block' : 'none'
      clearResults()
    }

    // ── Suggestions ──
    function fillPrompt(text) {
      document.getElementById('input-normal').value = text
      document.getElementById('input-normal').focus()
    }

    // ── Actions ──
    function doGenerate() {
      const prompt = document.getElementById('input-normal').value.trim()
      if (!prompt) return
      vscode.postMessage({ type: 'generate', prompt })
    }

    function doFix() {
      const gitStatus   = document.getElementById('input-status').value.trim()
      const description = document.getElementById('input-desc').value.trim()
      if (!gitStatus || !description) return
      vscode.postMessage({ type: 'fix', gitStatus, description })
    }

    function doExecute() {
      if (lastCommand) vscode.postMessage({ type: 'execute', command: lastCommand })
    }

    function doExecuteStep(command) {
      vscode.postMessage({ type: 'execute', command })
    }

    // ── State helpers ──
    function clearResults() {
      ['box-loading','box-error','box-result','box-fix-result'].forEach(id => {
        document.getElementById(id).classList.remove('visible')
      })
    }

    function setLoading() {
      clearResults()
      setButtonsDisabled(true)
      document.getElementById('box-loading').classList.add('visible')
    }

    function setButtonsDisabled(disabled) {
      document.getElementById('btn-gen-normal').disabled = disabled
      document.getElementById('btn-gen-fix').disabled = disabled
    }

    function escapeHtml(str) {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    }

    function riskColor(risk) {
      return { low: '#3dd680', medium: '#5b8fd4', high: '#e07060' }[risk] ?? '#7d90a5'
    }

    // ── Message handler ──
    window.addEventListener('message', (event) => {
      const msg = event.data
      clearResults()
      setButtonsDisabled(false)

      switch (msg.type) {
        case 'loading':
          setLoading()
          break

        case 'result': {
          const cmd = msg.data
          lastCommand = cmd.command
          document.getElementById('res-command').textContent = cmd.command
          const expText = Array.isArray(cmd.explanation)
            ? cmd.explanation.map(e => e.text).join(' ')
            : (cmd.explanation ?? '')
          document.getElementById('res-explanation').textContent = expText
          const badges = document.getElementById('res-badges')
          badges.innerHTML = cmd.from_cache
            ? '<span class="badge">⚡ Desde cache</span>'
            : \`<span class="badge-blue badge">\${escapeHtml(cmd.provider ?? '')}</span>\`
          document.getElementById('box-result').classList.add('visible')
          break
        }

        case 'fix-result': {
          const steps = msg.steps
          const container = document.getElementById('fix-steps')
          container.innerHTML = steps.map((s, i) => {
            const color = riskColor(s.risk)
            return \`
              <div class="step-row">
                <div class="step-num" style="background:\${color}1a;color:\${color};">\${i + 1}</div>
                <div class="step-cmd" style="color:\${color};">\${escapeHtml(s.command)}</div>
                <span class="risk-badge" style="color:\${color};background:\${color}1a;">\${s.risk}</span>
                <button class="step-run" onclick="doExecuteStep('\${escapeHtml(s.command)}')">▶</button>
              </div>
            \`
          }).join('')
          document.getElementById('box-fix-result').classList.add('visible')
          break
        }

        case 'error': {
          const box = document.getElementById('box-error')
          box.textContent = msg.message.replace(/^Error:\s*/, '')
          box.classList.add('visible')
          break
        }

        case 'dirty-status': {
          const hint = document.getElementById('dirty-hint')
          document.getElementById('dirty-text').textContent = msg.status
          document.getElementById('input-status').value = msg.status
          hint.classList.add('visible')
          break
        }
      }
    })

    // Notify extension the webview is ready
    vscode.postMessage({ type: 'ready' })

    // Enter to submit in normal mode
    document.getElementById('input-normal').addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') doGenerate()
    })
  </script>
</body>
</html>`
}
