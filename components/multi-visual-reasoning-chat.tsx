"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MultiImagePreview } from "@/components/multi-image-preview"
import { ImageModal } from "@/components/image-modal"
import { Send, ImageIcon, RefreshCw, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function MultiVisualReasoningChat() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [currentFiles, setCurrentFiles] = useState<File[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [messageCount, setMessageCount] = useState(0)

  // 채팅 컨테이너에 대한 ref 생성
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/use-chat-images-vision",
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

      // 최대 2개 이미지 제한 확인
      if (currentFiles.length >= 2) {
        alert("최대 2개의 이미지만 업로드할 수 있습니다.")
        return
      }

      // 파일 추가
      setCurrentFiles((prev) => [...prev, file])

      // Create image preview and data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [...prev, event.target?.result as string])
        }
      }
      reader.readAsDataURL(file)
    }

    // 파일 입력 필드 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
    setCurrentFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    // 대화 내역을 직접 초기화합니다
    setMessages([])

    // 기존 상태 초기화
    setUploadedImages([])
    setCurrentFiles([])
    setMessageCount(0)
    setModalOpen(false)

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

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index)
    setModalOpen(true)
  }

  const closeImageModal = () => {
    setModalOpen(false)
  }

  // Custom submit handler that includes the image data
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // 입력이 비어있으면 제출하지 않음
    if (!input) return

    // 모든 메시지에 이미지 데이터를 포함시킵니다 (이미지가 있는 경우에만)
    handleSubmit(e, {
      body: {
        imageDataUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
      },
    })

    // Increment message count to track conversation progress
    setMessageCount((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col h-[70vh]">
      <Card className="flex-1 overflow-auto p-4 mb-4" ref={chatContainerRef}>
        <div className="space-y-4">
          {uploadedImages.length > 0 && messages.length === 0 && (
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-wrap gap-4 justify-end">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <MultiImagePreview
                      src={img || "/placeholder.svg"}
                      alt={`Uploaded image ${idx + 1}`}
                      onClick={() => openImageModal(idx)}
                      index={idx}
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage(idx)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={cn("flex flex-col", message.role === "user" ? "ml-auto items-end" : "")}>
              {message.role === "user" && index === 0 && uploadedImages.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2 justify-end bg-transparent">
                  {uploadedImages.map((img, idx) => (
                    <MultiImagePreview
                      key={idx}
                      src={img || "/placeholder.svg"}
                      alt={`Attached image ${idx + 1}`}
                      onClick={() => openImageModal(idx)}
                      index={idx}
                    />
                  ))}
                </div>
              )}
              <div
                className={cn(
                  "whitespace-pre-wrap rounded-lg p-4",
                  message.role === "user" ? "bg-muted text-black text-right max-w-[80%]" : "bg-transparent max-w-[80%]",
                )}
              >
                {message.content}
              </div>
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
          disabled={isLoading || currentFiles.length >= 2}
          className="h-10 w-10 shrink-0"
          title="Upload image"
        >
          <ImageIcon className="h-5 w-5" />
          {currentFiles.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {currentFiles.length}
            </span>
          )}
        </Button>

        <div className="relative flex-1">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about the images in English or Korean..."
            className="pr-10"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input}
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

      {modalOpen && (
        <ImageModal
          isOpen={modalOpen}
          onClose={closeImageModal}
          imageSrc={uploadedImages}
          alt="Uploaded image"
          initialIndex={selectedImageIndex}
        />
      )}
    </div>
  )
}
