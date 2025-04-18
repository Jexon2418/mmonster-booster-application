"use client"

import { useState } from "react"
import { FormSection, FormButtons, FormCheckbox } from "../ui-components"
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
          className="text-[#E53E3E] hover:underline"
        >
          https://discord.gg/xUrkb2u5UP
        </a>

        <FormCheckbox
          id="joined-discord"
          label="I have joined the server"
          checked={joinedDiscord}
          onChange={setJoinedDiscord}
          required
        />
      </div>

      <FormButtons onContinue={handleContinue} onBack={onBack} disabled={!joinedDiscord} />
    </FormSection>
  )
}
