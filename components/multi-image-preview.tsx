"use client"

import Image from "next/image"

interface ImagePreviewProps {
  src: string
  alt: string
  onClick?: () => void
  className?: string
  index?: number
}

export function MultiImagePreview({ src, alt, onClick, className = "", index }: ImagePreviewProps) {
  return (
    <div
      className={`relative aspect-auto overflow-hidden rounded-md border cursor-pointer group ${className}`}
      onClick={onClick}
      style={{ maxWidth: "100px" }}
    >
      <div className="relative aspect-auto min-h-[60px]">
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          className="object-contain"
          fill={false}
          width={100}
          height={0}
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      {index !== undefined && (
        <div className="absolute top-1 left-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {index + 1}
        </div>
      )}
    </div>
  )
}
