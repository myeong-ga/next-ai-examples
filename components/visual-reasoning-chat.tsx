"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ImagePreview } from "@/components/image-preview"
import { Send, ImageIcon, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export function VisualReasoningChat() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [messageCount, setMessageCount] = useState(0)

  // 채팅 컨테이너에 대한 ref 생성
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, reload, setMessages } = useChat({
    api: "/api/use-chat-vision",
    initialMessages: [],
  })

  // 스크롤을 맨 아래로 이동시키는 함수
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight
    }
  }

  // 메시지가 변경되거나 로딩 상태가 변경될 때마다 스크롤 업데이트
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCurrentFile(file)

      // Create image preview and data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReset = () => {
    // 대화 내역을 직접 초기화합니다
    setMessages([])

    // 기존 상태 초기화
    setUploadedImage(null)
    setCurrentFile(null)
    setMessageCount(0)

    // 파일 입력 필드 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Custom submit handler that includes the image data
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!input && messageCount === 0) return

    // 모든 메시지에 이미지 데이터를 포함시킵니다
    handleSubmit(e, {
      body: {
        imageDataUrl: uploadedImage, // 모든 메시지에 이미지 데이터 포함
      },
    })

    // Increment message count to track conversation progress
    setMessageCount((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col h-[70vh]">
      <Card className="flex-1 overflow-auto p-4 mb-4" ref={chatContainerRef}>
        <div className="space-y-4">
          {uploadedImage && messages.length === 0 && (
            <div className="flex justify-center mb-4">
              <ImagePreview src={uploadedImage || "/placeholder.svg"} alt="Uploaded image" />
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col max-w-[80%] rounded-lg p-4",
                message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {message.role === "user" && index === 0 && uploadedImage && (
                <div className="mb-2">
                  <ImagePreview src={uploadedImage || "/placeholder.svg"} alt="Attached image" />
                </div>
              )}
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          )}
        </div>
      </Card>

      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <Input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />

        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={triggerFileInput}
          disabled={isLoading || messageCount > 0}
          className="h-10 w-10 shrink-0"
          title="Upload image"
        >
          <ImageIcon className="h-5 w-5" />
        </Button>

        <div className="relative flex-1">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about the image in English or Korean..."
            className="pr-10"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          size="icon"
          disabled={isLoading || (!uploadedImage && !currentFile && messageCount === 0) || !input}
          className="h-10 w-10 shrink-0"
          title="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleReset}
          className="h-10 w-10 shrink-0"
          title="Reset conversation"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}

