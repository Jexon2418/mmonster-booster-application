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
import { submitBoosterApplication } from "@/lib/api"
import { useSearchParams } from "next/navigation"
import { saveDraftToSupabase, loadDraftFromSupabase, markDraftAsSubmitted } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { TopNavigation } from "./top-navigation"
import { FixedHeader } from "./fixed-header"
import { saveDiscordUser, getDiscordUser, clearDiscordUser, verifyDiscordSession } from "@/lib/auth-service"
import type { UploadedFile } from "@/lib/supabaseStorage"

export type DiscordUser = {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email: string | null
  fullDiscordTag: string
}

export type FormData = {
  classification: "solo" | "group" | "reseller" | ""
  services: string[]
  games: string[]
  experience: string
  screenshots: File[]
  uploadedFiles: UploadedFile[] // New field for Supabase Storage uploads
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
  language: string
  joinedDiscord: boolean
  acceptCrypto: boolean
  cryptoWallet: string
  submissionDate?: string
  status?: "pending" | "approved" | "rejected"
  discordUser?: DiscordUser | null
  isLoadingDraft?: boolean
}

const initialFormData: FormData = {
  classification: "",
  services: [],
  games: [],
  experience: "",
  screenshots: [],
  uploadedFiles: [], // Initialize as empty array
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
  language: "",
  joinedDiscord: false,
  acceptCrypto: false,
  cryptoWallet: "",
  discordUser: null,
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

  // Modify the loadDraft function to remove the step setting logic
  const loadDraft = useCallback(
    async (discordId: string) => {
      if (!discordId || draftLoadedRef.current) return

      setIsLoadingDraft(true)
      try {
        const draftData = await loadDraftFromSupabase(discordId)

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
    if (currentStep < 10) {
      // Save current progress before moving to next step
      if (formData.discordUser?.id) {
        saveDraftToSupabase(formData.discordUser.id, formData.discordUser.email || null, formData).catch((error) => {
          console.error("Error saving draft on step change:", error)
        })
      }

      setCurrentStep((prevStep) => prevStep + 1)
      window.scrollTo(0, 0)
    }
  }, [currentStep, formData])

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

        // Update form data with Discord user info
        updateFormData({
          discordId: discordUser.fullDiscordTag,
          discordUser: discordUser,
        })

        // Always move to Discord verification success step (step 2)
        // regardless of any draft data
        console.log("Setting step to Discord Verification Success (2) due to discord_user param")
        setCurrentStep(2)

        // Clean up URL params
        const url = new URL(window.location.href)
        url.searchParams.delete("discord_user")
        window.history.replaceState({}, document.title, url.toString())
      } catch (e) {
        console.error("Error parsing Discord user data:", e)
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
        .then((isValid) => {
          if (isValid) {
            // If session is valid, update the form data
            updateFormData({
              discordId: savedDiscordUser.fullDiscordTag,
              discordUser: savedDiscordUser,
            })

            // Load draft data if available, but don't change the step based on it
            loadDraft(savedDiscordUser.id)

            // Always set to step 2 (Discord verification success) after authentication
            // regardless of draft data
            setCurrentStep(2)
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

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

      // Send data to n8n
      await submitBoosterApplication(submissionData)

      // Mark the draft as submitted in Supabase if we have a Discord ID
      if (formData.discordUser?.id) {
        await markDraftAsSubmitted(formData.discordUser.id)
      }

      setIsSubmitted(true)
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted. We'll review it shortly.",
      })

      // Reset form or show success page
      setFormData(initialFormData)
      draftLoadedRef.current = false
      stepSetFromDraftRef.current = false
      setCurrentStep(1)
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
        return !formData.fullName || !formData.dateOfBirth || !formData.country || !formData.language
      case 9: // Discord server
        return !formData.joinedDiscord
      case 10: // Crypto
        return !formData.acceptCrypto || isSubmitting
      default:
        return false
    }
  }

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
            onSubmit={handleSubmit}
            onBack={prevStep}
            isSubmitting={isSubmitting}
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
        <StepIndicator currentStep={currentStep} totalSteps={10} />
        <div className="mt-4 bg-[#1A202C] border border-[#E53E3E]/30 rounded-xl p-8 text-white">
          {currentStep > 1 && (
            <TopNavigation
              onBack={prevStep}
              onNext={nextStep}
              currentStep={currentStep}
              totalSteps={10}
              disableNext={isButtonDisabled()}
            />
          )}
          {renderStep()}
        </div>
      </div>
    </>
  )
}
