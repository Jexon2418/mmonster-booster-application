"use client"

import { useState, useEffect } from "react"
import { FormSection, FormButtons, FormTextarea } from "../ui-components"
import { SupabaseFileUpload } from "../supabase-file-upload"
import type { FormData } from "../booster-application-form"
import type { UploadedFile } from "../booster-application-form"

interface ExperienceStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onContinue: () => void
  onBack: () => void
}

export function ExperienceStep({ formData, updateFormData, onContinue, onBack }: ExperienceStepProps) {
  const [experience, setExperience] = useState(formData.experience)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(formData.uploadedScreenshots || [])
  const [marketplaceProfiles, setMarketplaceProfiles] = useState({
    funpay: formData.marketplaceProfiles?.funpay || "",
    g2g: formData.marketplaceProfiles?.g2g || "",
    eldorado: formData.marketplaceProfiles?.eldorado || "",
    other: formData.marketplaceProfiles?.other || "",
  })

  // Get Discord ID from formData
  const discordId = formData.discordUser?.id || "anonymous"

  // Log initial state for debugging
  useEffect(() => {
    if (formData.uploadedScreenshots && formData.uploadedScreenshots.length > 0) {
      console.log("Initial uploaded screenshots count:", formData.uploadedScreenshots.length)
    }
  }, [formData.uploadedScreenshots])

  const handleContinue = () => {
    updateFormData({
      experience,
      uploadedScreenshots: uploadedFiles,
      marketplaceProfiles: {
        funpay: marketplaceProfiles.funpay,
        g2g: marketplaceProfiles.g2g,
        eldorado: marketplaceProfiles.eldorado,
        other: marketplaceProfiles.other,
      },
      // Keep the screenshots array for backward compatibility
      screenshots: [],
    })
    onContinue()
  }

  const handleFilesChange = (files: UploadedFile[]) => {
    // Only update state if files have actually changed
    if (JSON.stringify(files) !== JSON.stringify(uploadedFiles)) {
      setUploadedFiles(files)
    }
  }

  const handleMarketplaceChange = (field: keyof typeof marketplaceProfiles, value: string) => {
    setMarketplaceProfiles((prev) => ({
      ...prev,
      [field]: value,
    }))
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
            If you have any proof of your work or evidence of your in-game achievements, you can upload up to 5
            screenshots (max 3MB each).
          </p>

          <SupabaseFileUpload
            discordId={discordId}
            onFilesChange={handleFilesChange}
            initialFiles={uploadedFiles}
            maxFiles={5}
            maxSizeMB={3}
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
              value={marketplaceProfiles.funpay}
              onChange={(e) => handleMarketplaceChange("funpay", e.target.value)}
              className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
            />
            <input
              type="text"
              placeholder="G2G profile url"
              value={marketplaceProfiles.g2g}
              onChange={(e) => handleMarketplaceChange("g2g", e.target.value)}
              className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
            />
            <input
              type="text"
              placeholder="eldorado.gg profile url"
              value={marketplaceProfiles.eldorado}
              onChange={(e) => handleMarketplaceChange("eldorado", e.target.value)}
              className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
            />
            <input
              type="text"
              placeholder="other marketplace profile url"
              value={marketplaceProfiles.other}
              onChange={(e) => handleMarketplaceChange("other", e.target.value)}
              className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
            />
          </div>
        </div>
      </div>

      <FormButtons onContinue={handleContinue} onBack={onBack} disabled={!experience} />
    </FormSection>
  )
}
