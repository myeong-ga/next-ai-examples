import { MultiVisualReasoningChat } from "@/components/multi-visual-reasoning-chat"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Llama 4 Scout Visual Reasoning</h1>
          <p className="text-muted-foreground">Chat with or without images in English or Korean</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload up to 2 images, compare them, or just have a conversation
          </p>
        </div>

        <MultiVisualReasoningChat />
      </div>
    </main>
  )
}
