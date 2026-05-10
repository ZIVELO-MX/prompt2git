import type { Provider } from '@/types'

export interface FreeModel {
  provider: Provider
  modelId: string
  label: string
}

export const FREE_MODELS: Record<string, FreeModel> = {
  'minimax-m2.5':   { provider: 'zen',         modelId: 'minimax-m2.5-free',       label: 'MiniMax M2.5' },
  'nemotron-3':     { provider: 'zen',         modelId: 'nemotron-3-super-free',   label: 'Nemotron 3 Super' },
}

export const FREE_MODEL_KEYS = Object.keys(FREE_MODELS)
export const STARTER_MODEL_KEY = 'minimax-m2.5'
