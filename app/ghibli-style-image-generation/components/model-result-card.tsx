"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { ModelConfig, ModelResult } from "../types"
import Image from "next/image"

type ModelResultCardProps = {
  result: ModelResult
  modelConfig: ModelConfig
  onDownload: (base64Data: string, modelName: string) => void
}

export const ModelResultCard = ({ result, modelConfig, onDownload }: ModelResultCardProps) => {
  if (!result) return null

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-emerald-600">{modelConfig.displayName} Result</h2>
        {result.processingTimeMs && (
          <span className="text-sm bg-gray-100 px-2 py-1 rounded-md">
            {(result.processingTimeMs / 1000).toFixed(2)}s
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-4">Model ID: {modelConfig.modelId}</p>

      <Tabs defaultValue={result.imageBase64 ? "image" : "description"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="image" disabled={!result.imageBase64}>
            Generated Image
          </TabsTrigger>
          <TabsTrigger value="description" disabled={!result.text}>
            Description
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="mt-4">
          {result.imageBase64 ? (
            <div className="w-full aspect-square relative bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden max-w-md mx-auto">
              <Image
                src={result.imageBase64 || "/placeholder.svg"}
                alt={`Generated Ghibli style image using ${modelConfig.displayName}`}
                fill
                className="object-contain"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-4 right-4 bg-white/80 hover:bg-white"
                onClick={() => onDownload(result.imageBase64 || "", modelConfig.displayName)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          ) : (
            <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 max-w-md mx-auto">
              <p>No image generated</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="description" className="mt-4">
          <Textarea
            readOnly
            value={result.text || "No description generated"}
            className="w-full h-[300px] resize-none"
          />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
