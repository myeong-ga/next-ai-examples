"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { generateStory } from "./actions"

export default function StoryGenerator() {
  const [prompt, setPrompt] = useState("")
  const [story, setStory] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const generatedStory = await generateStory(prompt)
      setStory(generatedStory)
    } catch (error) {
      console.error("Failed to generate story:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">AI Story Generator</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Prompt</CardTitle>
            <CardDescription>Describe the story you want to generate</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="Once upon a time in a magical forest..."
                className="min-h-[200px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button type="submit" className="mt-4 w-full" disabled={isGenerating || !prompt.trim()}>
                {isGenerating ? "Generating..." : "Generate Story"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Story</CardTitle>
            <CardDescription>Your AI-generated story will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] p-4 border rounded-md bg-muted/50">
              {story ? (
                <div className="whitespace-pre-wrap">{story}</div>
              ) : (
                <div className="text-muted-foreground italic">Your story will appear here after generation</div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            {story && (
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(story)
                }}
              >
                Copy to Clipboard
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

