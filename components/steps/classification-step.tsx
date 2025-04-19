"use client"

import { useState } from "react"
import { FormSection, FormButtons, FormCheckbox } from "../ui-components"
import { Card } from "@/components/ui/card"
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

  const handleClassificationChange = (value: string) => {
    setClassification(value)
  }

  return (
    <FormSection
      title="Classification"
      description="Specify if you are an individual booster, represent a booster group/community, or a reseller."
      className="classification-step"
    >
      <div className="space-y-4 mt-6">
        {/* Solo Booster Option */}
        <div
          className={`rounded-md overflow-hidden border ${
            classification === "solo" ? "border-[#E53E3E]" : "border-[#4A5568]"
          } transition-colors cursor-pointer`}
          onClick={() => handleClassificationChange("solo")}
        >
          <div className="flex items-center p-4 bg-[#2D3748]">
            <input
              type="radio"
              id="solo"
              name="classification"
              value="solo"
              checked={classification === "solo"}
              onChange={() => handleClassificationChange("solo")}
              className="h-5 w-5 text-[#E53E3E] border-[#4A5568] focus:ring-[#E53E3E]/50 bg-[#2D3748] cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor="solo" className="ml-3 text-white font-medium cursor-pointer">
              Solo Booster
            </label>
          </div>
          <div className="p-4 bg-[#1E2533] text-gray-300 text-sm">
            You are an individual booster who personally completes all orders without delegating them to others. You do
            NOT pass orders to third parties, including friends or acquaintances — you handle everything by yourself.
          </div>
        </div>

        {/* Group or Guild Option */}
        <div
          className={`rounded-md overflow-hidden border ${
            classification === "group" ? "border-[#E53E3E]" : "border-[#4A5568]"
          } transition-colors cursor-pointer`}
          onClick={() => handleClassificationChange("group")}
        >
          <div className="flex items-center p-4 bg-[#2D3748]">
            <input
              type="radio"
              id="group"
              name="classification"
              value="group"
              checked={classification === "group"}
              onChange={() => handleClassificationChange("group")}
              className="h-5 w-5 text-[#E53E3E] border-[#4A5568] focus:ring-[#E53E3E]/50 bg-[#2D3748] cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor="group" className="ml-3 text-white font-medium cursor-pointer">
              Group or Guild
            </label>
          </div>
          <div className="p-4 bg-[#1E2533] text-gray-300 text-sm">
            You are a group of boosters or a guild made up of regular, consistent members, with a leader who personally
            participates in every service. You do NOT resell services to other players, even if they are your friends or
            guildmates.
          </div>
        </div>

        {/* Reseller or Business Option */}
        <div
          className={`rounded-md overflow-hidden border ${
            classification === "reseller" ? "border-[#E53E3E]" : "border-[#4A5568]"
          } transition-colors cursor-pointer`}
          onClick={() => handleClassificationChange("reseller")}
        >
          <div className="flex items-center p-4 bg-[#2D3748]">
            <input
              type="radio"
              id="reseller"
              name="classification"
              value="reseller"
              checked={classification === "reseller"}
              onChange={() => handleClassificationChange("reseller")}
              className="h-5 w-5 text-[#E53E3E] border-[#4A5568] focus:ring-[#E53E3E]/50 bg-[#2D3748] cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor="reseller" className="ml-3 text-white font-medium cursor-pointer">
              Reseller or Business
            </label>
          </div>
          <div className="p-4 bg-[#1E2533] text-gray-300 text-sm">
            You delegate or resell orders to other players and do not personally work on the orders. Resellers usually
            operate on marketplaces or run businesses that earn money by connecting buyers with service providers.
          </div>
        </div>
      </div>

      {/* Confirmation Section */}
      <Card className="mt-6 border border-[#E53E3E]/30 bg-[#1E2533]">
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <FormCheckbox
              id="confirm-classification"
              label={
                <span className="font-medium">
                  I confirm my selection <span className="text-[#E53E3E]">*</span>
                </span>
              }
              checked={confirmed}
              onChange={setConfirmed}
            />
          </div>
          <p className="text-gray-300 text-sm mt-3 ml-8">
            Please take this step seriously and choose your category carefully and responsibly. If you misidentify
            yourself or try to hide your true classification, it may result in penalties, including a permanent account
            ban. We work with all types of boosters, including resellers. However, it is very important for us to
            clearly understand who we are working with, so please make your choice consciously.
          </p>
        </div>
      </Card>

      <FormButtons onContinue={handleContinue} onBack={onBack} disabled={!classification || !confirmed} />
    </FormSection>
  )
}
