import * as vscode from 'vscode'

const SECRET_KEY = 'gitspeak.token'
const SCHEME = 'vscode'
const CALLBACK_PATH = '/auth-callback'

let _context: vscode.ExtensionContext | undefined
let _pendingResolve: ((token: string) => void) | undefined
let _pendingReject: ((err: Error) => void) | undefined

export function initAuth(context: vscode.ExtensionContext): void {
  _context = context
}

export function getRedirectUri(): string {
  return `${SCHEME}://${_context?.extension.id}${CALLBACK_PATH}`
}

export async function getStoredToken(): Promise<string | undefined> {
  if (!_context) return undefined
  return _context.secrets.get(SECRET_KEY)
}

export async function storeToken(token: string): Promise<void> {
  if (!_context) return
  await _context.secrets.store(SECRET_KEY, token)
}

export async function clearToken(): Promise<void> {
  if (!_context) return
  await _context.secrets.delete(SECRET_KEY)
}

export async function ensureAuthenticated(): Promise<string> {
  const existing = await getStoredToken()
  if (existing) return existing

  await login()
  const token = await getStoredToken()
  if (!token) throw new Error('Authentication failed')
  return token
}

export async function login(): Promise<string> {
  const apiUrl = vscode.workspace.getConfiguration('gitspeak').get<string>('apiUrl') ?? 'https://www.prompt2git.com'
  const loginUrl = `${apiUrl}/login?redirect_uri=${encodeURIComponent(getRedirectUri())}`

  const selection = await vscode.window.showInformationMessage(
    'GitSpeak necesita que inicies sesión.',
    { modal: true },
    'Iniciar sesión en el navegador',
  )

  if (selection !== 'Iniciar sesión en el navegador') {
    throw new Error('Login cancelled by user')
  }

  return new Promise<string>((resolve, reject) => {
    _pendingResolve = resolve
    _pendingReject = reject

    const timeout = setTimeout(() => {
      _pendingResolve = undefined
      _pendingReject = undefined
      reject(new Error('Login timeout'))
    }, 120_000)

    const originalResolve = resolve
    _pendingResolve = (token: string) => {
      clearTimeout(timeout)
      _pendingResolve = undefined
      _pendingReject = undefined
      originalResolve(token)
    }

    vscode.env.openExternal(vscode.Uri.parse(loginUrl))
  })
}

export async function handleAuthCallback(uri: vscode.Uri): Promise<void> {
  const params = new URLSearchParams(uri.query)
  const fragmentParams = new URLSearchParams(
    uri.fragment.startsWith('#') ? uri.fragment.slice(1) : uri.fragment,
  )

  const token = params.get('token') ?? params.get('access_token') ?? fragmentParams.get('access_token') ?? fragmentParams.get('token')

  if (token) {
    await storeToken(token)
    vscode.window.showInformationMessage('GitSpeak: sesión iniciada correctamente.')
    _pendingResolve?.(token)
  } else {
    const errMsg = 'No se recibió el token de autenticación.'
    _pendingReject?.(new Error(errMsg))
  }
}
