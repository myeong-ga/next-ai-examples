import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import type { NextRequest } from "next/server"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// 콘텐츠 배열 항목 타입 정의
type ContentArrayItem =
  | {
      type: "text"
      text: string
    }
  | {
      type: "image"
      image: string
    }

// 커스텀 메시지 타입 정의 (이름 변경)
type CustomMessage = {
  role: string
  content: string | ContentArrayItem[]
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json()
    const { messages, imageDataUrls } = body

    // 디버깅 로그 (실제 배포 시 제거)
    // console.log(
    //   "Received messages:",
    //   JSON.stringify(messages.map((m) => ({ role: m.role, contentType: typeof m.content }))),
    // )
    console.log("Image data count:", Array.isArray(imageDataUrls) ? imageDataUrls.length : 0)

    // Format messages for the model
    const formattedMessages: CustomMessage[] = []

    // Add a more explicit system message
    const hasImages = Array.isArray(imageDataUrls) && imageDataUrls.length > 0

    formattedMessages.push({
      role: "system",
      content: hasImages
        ? "You are a visual reasoning assistant that can analyze images. One or more images have been provided for you to analyze. Examine the images carefully and answer questions about them in detail. If multiple images are provided, compare and contrast them when appropriate."
        : "You are a helpful assistant that can answer questions in detail. You can respond in the same language the user asks in (English or Korean).",
    })

    // Process each message
    let hasAddedImages = false
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]

      // 첫 번째 사용자 메시지에만 이미지 포함 (이미지가 있는 경우)
      if (message.role === "user" && !hasAddedImages && hasImages) {
        // 이미지 콘텐츠 배열 생성
        const contentArray: ContentArrayItem[] = [{ type: "text", text: message.content }]

        // 각 이미지를 콘텐츠 배열에 추가
        imageDataUrls.forEach((imageUrl: string) => {
          contentArray.push({ type: "image", image: imageUrl })
        })

        formattedMessages.push({
          role: message.role,
          content: contentArray,
        })
        hasAddedImages = true
      } else {
        // 나머지 메시지는 텍스트만 포함
        formattedMessages.push({
          role: message.role,
          content: message.content,
        })
      }
    }

    // 디버깅 로그 (실제 배포 시 제거)
    console.log(
      "Formatted messages:",
      JSON.stringify(
        formattedMessages.map((m) => ({
          role: m.role,
          contentType: Array.isArray(m.content) ? "array" : "string",
          hasImage: Array.isArray(m.content) && m.content.some((c) => c.type === "image"),
          imageCount: Array.isArray(m.content) ? m.content.filter((c) => c.type === "image").length : 0,
        })),
      ),
    )

  
    const result = streamText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      messages: formattedMessages as any,
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
