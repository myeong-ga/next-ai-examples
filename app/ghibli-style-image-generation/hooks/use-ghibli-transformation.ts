"use client"

import type React from "react"
import { useRef, useState } from "react"
import { generateMultiModelResults } from "../actions"
import { getActiveModels } from "../models"
import type { GenerationStep, ModelResult } from "../types"

export const GHIBLI_PROMPT =
  "Transform this image into Studio Ghibli animation style. First, describe how this image would look if reimagined in the classic Studio Ghibli style. Include details about color palette, lighting, texture, character design, and background elements that would be characteristic of films like 'Spirited Away', 'My Neighbor Totoro', or 'Howl's Moving Castle'. Then, generate a Ghibli-style version of this image."

// Maximum file size in bytes (1MB)
export const MAX_FILE_SIZE = 1024 * 1024

export function useGhibliTransformation() {
  const [image, setImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get active models from configuration
  const activeModels = getActiveModels()

  // Dynamic state for each model's generation process
  const [modelStates, setModelStates] = useState<
    Record<
      string,
      {
        startTime: number | null
        steps: GenerationStep[]
        result: ModelResult
      }
    >
  >(initializeModelStates(activeModels))

  // Initialize model states
  function initializeModelStates(models = activeModels) {
    return models.reduce(
      (acc, model) => {
        acc[model.id] = {
          startTime: null,
          steps: [],
          result: null,
        }
        return acc
      },
      {} as Record<string, { startTime: number | null; steps: GenerationStep[]; result: ModelResult }>,
    )
  }

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    // Check file size
    if (uploadedFile.size > MAX_FILE_SIZE) {
      setError("Image size exceeds 1MB limit. Please upload a smaller image.")
      return
    }

    setFile(uploadedFile)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
      // Reset all model states
      setModelStates(initializeModelStates())
      setError(null)
    }
    reader.readAsDataURL(uploadedFile)
  }

  // Process image data to ensure proper format
  const processImageData = (imageBase64?: string): string | null => {
    if (!imageBase64) return null

    // Check if the image data already has a data URL prefix
    if (imageBase64.startsWith("data:image/")) {
      return imageBase64
    }
    // If it starts with a base64 PNG header (iVBOR...)
    else if (imageBase64.startsWith("iVBOR")) {
      return `data:image/png;base64,${imageBase64}`
    }
    // If it starts with a base64 JPEG header (/9j/...)
    else if (imageBase64.startsWith("/9j/")) {
      return `data:image/jpeg;base64,${imageBase64}`
    }

    return null
  }

  // Add step to a specific model's generation process
  const addModelStep = (modelId: string, message: string, type: GenerationStep["type"] = "info") => {
    setModelStates((prev) => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        steps: [...prev[modelId].steps, { timestamp: Date.now(), message, type }],
      },
    }))
  }

  // Update step type for a specific model
  const updateModelStepType = (modelId: string, stepIndex: number, newType: GenerationStep["type"]) => {
    setModelStates((prev) => {
      const modelState = prev[modelId]
      if (!modelState || stepIndex >= modelState.steps.length) return prev

      const updatedSteps = [...modelState.steps]
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], type: newType }

      return {
        ...prev,
        [modelId]: {
          ...modelState,
          steps: updatedSteps,
        },
      }
    })
  }

  // Simulate the generation process with steps for all models
  const simulateGenerationProcess = () => {
    // Set start times for all models with slight offsets
    const now = Date.now()

    activeModels.forEach((model, index) => {
      // Set start time with a small offset for each model
      setModelStates((prev) => ({
        ...prev,
        [model.id]: {
          ...prev[model.id],
          startTime: now + index * 100,
          steps: [],
          result: null,
        },
      }))

      // Initial step
      addModelStep(model.id, `Starting ${model.displayName} model`, "info")

      // Add processing steps with timeouts to simulate the process
      // Different models might have slightly different timing
      const baseDelay = index * 200

      setTimeout(() => {
        const stepIndex = 1
        addModelStep(model.id, "Processing image input", "progress")
        // Update to complete after a short delay
        setTimeout(() => updateModelStepType(model.id, stepIndex, "complete"), 1000)
      }, 800 + baseDelay)

      setTimeout(() => {
        const stepIndex = 2
        addModelStep(model.id, "Analyzing image content", "progress")
        // Update to complete after a short delay
        setTimeout(() => updateModelStepType(model.id, stepIndex, "complete"), 1000)
      }, 2000 + baseDelay)

      setTimeout(() => {
        const stepIndex = 3
        addModelStep(model.id, "Generating Ghibli style interpretation", "progress")
        // Update to complete after a short delay
        setTimeout(() => updateModelStepType(model.id, stepIndex, "complete"), 1000)
      }, 3500 + baseDelay)

      setTimeout(() => {
        const stepIndex = 4
        addModelStep(model.id, "Creating text description", "progress")
        // Update to complete after a short delay
        setTimeout(() => updateModelStepType(model.id, stepIndex, "complete"), 1000)
      }, 5000 + baseDelay)

      setTimeout(() => {
        const stepIndex = 5
        addModelStep(model.id, "Rendering Ghibli style image", "progress")
        // Update to complete after a short delay
        setTimeout(() => updateModelStepType(model.id, stepIndex, "complete"), 1000)
      }, 7000 + baseDelay)
    })
  }

  // Generate transformations using all active models
  const generateTransformations = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    // Start the simulated generation process visualization
    simulateGenerationProcess()

    try {
      const { results, error: apiError } = await generateMultiModelResults(file, activeModels)

      if (apiError) {
        setError(apiError)
        activeModels.forEach((model) => {
          addModelStep(model.id, `Error: ${apiError}`, "error")
        })
      }

      // Process results for each model
      results.forEach((result, index) => {
        const modelConfig = activeModels[index]

        if (result) {
          const processedImage = processImageData(result.imageBase64)

          // Update the model's result
          setModelStates((prev) => ({
            ...prev,
            [modelConfig.id]: {
              ...prev[modelConfig.id],
              result: {
                ...result,
                imageBase64: processedImage? processedImage : undefined,
              },
            },
          }))

          addModelStep(
            modelConfig.id,
            `Successfully generated Ghibli style image and description in ${
              result.processingTimeMs ? (result.processingTimeMs / 1000).toFixed(2) + "s" : "unknown time"
            }`,
            "complete",
          )
        } else if (!apiError) {
          addModelStep(modelConfig.id, "Failed to generate result", "error")
        }
      })

      if (results.every((r) => r === null) && !apiError) {
        setError("No results were generated. Please try again or try with a different image.")
      }
    } catch (error) {
      console.error("Error generating comparison:", error)
      setError(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`)

      activeModels.forEach((model) => {
        addModelStep(model.id, `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`, "error")
      })
    } finally {
      setLoading(false)
    }
  }

  // Download image from base64
  const downloadImage = (base64Data: string, modelName: string) => {
    if (!base64Data) return

    // Create a link element
    const link = document.createElement("a")

    // If the base64 data already has a data URL prefix, use it directly
    // Otherwise, add the appropriate prefix
    const dataUrl = base64Data.startsWith("data:") ? base64Data : `data:image/png;base64,${base64Data}`

    link.href = dataUrl
    link.download = `ghibli-style-${modelName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reset all states
  const resetState = () => {
    setImage(null)
    setFile(null)
    setError(null)
    setModelStates(initializeModelStates())
  }

  return {
    // State
    image,
    file,
    loading,
    error,
    modelStates,
    activeModels,
    ghibliPrompt: GHIBLI_PROMPT,
    fileInputRef,

    // Methods
    handleImageUpload,
    triggerFileInput,
    generateTransformations,
    resetState,
    downloadImage,
  }
}
