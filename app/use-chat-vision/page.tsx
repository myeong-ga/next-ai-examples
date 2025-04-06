import { VisualReasoningChat } from "@/components/visual-reasoning-chat"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Llama 4 Scout Visual Reasoning</h1>
          <p className="text-muted-foreground">Upload an image and chat about it in English or Korean</p>
        </div>

        <VisualReasoningChat />
      </div>
    </main>
  )
}

