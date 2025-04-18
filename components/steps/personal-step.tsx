"use client"

import { useState } from "react"
import { FormSection, FormButtons, FormInput, FormSelect } from "../ui-components"
import type { FormData } from "../booster-application-form"

interface PersonalStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onContinue: () => void
  onBack: () => void
}

const COUNTRIES = [
  { value: "", label: "Select country" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "RU", label: "Russia" },
  { value: "UA", label: "Ukraine" },
  { value: "PL", label: "Poland" },
  { value: "CN", label: "China" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "BR", label: "Brazil" },
  { value: "IN", label: "India" },
]

const LANGUAGES = [
  { value: "", label: "Select language" },
  { value: "en", label: "English" },
  { value: "ru", label: "Russian" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
]

export function PersonalStep({ formData, updateFormData, onContinue, onBack }: PersonalStepProps) {
  const [fullName, setFullName] = useState(formData.fullName)
  const [dateOfBirth, setDateOfBirth] = useState(formData.dateOfBirth)
  const [country, setCountry] = useState(formData.country)
  const [language, setLanguage] = useState(formData.language)

  const handleContinue = () => {
    updateFormData({ fullName, dateOfBirth, country, language })
    onContinue()
  }

  return (
    <FormSection
      title="Personal Details"
      description="When working with you, we entrust you with our clients' game data, in-game assets, and other confidential information. We also engage in financial transactions with you (during payouts). For security reasons, we need to know who we are working with, which is why full identification as a booster is required."
    >
      <div className="space-y-6 mt-6">
        <FormInput
          id="fullName"
          label="Your Name"
          placeholder="Firstname and Lastname"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          helperText="Introduce yourself by providing your full name."
        />
        <FormInput
          id="dateOfBirth"
          label="Date of Birth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
        />
        <FormSelect
          id="country"
          label="Country of Residence"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          options={COUNTRIES}
          required
        />
        <FormSelect
          id="language"
          label="Language of Communication"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          options={LANGUAGES}
          required
        />
      </div>

      <FormButtons
        onContinue={handleContinue}
        onBack={onBack}
        disabled={!fullName || !dateOfBirth || !country || !language}
      />
    </FormSection>
  )
}
