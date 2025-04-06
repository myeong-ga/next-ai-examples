import { groq } from "@ai-sdk/groq"
import { Message, streamText } from "ai"
import type { NextRequest } from "next/server"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json()
    const { messages, imageDataUrl } = body

    // 디버깅 로그 (실제 배포 시 제거)
    // console.log(
    //   "Received messages:",
    //   JSON.stringify(messages.map((m) => ({ role: m.role, contentType: typeof m.content }))),
    // )
    //console.log("Image data present:", !!imageDataUrl)

    // Format messages for the model
    const formattedMessages = []

    // Add a more explicit system message
    formattedMessages.push({
      role: "system",
      content:
        "You are a visual reasoning assistant that can analyze images. An image has been provided for you to analyze. Examine the image carefully and answer questions about it in detail. You can respond in the same language the user asks in (English or Korean).",
    })

    // Process each message
    let hasAddedImage = false
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]

      // 첫 번째 사용자 메시지에만 이미지 포함
      if (message.role === "user" && !hasAddedImage && imageDataUrl) {
        formattedMessages.push({
          role: message.role,
          content: [
            { type: "text", text: message.content },
            { type: "image", image: imageDataUrl },
          ],
        })
        hasAddedImage = true
      } else {
        // 나머지 메시지는 텍스트만 포함
        formattedMessages.push({
          role: message.role,
          content: message.content,
        })
      }
    }

    // 디버깅 로그 (실제 배포 시 제거)
    // console.log(
    //   "Formatted messages:",
    //   JSON.stringify(
    //     formattedMessages.map((m) => ({
    //       role: m.role,
    //       contentType: Array.isArray(m.content) ? "array" : "string",
    //       hasImage: Array.isArray(m.content) && m.content.some((c) => c.type === "image"),
    //     })),
    //   ),
    // )

    // Stream the response using the properly formatted messages
    const result = streamText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      messages: formattedMessages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

