"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string | string[]
  alt: string
  initialIndex?: number
}

export function ImageModal({ isOpen, onClose, imageSrc, alt, initialIndex = 0 }: ImageModalProps) {
  const images = Array.isArray(imageSrc) ? imageSrc : [imageSrc]
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)

  // Reset index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
    }
  }, [isOpen, initialIndex])

  const goToNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection("right")
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
      setIsAnimating(false)
    }, 300)
  }

  const goToPrevious = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection("left")
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      setIsAnimating(false)
    }, 300)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === "ArrowRight") goToNext()
      if (e.key === "ArrowLeft") goToPrevious()
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-transparent border-0">
        <DialogTitle className="sr-only">이미지 상세보기</DialogTitle>
        <div className="relative w-full h-[80vh] max-h-[80vh]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`relative w-full h-full transition-transform duration-300 ease-in-out ${
                isAnimating ? (direction === "right" ? "translate-x-[-100%]" : "translate-x-[100%]") : "translate-x-0"
              }`}
            >
              <Image
                src={images[currentIndex] || "/placeholder.svg"}
                alt={`${alt} ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          </div>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 border-0 rounded-full h-10 w-10 z-10"
                onClick={goToPrevious}
                aria-label="이전 이미지"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 border-0 rounded-full h-10 w-10 z-10"
                onClick={goToNext}
                aria-label="다음 이미지"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </Button>
            </>
          )}

          {/* Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full ${idx === currentIndex ? "bg-white" : "bg-white/50"} transition-all`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`이미지 ${idx + 1}로 이동`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
