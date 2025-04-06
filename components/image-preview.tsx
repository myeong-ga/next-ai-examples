import Image from "next/image"

interface ImagePreviewProps {
  src: string
  alt: string
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  return (
    <div className="relative w-full max-w-xs h-48 overflow-hidden rounded-md border">
      <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-contain" />
    </div>
  )
}

