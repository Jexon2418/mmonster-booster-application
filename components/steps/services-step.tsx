"use client"

import { useState } from "react"
import { FormSection, FormButtons, FormCheckboxCard } from "../ui-components"
import type { FormData } from "../booster-application-form"

interface ServicesStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onContinue: () => void
  onBack: () => void
}

export function ServicesStep({ formData, updateFormData, onContinue, onBack }: ServicesStepProps) {
  const [services, setServices] = useState<string[]>(formData.services)

  const toggleService = (service: string) => {
    if (services.includes(service)) {
      setServices(services.filter((s) => s !== service))
    } else {
      setServices([...services, service])
    }
  }

  const handleContinue = () => {
    updateFormData({ services })
    onContinue()
  }

  return (
    <FormSection
      title="Type of Services"
      description="Select all services you provide in various online games. Multiple selection is allowed."
    >
      <div className="space-y-4 mt-6">
        <FormCheckboxCard
          id="boosting"
          label="Boosting Services"
          checked={services.includes("boosting")}
          onChange={() => toggleService("boosting")}
        />
        <FormCheckboxCard
          id="farming"
          label="Farm & Leveling"
          checked={services.includes("farming")}
          onChange={() => toggleService("farming")}
        />
        <FormCheckboxCard
          id="currency"
          label="In-Game Currency"
          checked={services.includes("currency")}
          onChange={() => toggleService("currency")}
        />
        <FormCheckboxCard
          id="items"
          label="Items Trading"
          checked={services.includes("items")}
          onChange={() => toggleService("items")}
        />
        <FormCheckboxCard
          id="coaching"
          label="Game Coaching"
          checked={services.includes("coaching")}
          onChange={() => toggleService("coaching")}
        />
      </div>

      <FormButtons onContinue={handleContinue} onBack={onBack} disabled={services.length === 0} />
    </FormSection>
  )
}
