import type { Provider } from '@/types'

export interface FreeModel {
  provider: Provider
  modelId: string
  label: string
}

export const FREE_MODELS: Record<string, FreeModel> = {
  'llama-3.1-8b':   { provider: 'openrouter', modelId: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B' },
  'big-pickle':     { provider: 'zen',         modelId: 'big-pickle',              label: 'Big Pickle' },
  'minimax-m2.5':   { provider: 'zen',         modelId: 'minimax-m2.5-free',       label: 'MiniMax M2.5' },
  'ling-2.6-flash': { provider: 'zen',         modelId: 'ling-2.6-flash-free',     label: 'Ling 2.6 Flash' },
  'hy3-preview':    { provider: 'zen',         modelId: 'hy3-preview-free',        label: 'Hy3 Preview' },
  'nemotron-3':     { provider: 'zen',         modelId: 'nemotron-3-super-free',   label: 'Nemotron 3 Super' },
}

export const FREE_MODEL_KEYS = Object.keys(FREE_MODELS)
export const STARTER_MODEL_KEY = 'llama-3.1-8b'
