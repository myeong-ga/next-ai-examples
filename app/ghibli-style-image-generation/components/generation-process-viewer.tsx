"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react"
import type { GenerationStep, ModelConfig } from "../types"

type GenerationProcessViewerProps = {
  modelConfig: ModelConfig
  isGenerating: boolean
  startTime: number | null
  prompt: string
  steps: GenerationStep[]
  isMock?: boolean
}

export const GenerationProcessViewer = ({
  modelConfig,
  isGenerating,
  startTime,
  prompt,
  steps,
  isMock = false,
}: GenerationProcessViewerProps) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0)

  // Update elapsed time every second while generating
  useEffect(() => {
    if (!isGenerating || !startTime) return

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [isGenerating, startTime])

  // Format elapsed time as mm:ss
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Get provider badge color
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "google":
        return "bg-blue-100 text-blue-800"
      case "openai":
        return "bg-green-100 text-green-800"
      case "anthropic":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get step icon based on type
  const getStepIcon = (type: GenerationStep["type"]) => {
    switch (type) {
      case "progress":
        return <Loader2 className="h-3 w-3 animate-spin" />
      case "complete":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />
      case "error":
        return <XCircle className="h-3 w-3 text-red-500" />
      case "info":
      default:
        return <Info className="h-3 w-3 text-blue-500" />
    }
  }

  return (
    <Card className={`p-4 h-full flex flex-col ${isMock ? "opacity-50" : ""}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-emerald-700">{modelConfig.displayName}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getProviderColor(modelConfig.provider)}`}>
            {modelConfig.provider.toUpperCase()}
          </span>
        </div>
        {startTime && (
          <div className="text-sm bg-gray-100 px-2 py-1 rounded-md">
            {isGenerating ? (
              <span className="flex items-center">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                {formatElapsedTime(elapsedTime)}
              </span>
            ) : (
              <span>
                Completed in{" "}
                {formatElapsedTime(Math.floor((steps[steps.length - 1]?.timestamp - startTime) / 1000) || 0)}
              </span>
            )}
          </div>
        )}
      </div>

      {modelConfig.description && <p className="text-xs text-gray-500 mb-3">{modelConfig.description}</p>}

      <div className="mb-3 text-xs bg-gray-50 p-2 rounded border border-gray-200 max-h-24 overflow-y-auto">
        <p className="font-semibold mb-1">Prompt:</p>
        <p className="whitespace-pre-wrap">{prompt}</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-2 rounded border border-gray-200 text-sm">
        <p className="font-semibold mb-1">Generation Process:</p>
        {steps.length === 0 && !isGenerating && <p className="text-gray-500 italic">Generation has not started yet.</p>}
        {isGenerating && steps.length === 0 && (
          <div className="flex items-center text-gray-600">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            Initializing...
          </div>
        )}
        <ul className="space-y-2">
          {steps.map((step, index) => (
            <li
              key={index}
              className={`flex items-start ${
                step.type === "error" ? "text-red-600" : step.type === "complete" ? "text-green-600" : "text-gray-700"
              }`}
            >
              <span className="mr-2 flex-shrink-0">{getStepIcon(step.type)}</span>
              <div>
                <span className="text-xs text-gray-500 mr-2">
                  {startTime
                    ? formatElapsedTime(Math.floor((step.timestamp - startTime) / 1000))
                    : new Date(step.timestamp).toLocaleTimeString()}
                </span>
                <span>{step.message}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
