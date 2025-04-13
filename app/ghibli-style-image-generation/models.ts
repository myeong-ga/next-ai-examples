import type { ModelConfig } from "./types"

// Available models configuration
export const availableModels: ModelConfig[] = [
  {
    id: "gemini-2-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    modelId: "gemini-2.0-flash-exp",
    displayName: "Gemini 2.0 Flash",
    description: "Fast and efficient model for real-time image and text generation",
    isActive: true,
  },
  {
    id: "openai-gpt-4",
    name: "GPT-4",
    provider: "openai",
    modelId: "gpt-4",
    displayName: "GPT 4 (Coming Soon)",
    description: "OpenAI's advanced image generation model",
    isActive: false, // Inactive for now
  },
]

// Get active models only
export const getActiveModels = (): ModelConfig[] => {
  return availableModels.filter((model) => model.isActive)
}
