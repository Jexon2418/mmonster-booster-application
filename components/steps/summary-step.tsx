"use client"

import type React from "react"
import { FormSection } from "../ui-components"
import type { FormData } from "../booster-application-form"
import { Edit } from "lucide-react"

interface SummaryStepProps {
  formData: FormData
  onSubmit: () => void
  onBack: () => void
  onEditStep: (step: number) => void
  isSubmitting?: boolean
}

// Update the SummaryStep component to display the submit count
export function SummaryStep({ formData, onSubmit, onBack, onEditStep, isSubmitting = false }: SummaryStepProps) {
  // Helper function to format languages for display
  const formatLanguages = () => {
    if (Array.isArray(formData.language)) {
      return formData.language.join(", ")
    }
    return formData.language || "Not provided"
  }

  // Add a helper to display the submission status
  const getSubmissionStatus = () => {
    if (formData.submitCount === 0) {
      return "Initial submission"
    } else {
      return `Resubmission #${formData.submitCount}`
    }
  }

  return (
    <FormSection
      title="Application Summary"
      description="Please review your application details before submitting. If you need to make changes, click the edit button next to any section."
    >
      <div className="space-y-8 mt-6">
        {/* Add Submission Status */}
        {formData.submitCount !== undefined && formData.submitCount > 0 && (
          <div className="bg-[#E53E3E]/10 border border-[#E53E3E]/30 rounded-md p-4">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#E53E3E] mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-[#E53E3E] font-medium">
                {getSubmissionStatus()} - You are editing a previously submitted application
              </span>
            </div>
          </div>
        )}

        {/* Discord Verification */}
        <SummarySection title="Discord Verification" onEdit={() => onEditStep(1)}>
          {formData.discordUser && (
            <div className="space-y-2">
              <SummaryItem label="Username" value={formData.discordUser.username} />
              {formData.discordUser.discriminator && formData.discordUser.discriminator !== "0" && (
                <SummaryItem label="Discriminator" value={`#${formData.discordUser.discriminator}`} />
              )}
              <SummaryItem label="Email" value={formData.discordUser.email || "Not provided"} />
            </div>
          )}
        </SummarySection>

        {/* Classification */}
        <SummarySection title="Classification" onEdit={() => onEditStep(3)}>
          <SummaryItem
            label="Type"
            value={
              formData.classification === "solo"
                ? "Solo Booster"
                : formData.classification === "group"
                  ? "Group or Guild"
                  : formData.classification === "reseller"
                    ? "Reseller or Business"
                    : "Not specified"
            }
          />
        </SummarySection>

        {/* Services */}
        <SummarySection title="Type of Services" onEdit={() => onEditStep(4)}>
          {formData.services.length > 0 ? (
            <div className="space-y-2">
              {formData.services.map((service) => (
                <div key={service} className="flex items-center">
                  <div className="w-2 h-2 bg-[#E53E3E] rounded-full mr-2"></div>
                  <span className="text-white">
                    {service === "boosting"
                      ? "Boosting Services"
                      : service === "farming"
                        ? "Farm & Leveling"
                        : service === "currency"
                          ? "In-Game Currency"
                          : service === "items"
                            ? "Items Trading"
                            : service === "coaching"
                              ? "Game Coaching"
                              : service}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <SummaryItem label="Services" value="None selected" />
          )}
        </SummarySection>

        {/* Games */}
        <SummarySection title="Games Selection" onEdit={() => onEditStep(5)}>
          {formData.games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {formData.games.map((game) => (
                <div key={game} className="flex items-center">
                  <div className="w-2 h-2 bg-[#E53E3E] rounded-full mr-2"></div>
                  <span className="text-white">{game}</span>
                </div>
              ))}
            </div>
          ) : (
            <SummaryItem label="Games" value="None selected" />
          )}
        </SummarySection>

        {/* Experience */}
        <SummarySection title="Boosting Experience" onEdit={() => onEditStep(6)}>
          <div className="space-y-4">
            <div>
              <h4 className="text-gray-400 text-sm mb-1">Experience Description</h4>
              <p className="text-white whitespace-pre-line">{formData.experience || "Not provided"}</p>
            </div>

            <div>
              <h4 className="text-gray-400 text-sm mb-1">Screenshots</h4>
              <p className="text-white">
                {formData.uploadedFiles && formData.uploadedFiles.length > 0
                  ? `${formData.uploadedFiles.length} file(s) uploaded`
                  : "No screenshots uploaded"}
              </p>
            </div>

            {formData.marketplaceProfiles && (
              <div className="space-y-2">
                <h4 className="text-gray-400 text-sm mb-1">Marketplace Profiles</h4>
                {formData.marketplaceProfiles.funpay && (
                  <SummaryItem label="FunPay" value={formData.marketplaceProfiles.funpay} />
                )}
                {formData.marketplaceProfiles.g2g && (
                  <SummaryItem label="G2G" value={formData.marketplaceProfiles.g2g} />
                )}
                {formData.marketplaceProfiles.eldorado && (
                  <SummaryItem label="Eldorado" value={formData.marketplaceProfiles.eldorado} />
                )}
                {formData.marketplaceProfiles.other && (
                  <SummaryItem label="Other" value={formData.marketplaceProfiles.other} />
                )}
                {!formData.marketplaceProfiles.funpay &&
                  !formData.marketplaceProfiles.g2g &&
                  !formData.marketplaceProfiles.eldorado &&
                  !formData.marketplaceProfiles.other && <p className="text-white">No marketplace profiles provided</p>}
              </div>
            )}
          </div>
        </SummarySection>

        {/* Contact */}
        <SummarySection title="Contact Details" onEdit={() => onEditStep(7)}>
          <div className="space-y-2">
            <SummaryItem label="Discord ID" value={formData.discordId || "Not provided"} />
            <SummaryItem label="Telegram" value={formData.telegram || "Not provided"} />
          </div>
        </SummarySection>

        {/* Personal */}
        <SummarySection title="Personal Details" onEdit={() => onEditStep(8)}>
          <div className="space-y-2">
            <SummaryItem label="Full Name" value={formData.fullName || "Not provided"} />
            <SummaryItem label="Date of Birth" value={formData.dateOfBirth || "Not provided"} />
            <SummaryItem label="Country" value={formData.country || "Not provided"} />
            <SummaryItem label="Languages" value={formatLanguages()} />
          </div>
        </SummarySection>

        {/* Discord Server */}
        <SummarySection title="Discord Server" onEdit={() => onEditStep(9)}>
          <SummaryItem label="Joined Discord Server" value={formData.joinedDiscord ? "Yes" : "No"} />
        </SummarySection>

        {/* Payment Details */}
        <SummarySection title="Payment Details" onEdit={() => onEditStep(10)}>
          <div className="space-y-2">
            <SummaryItem label="Accept Crypto Payouts" value={formData.acceptCrypto ? "Yes" : "No"} />
            <SummaryItem label="Crypto Wallet" value={formData.cryptoWallet || "Not provided"} />
          </div>
        </SummarySection>
      </div>

      <div className="mt-8 space-y-4">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-[#E53E3E] text-white rounded-md hover:bg-[#E53E3E]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : formData.submitCount && formData.submitCount > 0 ? (
            "Resubmit Application"
          ) : (
            "Submit Application"
          )}
        </button>
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full py-3 bg-transparent border border-[#E53E3E]/30 text-[#E53E3E] rounded-md hover:bg-[#E53E3E]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
      </div>
    </FormSection>
  )
}

interface SummarySectionProps {
  title: string
  children: React.ReactNode
  onEdit: () => void
}

function SummarySection({ title, children, onEdit }: SummarySectionProps) {
  return (
    <div className="border border-[#4A5568] rounded-md overflow-hidden">
      <div className="flex items-center justify-between bg-[#2D3748] px-4 py-3">
        <h3 className="font-medium text-white">{title}</h3>
        <button
          onClick={onEdit}
          className="text-[#E53E3E] hover:text-[#E53E3E]/80 transition-colors flex items-center text-sm"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </button>
      </div>
      <div className="p-4 bg-[#1E2533]">{children}</div>
    </div>
  )
}

interface SummaryItemProps {
  label: string
  value: string
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start">
      <span className="text-gray-400 sm:w-1/4 mb-1 sm:mb-0">{label}:</span>
      <span className="text-white sm:w-3/4 sm:-ml-2">{value}</span>
    </div>
  )
}
