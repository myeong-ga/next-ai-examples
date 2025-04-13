"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"
import Image from "next/image"
import { GenerationProcessViewer } from "./components/generation-process-viewer"
// 수정: 가져오기 방식 수정
import ModelResultCard from "./components/model-result-card"
import { useGhibliTransformation } from "./hooks/use-ghibli-transformation"

export default function Home() {
  const {
    image,
    loading,
    error,
    modelStates,
    activeModels,
    ghibliPrompt,
    fileInputRef,
    handleImageUpload,
    triggerFileInput,
    generateTransformations,
    downloadImage,
  } = useGhibliTransformation()

  // Create a mock model config for comparison when only one active model is available
  const mockModelConfig =
    activeModels.length === 1
      ? {
          ...activeModels[0],
          id: "mock-model",
          name: "Comparison Model",
          displayName: "Comparison Model",
          description: "This is a placeholder for comparison purposes",
        }
      : null

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-gradient-to-b from-blue-50 to-green-50">
      <div className="z-10 max-w-6xl w-full flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-center mb-6 text-emerald-700">Studio Ghibli Style Image Transformer</h1>
        <p className="text-lg text-center mb-10 text-gray-600 max-w-2xl">
          Upload your image and compare how different AI models transform it into the magical Studio Ghibli art style.
        </p>

        <div className="w-full grid grid-cols-1 gap-8">
          <Card className="p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4 text-emerald-600">Upload Your Image</h2>

            {/* Error message above image upload area */}
            {error && (
              <div className="w-full max-w-md mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

            {/* Clickable image area */}
            <button
              onClick={triggerFileInput}
              className="w-full aspect-square relative mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden max-w-md mx-auto border-2 border-dashed border-gray-300 hover:border-emerald-500 transition-colors"
              disabled={loading}
            >
              {image ? (
                <Image src={image || "/placeholder.svg"} alt="Uploaded image" fill className="object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Upload size={48} />
                  <p className="mt-2">Click to upload an image (max 1MB)</p>
                </div>
              )}
            </button>

            <Button
              onClick={generateTransformations}
              disabled={!image || loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing with {activeModels.length} models...
                </>
              ) : (
                "Compare Ghibli Style Transformations"
              )}
            </Button>
          </Card>

          {/* Generation Process Visualization - Dynamic based on active models */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px]">
            {activeModels.map((model) => (
              <GenerationProcessViewer
                key={model.id}
                modelConfig={model}
                isGenerating={loading}
                startTime={modelStates[model.id]?.startTime || null}
                prompt={ghibliPrompt}
                steps={modelStates[model.id]?.steps || []}
              />
            ))}

            {/* Add mock comparison div when only one active model */}
            {activeModels.length === 1 && mockModelConfig && (
              <GenerationProcessViewer
                modelConfig={mockModelConfig}
                isGenerating={false}
                startTime={null}
                prompt={ghibliPrompt}
                steps={[]}
                isMock={true}
              />
            )}
          </div>

          {/* Results Section - Dynamic based on results */}
          {activeModels.some((model) => modelStates[model.id]?.result) && (
            <>
              <h2 className="text-2xl font-semibold text-center mt-8 mb-4 text-emerald-700">Generation Results</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeModels.map((model) =>
                  modelStates[model.id]?.result ? (
                    <ModelResultCard
                      key={model.id}
                      result={modelStates[model.id].result}
                      modelConfig={model}
                      onDownload={downloadImage}
                    />
                  ) : null,
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-12 text-center max-w-2xl">
          <h3 className="text-xl font-semibold mb-4 text-emerald-600">How It Works</h3>
          <ol className="text-left list-decimal pl-6 space-y-2">
            <li>Upload your image by clicking on the upload area (max 1MB)</li>
            <li>Click the "Compare Ghibli Style Transformations" button</li>
            <li>Watch the generation process for all models in real-time</li>
            <li>Each AI model will analyze your image and generate a Ghibli-style version with description</li>
            <li>Compare the results side by side to see the differences between the models</li>
            <li>Download your favorite generated images using the download button</li>
          </ol>

          <div className="mt-6 text-sm text-gray-500">
            <p>Note: Image generation capabilities may vary based on the input image and model availability.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
