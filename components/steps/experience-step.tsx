"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FormSection, FormButtons, FormTextarea } from "../ui-components"
import { FileUploader } from "../file-uploader"
import type { FormData } from "../booster-application-form"
import type { UploadedFile } from "@/lib/supabaseStorage"
import { listUserFiles } from "@/lib/supabaseStorage"

// Custom URL input component with https:// prefix
function UrlInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  // Handle input change and normalize URL
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let url = e.target.value

    // If user pastes a URL with https://, remove it to avoid duplication
    if (url.startsWith("https://")) {
      url = url.substring(8)
    }

    onChange(url)
  }

  return (
    <div className="flex items-center w-full">
      <div className="bg-[#1E2533] text-gray-400 px-3 py-3 border-y border-l border-[#4A5568] rounded-l-md">
        https://
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-none rounded-r-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
      />
    </div>
  )
}

interface ExperienceStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onContinue: () => void
  onBack: () => void
}

export function ExperienceStep({ formData, updateFormData, onContinue, onBack }: ExperienceStepProps) {
  const [experience, setExperience] = useState(formData.experience)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(formData.uploadedFiles || [])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [marketplaceProfiles, setMarketplaceProfiles] = useState({
    funpay: formData.marketplaceProfiles?.funpay || "",
    g2g: formData.marketplaceProfiles?.g2g || "",
    eldorado: formData.marketplaceProfiles?.eldorado || "",
    other: formData.marketplaceProfiles?.other || "",
  })

  // Load existing files when the component mounts
  useEffect(() => {
    const loadExistingFiles = async () => {
      // Only load files if we have a Discord user ID and no files are loaded yet
      if (formData.discordUser?.id && uploadedFiles.length === 0) {
        setIsLoadingFiles(true)
        try {
          const files = await listUserFiles(formData.discordUser.id)
          setUploadedFiles(files)
          updateFormData({ uploadedFiles: files })
        } catch (error) {
          console.error("Error loading files:", error)
        } finally {
          setIsLoadingFiles(false)
        }
      }
    }

    loadExistingFiles()
  }, [formData.discordUser?.id, uploadedFiles.length, updateFormData])

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    updateFormData({ uploadedFiles: files })
  }

  const handleContinue = () => {
    // Ensure all URLs have https:// prefix when saving
    const formattedProfiles = {
      funpay: formatUrl(marketplaceProfiles.funpay),
      g2g: formatUrl(marketplaceProfiles.g2g),
      eldorado: formatUrl(marketplaceProfiles.eldorado),
      other: formatUrl(marketplaceProfiles.other),
    }

    updateFormData({
      experience,
      uploadedFiles,
      marketplaceProfiles: formattedProfiles,
    })
    onContinue()
  }

  // Helper function to format URLs
  const formatUrl = (url: string): string => {
    if (!url) return ""
    return url.startsWith("https://") ? url : `https://${url}`
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

          {formData.discordUser?.id ? (
            <FileUploader
              discordId={formData.discordUser.id}
              uploadedFiles={uploadedFiles}
              onFilesChange={handleFilesChange}
            />
          ) : (
            <div className="bg-[#2D3748] border border-[#4A5568] rounded-md p-4 text-gray-400">
              Please log in with Discord to upload screenshots.
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-white">Marketplace Profiles</h3>
          <p className="text-gray-400 text-sm">
            If you have profiles on any marketplaces, please provide them in the fields below.
          </p>
          <div className="space-y-4">
            <UrlInput
              value={marketplaceProfiles.funpay}
              onChange={(value) => setMarketplaceProfiles({ ...marketplaceProfiles, funpay: value })}
              placeholder="FunPay profile url"
            />
            <UrlInput
              value={marketplaceProfiles.g2g}
              onChange={(value) => setMarketplaceProfiles({ ...marketplaceProfiles, g2g: value })}
              placeholder="G2G profile url"
            />
            <UrlInput
              value={marketplaceProfiles.eldorado}
              onChange={(value) => setMarketplaceProfiles({ ...marketplaceProfiles, eldorado: value })}
              placeholder="eldorado.gg profile url"
            />
            <UrlInput
              value={marketplaceProfiles.other}
              onChange={(value) => setMarketplaceProfiles({ ...marketplaceProfiles, other: value })}
              placeholder="other marketplace profile url"
            />
          </div>
        </div>
      </div>

      <FormButtons onContinue={handleContinue} onBack={onBack} disabled={!experience} />
    </FormSection>
  )
}
