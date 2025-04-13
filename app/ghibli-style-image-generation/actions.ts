"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import type { ModelConfig, ModelResult } from "./types"

// Generic function to generate Ghibli description using any supported model
export async function generateGhibliDescription(file: File, modelConfig: ModelConfig): Promise<ModelResult> {
  const startTime = Date.now()

  try {
    // Convert the file to a base64 string
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString("base64")
    const dataURI = `data:${file.type};base64,${base64Image}`

    // Handle different providers
    let result
    if (modelConfig.provider === "google") {
      result = await generateText({
        model: google(modelConfig.modelId as any), // Type assertion needed as we're using dynamic model IDs
        providerOptions: {
          google: { responseModalities: ["TEXT", "IMAGE"] },
        },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                image: dataURI,
              },
              {
                type: "text",
                text: "Transform this image into Studio Ghibli animation style. First, describe how this image would look if reimagined in the classic Studio Ghibli style. Include details about color palette, lighting, texture, character design, and background elements that would be characteristic of films like 'Spirited Away', 'My Neighbor Totoro', or 'Howl's Moving Castle'. Then, generate a Ghibli-style version of this image.",
              },
            ],
          },
        ],
      })
    } else {
      // For future implementation of other providers like OpenAI
      throw new Error(`Provider ${modelConfig.provider} is not yet implemented`)
    }

    // Extract the generated image if available
    let generatedImageBase64: string | undefined

    if (result.files && result.files.length > 0) {
      for (const file of result.files) {
        if (file.mimeType.startsWith("image/")) {
          if (file.base64) {
            generatedImageBase64 = file.base64
          } else if (file.uint8Array) {
            const buffer = Buffer.from(file.uint8Array)
            generatedImageBase64 = buffer.toString("base64")
          }
          break
        }
      }
    } else {
      console.log(`No files found in the response for model: ${modelConfig.modelId}`)
    }

    const endTime = Date.now()

    return {
      modelId: modelConfig.id,
      text: result.text,
      imageBase64: generatedImageBase64,
      processingTimeMs: endTime - startTime,
    }
  } catch (error) {
    console.error(`Error with model ${modelConfig.modelId}:`, error)
    return null
  }
}

// Generate results for multiple models in parallel
export async function generateMultiModelResults(file: File, modelConfigs: ModelConfig[]) {
  try {
    // Run all models in parallel for efficiency
    const results = await Promise.allSettled(modelConfigs.map((config) => generateGhibliDescription(file, config)))

    // Process results
    const modelResults = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value
      } else {
        console.error(`Error with model ${modelConfigs[index].modelId}:`, result.reason)
        return null
      }
    })

    // Check if all models failed
    const allFailed = modelResults.every((result) => result === null)
    const error = allFailed
      ? "All models failed to generate results. Please try again with a different image."
      : undefined

    return {
      results: modelResults,
      error,
    }
  } catch (error) {
    console.error("Error generating comparison:", error)
    return {
      results: [],
      error: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
    }
  }
}
