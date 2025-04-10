"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { Loader2, ImageIcon, AlertTriangle, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// Import generateId from the ai package
import { generateId } from "ai"
import { GeneratedImage, generateImageAction } from "@/app/use-chat-xai-image/actions"

export function ImageGeneratorForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateImageAction(formData)

      if ("error" in result) {
        setError(result.error)
      } else {
        setGeneratedImage(result)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    // Use generateId to create a unique filename
    // We'll still include a short prefix from the prompt for user recognition
    // const promptPrefix = generatedImage.prompt
    //   .slice(0, 10)
    //   .replace(/[^a-z0-9]/gi, "_")
    //   .toLowerCase()
    const promptPrefix = generatedImage.prompt
    .slice(0, 10)
    .replace(/[\\/:*?"<>|]/g, "_") 

    // Generate a unique ID and combine with prompt prefix
    const uniqueId = generateId()
    const fileName = `${promptPrefix}_${uniqueId}.png`

    // Handle both base64 images and URL images
    if (generatedImage.imageUrl.startsWith("data:")) {
      // For base64 images
      const link = document.createElement("a")
      link.href = generatedImage.imageUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // For URL images (mock images)
      fetch(generatedImage.imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        })
        .catch((error) => {
          console.error("Error downloading image:", error)
          setError("Failed to download image. Please try again.")
        })
    }
  }

  return (
    <div className="space-y-8">
      {!generatedImage?.isMock ? null : (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Demo Mode Active</AlertTitle>
          <AlertDescription>
            Your xAI account needs credits to generate real images. This is a mock image for demonstration purposes.
            Visit{" "}
            <a href="https://console.x.ai" className="underline font-medium" target="_blank" rel="noopener noreferrer">
              console.x.ai
            </a>{" "}
            to purchase credits.
          </AlertDescription>
        </Alert>
      )}

      {/* Generated image card */}
      {generatedImage && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-md border border-gray-200 relative group">
                <img
                  src={generatedImage.imageUrl || "/placeholder.svg"}
                  alt={generatedImage.prompt}
                  className="w-full h-auto object-contain"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-3 right-3 opacity-90 hover:opacity-100"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                <strong>Prompt:</strong> {generatedImage.prompt}
                {generatedImage.isMock && (
                  <div className="mt-2 text-amber-600">
                    <strong>Note:</strong> This is a placeholder image. Purchase xAI credits to generate real images.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      {/* Form */}
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Image Prompt</Label>
          <Textarea
            id="prompt"
            name="prompt"
            placeholder="Describe the image you want to generate..."
            className="min-h-[100px]"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Generate Image
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
