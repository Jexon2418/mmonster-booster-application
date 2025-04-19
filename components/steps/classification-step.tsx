"use client"

import { useState } from "react"
import { FormSection, FormButtons, FormRadio, FormCheckbox } from "../ui-components"
import type { FormData } from "../booster-application-form"

interface ClassificationStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onContinue: () => void
  onBack: () => void
}

export function ClassificationStep({ formData, updateFormData, onContinue, onBack }: ClassificationStepProps) {
  const [classification, setClassification] = useState<string>(formData.classification)
  const [confirmed, setConfirmed] = useState<boolean>(false)

  const handleContinue = () => {
    updateFormData({ classification: classification as "solo" | "group" | "reseller" })
    onContinue()
  }

  return (
    <FormSection
      title="Classification"
      description="Specify if you are an individual booster, represent a booster group/community, or a reseller."
      className="classification-step"
    >
      <div className="space-y-4 mt-6">
        <FormRadio
          id="solo"
          name="classification"
          label="Solo Booster"
          value="solo"
          checked={classification === "solo"}
          onChange={(e) => setClassification(e.target.value)}
        />
        <FormRadio
          id="group"
          name="classification"
          label="Boosting Group"
          value="group"
          checked={classification === "group"}
          onChange={(e) => setClassification(e.target.value)}
        />
        <FormRadio
          id="reseller"
          name="classification"
          label="Reseller"
          value="reseller"
          checked={classification === "reseller"}
          onChange={(e) => setClassification(e.target.value)}
        />
      </div>

      <div className="mt-6">
        <FormCheckbox
          id="confirm-classification"
          label={
            <span>
              I confirm my selection <span className="text-[#E53E3E]">*</span>
            </span>
          }
          checked={confirmed}
          onChange={setConfirmed}
        />
        <p className="text-gray-400 text-sm mt-2 ml-8">
          We work with all types of boosters, including resellers, but it is important that you identify yourself
          correctly. If you do not fulfill orders yourself or personally participate in them but delegate them to other
          executors, you are considered a reseller.
        </p>
      </div>

      <FormButtons onContinue={handleContinue} onBack={onBack} disabled={!classification || !confirmed} />
    </FormSection>
  )
}
