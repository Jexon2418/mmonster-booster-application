"use client"

import { useState } from "react"
import { testSubmission, resetSubmission } from "@/lib/test-submission"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface TestSubmissionButtonProps {
  discordId: string
  customSupabaseUrl?: string
  customSupabaseKey?: string
  customWebhookUrl?: string
}

export function TestSubmissionButton({
  discordId,
  customSupabaseUrl,
  customSupabaseKey,
  customWebhookUrl,
}: TestSubmissionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [resetResult, setResetResult] = useState<any>(null)

  const handleTest = async () => {
    setIsLoading(true)
    try {
      // Store the original webhook URL
      const originalWebhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_SUBMIT_URL

      // If a custom webhook URL is provided, temporarily override the environment variable
      if (customWebhookUrl) {
        // @ts-ignore - This is a hack to override the environment variable at runtime
        process.env.NEXT_PUBLIC_WEBHOOK_SUBMIT_URL = customWebhookUrl
      }

      const response = await testSubmission(discordId, customSupabaseUrl, customSupabaseKey)
      setResult(response)

      // Restore the original webhook URL
      if (customWebhookUrl) {
        // @ts-ignore - This is a hack to restore the environment variable
        process.env.NEXT_PUBLIC_WEBHOOK_SUBMIT_URL = originalWebhookUrl
      }
    } catch (error) {
      console.error("Error in test button:", error)
      setResult({
        success: false,
        message: "Error executing test",
        details: {
          error: String(error),
          errorType: typeof error,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      const response = await resetSubmission(discordId, customSupabaseUrl, customSupabaseKey)
      setResetResult(response)
    } catch (error) {
      console.error("Error in reset button:", error)
      setResetResult({
        success: false,
        message: "Error resetting submission",
        details: {
          error: String(error),
          errorType: typeof error,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Button onClick={handleTest} disabled={isLoading} className="bg-[#E53E3E] hover:bg-[#E53E3E]/90">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Testing...
            </>
          ) : (
            "Test Submission"
          )}
        </Button>

        <Button
          onClick={handleReset}
          disabled={isResetting}
          variant="outline"
          className="border-[#E53E3E] text-[#E53E3E] hover:bg-[#E53E3E]/10"
        >
          {isResetting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Resetting...
            </>
          ) : (
            "Reset to Draft"
          )}
        </Button>
      </div>

      {result && (
        <Card className="p-4 bg-[#1E2533] border border-[#4A5568]">
          <h3 className={`font-medium ${result.success ? "text-green-500" : "text-[#E53E3E]"}`}>
            {result.success ? "Success" : "Error"}
          </h3>
          <p className="text-white mt-1">{result.message}</p>
          {result.details && (
            <pre className="mt-2 p-2 bg-[#1A202C] rounded text-xs text-gray-300 overflow-auto max-h-40">
              {JSON.stringify(result.details, null, 2)}
            </pre>
          )}
        </Card>
      )}

      {resetResult && (
        <Card className="p-4 bg-[#1E2533] border border-[#4A5568]">
          <h3 className={`font-medium ${resetResult.success ? "text-green-500" : "text-[#E53E3E]"}`}>
            {resetResult.success ? "Reset Success" : "Reset Error"}
          </h3>
          <p className="text-white mt-1">{resetResult.message}</p>
          {resetResult.details && (
            <pre className="mt-2 p-2 bg-[#1A202C] rounded text-xs text-gray-300 overflow-auto max-h-40">
              {JSON.stringify(resetResult.details, null, 2)}
            </pre>
          )}
        </Card>
      )}
    </div>
  )
}
