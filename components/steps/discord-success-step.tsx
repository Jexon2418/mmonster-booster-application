"use client"

import { FormSection, FormButtons } from "../ui-components"
import type { DiscordUser } from "@/lib/discord-auth"
import Image from "next/image"

interface DiscordSuccessStepProps {
  discordUser: DiscordUser
  onContinue: () => void
  onBack: () => void
}

export function DiscordSuccessStep({ discordUser, onContinue, onBack }: DiscordSuccessStepProps) {
  // Формируем отображаемое имя пользователя
  const displayName = `${discordUser.username}${
    discordUser.discriminator && discordUser.discriminator !== "0" ? `#${discordUser.discriminator}` : ""
  }`

  return (
    <FormSection
      title="Discord Authentication Successful"
      description="Your Discord account has been successfully verified. You can now continue with the application process."
    >
      <div className="mt-8 bg-[#1E2533] rounded-md p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-700">
            {discordUser.avatar ? (
              <Image
                src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`}
                alt={`${discordUser.username}'s avatar`}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-3xl">
                {discordUser.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h3 className="text-xl font-medium mb-2 text-white">Welcome, {displayName}!</h3>

          <div className="mt-4 w-full space-y-3">
            <div className="bg-[#2D3748] p-3 rounded-md">
              <p className="text-gray-400 text-sm">Discord User ID:</p>
              <p className="text-white font-mono">{discordUser.id}</p>
            </div>

            {discordUser.email && (
              <div className="bg-[#2D3748] p-3 rounded-md">
                <p className="text-gray-400 text-sm">Email:</p>
                <p className="text-white">{discordUser.email}</p>
              </div>
            )}

            <div className="bg-[#2D3748] p-3 rounded-md">
              <p className="text-gray-400 text-sm">Account Created:</p>
              <p className="text-white">
                {new Date(Number.parseInt(discordUser.id) / 4194304 + 1420070400000).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 inline-block mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Discord account verified
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Your Discord account has been successfully linked to your application.
            </p>
          </div>
        </div>
      </div>

      <FormButtons onContinue={onContinue} onBack={onBack} continueText="Continue to Next Step" />
    </FormSection>
  )
}
