"use client"

import { useState } from "react"
import { FormSection, FormButtons, FormCheckbox } from "../ui-components"
import { Card } from "@/components/ui/card"
import type { FormData } from "../booster-application-form"

interface DiscordServerStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onContinue: () => void
  onBack: () => void
}

export function DiscordServerStep({ formData, updateFormData, onContinue, onBack }: DiscordServerStepProps) {
  const [joinedDiscord, setJoinedDiscord] = useState(formData.joinedDiscord)

  const handleContinue = () => {
    updateFormData({ joinedDiscord })
    onContinue()
  }

  return (
    <FormSection
      title="Join Discord Server"
      description="As the next step, you need to join our recruiting Discord server using the link below. Once you've joined, please wait for your application to be reviewed. If we need any additional information, our HR manager will contact you directly through the Discord server."
    >
      <div className="mt-6 space-y-6">
        <a
          href="https://discord.gg/xUrkb2u5UP"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full"
        >
          <button className="w-full py-3 bg-[#5865F2] text-white rounded-md hover:bg-[#5865F2]/90 transition-colors">
            Join Javes Recruiting Discord
          </button>
        </a>

        <Card className="border border-[#E53E3E]/30 bg-[#1E2533]">
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <FormCheckbox
                id="joined-discord"
                label={
                  <span className="font-medium">
                    I have joined the server <span className="text-[#E53E3E]">*</span>
                  </span>
                }
                checked={joinedDiscord}
                onChange={setJoinedDiscord}
              />
            </div>
            <p className="text-gray-400 text-sm mt-3 ml-8">
              Joining the Javes Recruiting Discord server is an important step. Without it, your application may not be
              approved, as our HR Manager will only be able to contact you if you are present on the server.
            </p>
          </div>
        </Card>
      </div>

      <FormButtons onContinue={handleContinue} onBack={onBack} disabled={!joinedDiscord} />
    </FormSection>
  )
}
