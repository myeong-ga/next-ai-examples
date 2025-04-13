// Define types for model configurations and results
export type ModelConfig = {
  id: string
  name: string
  provider: "google" | "openai" | "anthropic" | "other"
  modelId: string
  displayName: string
  description?: string
  isActive: boolean
}

export type ModelResult = {
  modelId: string
  text: string
  imageBase64?: string // 원래대로 돌려놓음: undefined만 허용
  processingTimeMs?: number
} | null

export type GenerationStep = {
  timestamp: number
  message: string
  type: "info" | "progress" | "complete" | "error"
}

export type ModelGenerationState = {
  modelConfig: ModelConfig
  startTime: number | null
  steps: GenerationStep[]
  result: ModelResult
  isGenerating: boolean
}
