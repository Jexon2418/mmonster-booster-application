"use client"

import { FormSection } from "../ui-components"
import Image from "next/image"

interface WelcomeStepProps {
  onContinue: () => void
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <FormSection title="Verification for MmonsteR">
      <div className="flex flex-col items-center justify-center py-6">
        <div className="w-64 h-24 relative mb-8">
          <Image src="/mmonster-logo.png" alt="MMOnster Logo" fill style={{ objectFit: "contain" }} priority />
        </div>
        <p className="text-center text-gray-400 mb-8">
          You're about to submit sensitive data to MmonsteR. If you received this link from a suspicious source, please
          close this page and notify us immediately.
        </p>
        <div className="w-full mt-8">
          <button
            onClick={onContinue}
            className="w-full py-3 bg-[#E53E3E] text-white rounded-md hover:bg-[#E53E3E]/90 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </FormSection>
  )
}
