"use client"

import { useState } from "react"
import { FormSection } from "../ui-components"
import { CheckCircle } from "lucide-react"
import { markDraftAsEditable } from "@/lib/supabaseClient"
import type { DiscordUser } from "../booster-application-form"

interface ThankYouStepProps {
  onEditApplication: () => void
  discordUser: DiscordUser | null
  submitCount?: number
}

export function ThankYouStep({ onEditApplication, discordUser, submitCount = 0 }: ThankYouStepProps) {
  const [isResetting, setIsResetting] = useState(false)

  const handleEditApplication = async () => {
    if (!discordUser?.id) return

    setIsResetting(true)
    try {
      // Update the application status back to "draft" in Supabase
      await markDraftAsEditable(discordUser.id)

      // Redirect to the summary step
      onEditApplication()
    } catch (error) {
      console.error("Error resetting application status:", error)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <FormSection title="Application Submitted" description="">
      <div className="flex flex-col items-center justify-center py-8">
        <CheckCircle className="h-24 w-24 text-green-500 mb-6" />

        <h2 className="text-2xl font-bold text-white text-center mb-4">Thank You for Your Application</h2>

        {submitCount > 1 && (
          <div className="bg-[#E53E3E]/10 border border-[#E53E3E]/30 rounded-md p-3 mb-4 max-w-md">
            <p className="text-center text-[#E53E3E]">This is submission #{submitCount} of your application</p>
          </div>
        )}

        <div className="text-center text-gray-300 mb-8 max-w-lg">
          <p className="mb-4">
            Please note that applications may take up to 7 days to process due to a high volume of submissions.
          </p>
          <p>You will receive a notification from our Discord bot regarding the decision and further instructions.</p>
        </div>

        <button
          onClick={handleEditApplication}
          disabled={isResetting}
          className="px-6 py-3 bg-[#E53E3E] text-white rounded-md hover:bg-[#E53E3E]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isResetting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Edit your Application"
          )}
        </button>
      </div>
    </FormSection>
  )
}
