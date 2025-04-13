import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { ImageGeneratorForm } from "@/components/image-generator-form"

export default function ImageGenerationPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">xAI Grok Image Generator</CardTitle>
            <CardDescription>Generate high-quality images using xAI's Grok-2-Image model</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Changed from blue to green color scheme */}
            <Alert className="mb-6 bg-green-50 border-green-200">
              <InfoIcon className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">xAI Credits Required</AlertTitle>
              <AlertDescription>
                <p className="mb-2 text-green-700">
                  To generate real images with xAI, you need to purchase credits from the
                  <a
                    href="https://console.x.ai"
                    className="underline font-medium mx-1 text-green-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    xAI Console
                  </a>
                  for your account. This demo will show placeholder images until credits are available.
                </p>
                <p className="text-green-700">
                  This program is using mock data to responsibly fulfill the AI SDK's execution requirements. The mock
                  implementation ensures you can experience the interface and functionality without requiring immediate
                  credit purchases.
                </p>
              </AlertDescription>
            </Alert>

            <ImageGeneratorForm />
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by xAI Grok-2-Image model. Images are generated at 1024x768 resolution.</p>
        </div>
      </div>
    </div>
  )
}
