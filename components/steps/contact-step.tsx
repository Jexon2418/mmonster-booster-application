"use client"

import { useState } from "react"
import { FormSection, FormButtons, FormInput } from "../ui-components"
import type { FormData } from "../booster-application-form"

interface ContactStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onContinue: () => void
  onBack: () => void
}

export function ContactStep({ formData, updateFormData, onContinue, onBack }: ContactStepProps) {
  const [discordId, setDiscordId] = useState(formData.discordId)
  const [telegram, setTelegram] = useState(formData.telegram)

  const handleContinue = () => {
    updateFormData({ discordId, telegram })
    onContinue()
  }

  return (
    <FormSection
      title="Contact Details"
      description="Share your contact details so we can reach you. Please note that Discord is mandatory for working with us."
    >
      <div className="space-y-6 mt-6">
        <FormInput
          id="discord"
          label="Discord ID"
          placeholder="YourUsername#0000"
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
          required
        />
        <FormInput
          id="telegram"
          label="Telegram"
          placeholder="Type your Telegram ID"
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
        />
      </div>

      <FormButtons onContinue={handleContinue} onBack={onBack} disabled={!discordId} />
    </FormSection>
  )
}
