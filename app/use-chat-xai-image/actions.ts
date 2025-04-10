"use server"

import { xai } from "@ai-sdk/xai"
import { experimental_generateImage as generateImage } from "ai"

export type GeneratedImage = {
  imageUrl: string
  prompt: string
  isMock?: boolean
}

// Mock image URLs for demonstration when API credits are unavailable
const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1024&h=768&fit=crop",
  "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=1024&h=768&fit=crop",
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1024&h=768&fit=crop",
  "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=1024&h=768&fit=crop",
]

export async function generateImageAction(formData: FormData): Promise<GeneratedImage | { error: string }> {
  const prompt = formData.get("prompt")

  if (!prompt || typeof prompt !== "string") {
    return { error: "A prompt is required" }
  }

  try {
    // Try to generate a real image with xAI
    const { image } = await generateImage({
      model: xai.image("grok-2-image"),
      prompt,
    })

    // Return the base64 image and the prompt
    return {
      imageUrl: image.base64,
      prompt,
    }
  } catch (error) {
    console.error("Error generating image:", error)

    // Check if the error is related to credits
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes("doesn't have any credits") || errorMessage.includes("purchase credits")) {
      // Use a mock image as fallback
      const randomIndex = Math.floor(Math.random() * MOCK_IMAGES.length)

      return {
        imageUrl: MOCK_IMAGES[randomIndex],
        prompt,
        isMock: true,
      }
    }

    return {
      error: errorMessage || "Failed to generate image. Please try again.",
    }
  }
}
