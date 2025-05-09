"use client"

import { FormSection } from "../ui-components"
import Image from "next/image"
import type { DiscordUser } from "../booster-application-form"
import { Loader2 } from "lucide-react"

interface DiscordVerificationSuccessStepProps {
  onContinue?: () => void
  onBack?: () => void
  discordUser?: DiscordUser | null
  isLoadingDraft?: boolean
}

export function DiscordVerificationSuccessStep({
  onContinue,
  onBack,
  discordUser,
  isLoadingDraft,
}: DiscordVerificationSuccessStepProps) {
  // Function to generate Discord avatar URL
  const getAvatarUrl = () => {
    if (!discordUser?.avatar) {
      // Default Discord avatar
      const defaultAvatarNumber = Number.parseInt(discordUser?.discriminator || "0") % 5
      return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
    }

    // Custom avatar
    return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128`
  }

  return (
    <FormSection
      title="Discord Verification Successful"
      description="Your Discord account has been successfully verified. You can now continue with your application."
    >
      <div className="flex flex-col items-center justify-center py-6">
        {discordUser && (
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#5865F2]">
              <Image src={getAvatarUrl() || "/placeholder.svg"} alt="Discord Avatar" fill className="object-cover" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">
                {discordUser.username}
                {discordUser.discriminator && discordUser.discriminator !== "0" && (
                  <span className="text-gray-400">#{discordUser.discriminator}</span>
                )}
              </h3>
              {discordUser.email && <p className="text-gray-400 text-sm">{discordUser.email}</p>}
            </div>
          </div>
        )}

        <div className="bg-[#1E2533] rounded-md p-6 w-full">
          <div className="flex items-center mb-4">
            <div className="bg-green-500 rounded-full p-1 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-white font-medium">Discord verification complete</span>
          </div>
          <p className="text-gray-400 text-sm ml-9">
            Your Discord account has been successfully linked to your application. This helps us verify your identity
            and communicate with you throughout the application process.
          </p>

          {!isLoadingDraft ? (
            <div className="mt-4 bg-[#1E2533] p-3 rounded-md border border-[#4A5568]/50">
              <p className="text-gray-300 text-sm">
                <span className="font-medium text-white">Note:</span> If you have a previously saved application, your
                answers have been loaded. Please click "Continue" to proceed through each step of the form.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex items-center text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading your saved progress...</span>
            </div>
          )}
        </div>
      </div>

      {onContinue && (
        <div className="mt-8">
          <button
            onClick={onContinue}
            className="w-full py-3 bg-[#E53E3E] text-white rounded-md hover:bg-[#E53E3E]/90 transition-colors"
          >
            Continue
          </button>
        </div>
      )}
    </FormSection>
  )
}
