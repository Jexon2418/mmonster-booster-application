"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { DiscordAuthStep } from "./steps/discord-auth-step"
import { DiscordVerificationSuccessStep } from "./steps/discord-verification-success-step"
import { ClassificationStep } from "./steps/classification-step"
import { ServicesStep } from "./steps/services-step"
import { GamesStep } from "./steps/games-step"
import { ExperienceStep } from "./steps/experience-step"
import { ContactStep } from "./steps/contact-step"
import { PersonalStep } from "./steps/personal-step"
import { DiscordServerStep } from "./steps/discord-server-step"
import { CryptoStep } from "./steps/crypto-step"
import { StepIndicator } from "./step-indicator"
import { useSearchParams } from "next/navigation"
import {
  saveDraftToSupabase,
  loadDraftFromSupabase,
  markDraftAsSubmitted,
  getApplicationStatus,
} from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { FixedHeader } from "./fixed-header"
import { saveDiscordUser, getDiscordUser, clearDiscordUser, verifyDiscordSession } from "@/lib/auth-service"
import type { UploadedFile } from "@/lib/supabaseStorage"
import { SummaryStep } from "./steps/summary-step"
import { ThankYouStep } from "./steps/thank-you-step"
import { getSubmitCount } from "@/lib/supabaseClient"

export type DiscordUser = {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email: string | null
  fullDiscordTag: string
}

// Add submitCount to FormData type
export type FormData = {
  classification: "solo" | "group" | "reseller" | ""
  services: string[]
  games: string[]
  experience: string
  screenshots: File[]
  uploadedFiles: UploadedFile[]
  marketplaceProfiles?: {
    funpay: string
    g2g: string
    eldorado: string
    other: string
  }
  discordId: string
  telegram: string
  fullName: string
  dateOfBirth: string
  country: string
  language: string[] | string
  joinedDiscord: boolean
  acceptCrypto: boolean
  cryptoWallet: string
  submissionDate?: string
  status?: "pending" | "approved" | "rejected"
  discordUser?: DiscordUser | null
  isLoadingDraft?: boolean
  returnToSummary?: boolean
  isSubmitted?: boolean
  submitCount?: number
}

// Update the initialFormData to include submitCount
const initialFormData: FormData = {
  classification: "",
  services: [],
  games: [],
  experience: "",
  screenshots: [],
  uploadedFiles: [],
  marketplaceProfiles: {
    funpay: "",
    g2g: "",
    eldorado: "",
    other: "",
  },
  discordId: "",
  telegram: "",
  fullName: "",
  dateOfBirth: "",
  country: "",
  language: [],
  joinedDiscord: false,
  acceptCrypto: false,
  cryptoWallet: "",
  discordUser: null,
  returnToSummary: false,
  isSubmitted: false,
  submitCount: 0,
}

interface BoosterApplicationFormProps {
  initialDiscordCallback?: boolean
}

export default function BoosterApplicationForm({ initialDiscordCallback = false }: BoosterApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Use refs to track initialization state and prevent duplicate operations
  const initRef = useRef(false)
  const draftLoadedRef = useRef(false)
  const stepSetFromDraftRef = useRef(false)

  // Reference to the Discord auth handler from DiscordAuthStep
  const [discordAuthHandler, setDiscordAuthHandler] = useState<(() => void) | null>(null)

  // Improved updateFormData function to ensure complete form data is saved
  const updateFormData = useCallback(
    (data: Partial<FormData>) => {
      setFormData((prev) => {
        const updatedData = { ...prev, ...data }

        // Only save draft if we're initialized and have a Discord user
        if (isInitialized && updatedData.discordUser?.id) {
          // Ensure we're saving the complete form data
          saveDraftToSupabase(updatedData.discordUser.id, updatedData.discordUser.email || null, updatedData).catch(
            (error) => {
              console.error("Error saving draft:", error)
            },
          )
        }

        return updatedData
      })
    },
    [isInitialized],
  )

  // In the loadDraft function, update to fetch the submit count
  const loadDraft = useCallback(
    async (discordId: string) => {
      if (!discordId || draftLoadedRef.current) return

      setIsLoadingDraft(true)
      try {
        const draftData = await loadDraftFromSupabase(discordId)

        // Get the current submit count
        // const submitCount = await getSubmitCount(discordId)

        // Update the toast message to be clearer about how to proceed
        if (draftData) {
          // Mark draft as loaded to prevent duplicate loads
          draftLoadedRef.current = true

          // Merge the draft data with the current form data
          setFormData((prevData) => {
            const mergedData = {
              ...prevData,
              ...draftData,
              // Ensure Discord user data is preserved
              discordUser: prevData.discordUser,
              // Initialize uploadedFiles if it doesn't exist
              uploadedFiles: draftData.uploadedFiles || [],
              // Ensure language is an array
              language: Array.isArray(draftData.language)
                ? draftData.language
                : draftData.language
                  ? [draftData.language]
                  : [],
              // Add the submit count
              // submitCount: submitCount
            }

            return mergedData
          })

          toast({
            title: "Draft Loaded",
            description:
              "Your previous answers have been loaded. Please click through each step to continue your application.",
          })

          // We no longer automatically jump to the furthest completed step
        }
      } catch (error) {
        console.error("Error loading draft:", error)
      } finally {
        setIsLoadingDraft(false)
      }
    },
    [toast],
  )

  // Improved nextStep function with better state management
  const nextStep = useCallback(() => {
    if (currentStep < 11) {
      // Save current progress before moving to next step
      if (formData.discordUser?.id) {
        saveDraftToSupabase(formData.discordUser.id, formData.discordUser.email || null, formData).catch((error) => {
          console.error("Error saving draft on step change:", error)
        })
      }

      // If we should return to summary after editing a step
      if (formData.returnToSummary && currentStep >= 3 && currentStep <= 10) {
        setCurrentStep(11) // Go directly to summary step
        updateFormData({ returnToSummary: false }) // Reset the flag
      } else {
        setCurrentStep((prevStep) => prevStep + 1)
      }
      window.scrollTo(0, 0)
    }
  }, [currentStep, formData, updateFormData])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => prevStep - 1)
      window.scrollTo(0, 0)
    }
  }, [currentStep])

  // Update the useEffect for handling Discord OAuth callback
  // to always set the step to 2 after successful authentication
  useEffect(() => {
    // Check for discord_user param in URL
    const discordUserParam = searchParams.get("discord_user")
    if (discordUserParam) {
      try {
        const discordUser = JSON.parse(decodeURIComponent(discordUserParam)) as DiscordUser

        // Save the Discord user to localStorage and Supabase
        saveDiscordUser(discordUser)
          .then(async (success) => {
            if (success) {
              // Update form data with Discord user info
              updateFormData({
                discordId: discordUser.fullDiscordTag,
                discordUser: discordUser,
              })

              // Check if the user has a submitted application
              const status = await getApplicationStatus(discordUser.id)

              if (status.status === "submitted") {
                // If the user has a submitted application, set isSubmitted to true
                // and redirect to the Thank You page
                console.log("User has a submitted application, redirecting to Thank You page")
                updateFormData({
                  isSubmitted: true,
                  submitCount: status.submitCount || 0,
                })
                setCurrentStep(12) // Thank You page
              } else {
                // Move to next step
                setCurrentStep(2)
              }

              // Clean up URL params
              const url = new URL(window.location.href)
              url.searchParams.delete("discord_user")
              window.history.replaceState({}, document.title, url.toString())
            } else {
              // setError("Failed to save Discord user data. Please try again.")
            }
          })
          .catch((error) => {
            console.error("Error saving Discord user:", error)
            // setError("An error occurred during authentication. Please try again.")
          })
      } catch (e) {
        console.error("Error parsing Discord user data:", e)
        // setError("Failed to process Discord authentication data")
      }
    }
  }, [searchParams, updateFormData])

  // Update the useEffect for initializing the form with existing session
  // to always set the step to 2 (Discord verification success) after authentication
  useEffect(() => {
    // Only run this once
    if (initRef.current) return
    initRef.current = true

    // First check if we have a Discord user in localStorage
    const savedDiscordUser = getDiscordUser()

    if (savedDiscordUser) {
      // Verify the session with Supabase
      verifyDiscordSession(savedDiscordUser.id)
        .then(async (isValid) => {
          if (isValid) {
            // If session is valid, update the form data
            updateFormData({
              discordId: savedDiscordUser.fullDiscordTag,
              discordUser: savedDiscordUser,
            })

            // Check if the user has a submitted application
            const status = await getApplicationStatus(savedDiscordUser.id)

            if (status.status === "submitted") {
              // If the user has a submitted application, set isSubmitted to true
              // and redirect to the Thank You page
              console.log("User has a submitted application, redirecting to Thank You page")
              updateFormData({
                isSubmitted: true,
                submitCount: status.submitCount || 0,
              })
              setCurrentStep(12) // Thank You page
            } else {
              // Load draft data if available
              loadDraft(savedDiscordUser.id)
              // Set to step 2 (Discord verification success) after authentication
              setCurrentStep(2)
            }
          } else {
            // If session is invalid, clear the user data
            clearDiscordUser()
            toast({
              title: "Session Expired",
              description: "Your Discord session has expired. Please log in again.",
            })
          }

          // Mark as initialized after session check
          setIsInitialized(true)
        })
        .catch((error) => {
          console.error("Error verifying Discord session:", error)
          setIsInitialized(true)
        })
    } else {
      // No saved user, just mark as initialized
      setIsInitialized(true)

      // If this is a return from Discord OAuth, set step to 1
      if (initialDiscordCallback) {
        console.log("Setting step to Discord Auth (1) due to OAuth callback")
        setCurrentStep(1)
      }
    }
  }, [initialDiscordCallback, updateFormData, loadDraft, toast])

  // Add a logout handler function
  const handleLogout = useCallback(() => {
    // Clear Discord user data
    clearDiscordUser()

    // Reset form data and refs
    setFormData(initialFormData)
    draftLoadedRef.current = false
    stepSetFromDraftRef.current = false

    // Return to first step
    setCurrentStep(1)

    toast({
      title: "Logged Out",
      description: "You have been logged out of your Discord account.",
    })
  }, [toast])

  // Update the handleSubmit function to set the current step to 12 after successful submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      console.log("Starting submission process...")

      // Prepare data for submission
      const submissionData = {
        ...formData,
        submissionDate: new Date().toISOString(),
        status: "pending",
      }

      // If there are screenshots, handle them separately
      if (submissionData.screenshots.length > 0) {
        submissionData.screenshotNames = submissionData.screenshots.map((file) => file.name)
        // Remove the actual files as they can't be serialized to JSON
        delete submissionData.screenshots
      }

      // Include uploaded file paths in the submission
      if (submissionData.uploadedFiles && submissionData.uploadedFiles.length > 0) {
        submissionData.uploadedFilePaths = submissionData.uploadedFiles.map((file) => file.path)
      }

      // Mark the draft as submitted in Supabase if we have a Discord ID
      if (formData.discordUser?.id) {
        console.log(`Marking application as submitted for Discord ID: ${formData.discordUser.id}`)

        // First ensure the latest form data is saved
        await saveDraftToSupabase(formData.discordUser.id, formData.discordUser.email || null, formData)

        // Then mark it as submitted
        const success = await markDraftAsSubmitted(formData.discordUser.id)

        if (!success) {
          throw new Error("Failed to mark application as submitted in database")
        }

        console.log("Successfully marked application as submitted")

        // Get the updated submit count
        const newSubmitCount = await getSubmitCount(formData.discordUser.id)
        console.log(`Updated submit count: ${newSubmitCount}`)

        // Update the form data with the new submit count
        updateFormData({
          submitCount: newSubmitCount,
          isSubmitted: true,
        })
      } else {
        console.error("Cannot submit application: Discord user ID is missing")
        throw new Error("Discord user ID is missing")
      }

      // Set the current step to the Thank You page (step 12)
      setCurrentStep(12)

      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted. We'll review it shortly.",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add a handler for the "Edit your Application" button
  const handleEditApplication = useCallback(() => {
    // Set the current step to the Summary step
    setCurrentStep(11)
    // Update form data to indicate it's no longer submitted
    updateFormData({ isSubmitted: false })
  }, [updateFormData])

  const isButtonDisabled = () => {
    switch (currentStep) {
      case 2: // Discord verification success
        return false
      case 3: // Classification
        return !formData.classification
      case 4: // Services
        return formData.services.length === 0
      case 5: // Games
        return formData.games.length === 0
      case 6: // Experience
        return !formData.experience
      case 7: // Contact
        return !formData.discordId
      case 8: // Personal
        return (
          !formData.fullName ||
          !formData.dateOfBirth ||
          !formData.country ||
          (Array.isArray(formData.language) ? formData.language.length === 0 : !formData.language)
        )
      case 9: // Discord server
        return !formData.joinedDiscord
      case 10: // Crypto
        return !formData.acceptCrypto || isSubmitting
      case 11: // Summary
        return isSubmitting
      default:
        return false
    }
  }

  const handleEditStep = useCallback(
    (step: number) => {
      // Set the flag to return to summary after editing
      updateFormData({ returnToSummary: true })
      setCurrentStep(step)
      window.scrollTo(0, 0)
    },
    [updateFormData],
  )

  // Update the renderStep function to include the new Thank You step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DiscordAuthStep
            onContinue={nextStep}
            onBack={prevStep}
            formData={formData}
            updateFormData={updateFormData}
            setAuthHandler={setDiscordAuthHandler}
          />
        )
      case 2:
        return (
          <DiscordVerificationSuccessStep
            onContinue={nextStep}
            onBack={prevStep}
            discordUser={formData.discordUser}
            isLoadingDraft={isLoadingDraft}
          />
        )
      case 3:
        return (
          <ClassificationStep
            formData={formData}
            updateFormData={updateFormData}
            onContinue={nextStep}
            onBack={prevStep}
          />
        )
      case 4:
        return (
          <ServicesStep formData={formData} updateFormData={updateFormData} onContinue={nextStep} onBack={prevStep} />
        )
      case 5:
        return <GamesStep formData={formData} updateFormData={updateFormData} onContinue={nextStep} onBack={prevStep} />
      case 6:
        return (
          <ExperienceStep formData={formData} updateFormData={updateFormData} onContinue={nextStep} onBack={prevStep} />
        )
      case 7:
        return (
          <ContactStep formData={formData} updateFormData={updateFormData} onContinue={nextStep} onBack={prevStep} />
        )
      case 8:
        return (
          <PersonalStep formData={formData} updateFormData={updateFormData} onContinue={nextStep} onBack={prevStep} />
        )
      case 9:
        return (
          <DiscordServerStep
            formData={formData}
            updateFormData={updateFormData}
            onContinue={nextStep}
            onBack={prevStep}
          />
        )
      case 10:
        return (
          <CryptoStep
            formData={formData}
            updateFormData={updateFormData}
            onContinue={nextStep}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        )
      case 11:
        return (
          <SummaryStep
            formData={formData}
            onSubmit={handleSubmit}
            onBack={prevStep}
            onEditStep={handleEditStep}
            isSubmitting={isSubmitting}
          />
        )
      case 12:
        return (
          <ThankYouStep
            onEditApplication={handleEditApplication}
            discordUser={formData.discordUser}
            submitCount={formData.submitCount}
          />
        )
      default:
        return (
          <DiscordAuthStep
            onContinue={nextStep}
            onBack={prevStep}
            formData={formData}
            updateFormData={updateFormData}
            setAuthHandler={setDiscordAuthHandler}
          />
        )
    }
  }

  // Update the StepIndicator to include the new step
  return (
    <>
      {/* Fixed Header */}
      <FixedHeader
        user={formData.discordUser}
        onLogout={handleLogout}
        onLogin={discordAuthHandler || undefined}
        isLoginStep={currentStep === 1}
      />

      {/* Main Content - with padding to account for fixed header */}
      <div className="w-full max-w-3xl px-4">
        {/* Only show step indicator if not on Thank You page */}
        {currentStep !== 12 && <StepIndicator currentStep={currentStep} totalSteps={11} />}
        <div className="mt-4 bg-[#1A202C] border border-[#E53E3E]/30 rounded-xl p-8 text-white">
          {/* Only show Back button if we're past step 1 and not on Thank You page */}
          {currentStep > 1 && currentStep !== 12 && (
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={prevStep}
                className="px-4 py-2 bg-transparent border border-[#E53E3E]/30 text-[#E53E3E] rounded-md hover:bg-[#E53E3E]/10 transition-colors"
              >
                Back
              </button>
              {/* Next/Submit button removed as requested */}
              <div></div> {/* Empty div to maintain layout */}
            </div>
          )}
          {renderStep()}
        </div>
      </div>
    </>
  )
}
