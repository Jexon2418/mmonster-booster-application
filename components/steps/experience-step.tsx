"use client"

import { useState } from "react"
import { FormSection, FormButtons, FormTextarea, FileUpload } from "../ui-components"
import type { FormData } from "../booster-application-form"

interface ExperienceStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onContinue: () => void
  onBack: () => void
}

export function ExperienceStep({ formData, updateFormData, onContinue, onBack }: ExperienceStepProps) {
  const [experience, setExperience] = useState(formData.experience)
  const [screenshots, setScreenshots] = useState<File[]>(formData.screenshots)

  const handleContinue = () => {
    updateFormData({ experience, screenshots })
    onContinue()
  }

  return (
    <FormSection
      title="Boosting Experience"
      description="Tell us a bit more about your gaming experience and your work as a booster. Provide some links or screenshots of your achievements or proof of your work."
    >
      <div className="space-y-6 mt-6">
        <FormTextarea
          id="experience"
          label="Describe your boosting experience"
          placeholder="Describe your experience, the trading platforms you have worked with, and feel free to share a few links."
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          required
        />

        <div className="space-y-2">
          <h3 className="text-white">Proofs of Work as a Booster</h3>
          <p className="text-gray-400 text-sm">
            If you have any proof of your work or evidence of your in-game achievements, you can upload a few
            screenshots.
          </p>
          <FileUpload
            onFilesSelected={setScreenshots}
            multiple
            accept="image/jpeg,image/png,image/heic,image/webp,application/pdf"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-white">Marketplace Profiles</h3>
          <p className="text-gray-400 text-sm">
            If you have profiles on any marketplaces, please provide them in the fields below.
          </p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="FunPay profile url"
              className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
            />
            <input
              type="text"
              placeholder="G2G profile url"
              className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
            />
            <input
              type="text"
              placeholder="eldorado.gg profile url"
              className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
            />
            <input
              type="text"
              placeholder="other marketplace profile url"
              className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
            />
          </div>
        </div>
      </div>

      <FormButtons onContinue={handleContinue} onBack={onBack} disabled={!experience} />
    </FormSection>
  )
}
