"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function generateStory(prompt: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-lite"),
      system: "You are a creative storyteller. Create engaging, imaginative stories based on the user's prompt.",
      prompt: prompt,
    })

    return text
  } catch (error) {
    console.error("Error generating story:", error)
    return "Sorry, there was an error generating your story. Please try again."
  }
}

