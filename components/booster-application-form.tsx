"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { WelcomeStep } from "./steps/welcome-step"
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
import { DiscordUserDisplay } from "./discord-user-display"
import {
  saveDiscordUser,
  getDiscordUser,
  clearDiscordUser,
  isDiscordAuthenticated,
  verifyDiscordSession,
} from "@/lib/auth-service"

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

  // Improved loadDraft function with better state management
  const loadDraft = useCallback(
    async (discordId: string) => {
      if (!discordId || draftLoadedRef.current) return

      setIsLoadingDraft(true)
      try {
        const draftData = await loadDraftFromSupabase(discordId)

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
            }

            return mergedData
          })

          toast({
            title: "Draft Loaded",
            description: "Your previous application progress has been restored.",
          })

          // If the draft has data beyond step 3 and we haven't set the step yet,
          // move to the appropriate step
          if (
            !stepSetFromDraftRef.current &&
            (draftData.classification || draftData.services?.length > 0 || draftData.games?.length > 0)
          ) {
            // Determine the furthest step the user has completed
            let furthestStep = 3

            if (draftData.classification) furthestStep = Math.max(furthestStep, 4)
            if (draftData.services?.length > 0) furthestStep = Math.max(furthestStep, 5)
            if (draftData.games?.length > 0) furthestStep = Math.max(furthestStep, 6)
            if (draftData.experience) furthestStep = Math.max(furthestStep, 7)
            if (draftData.discordId || draftData.telegram) furthestStep = Math.max(furthestStep, 8)
            if (draftData.fullName || draftData.country) furthestStep = Math.max(furthestStep, 9)
            if (draftData.joinedDiscord) furthestStep = Math.max(furthestStep, 10)
            if (draftData.acceptCrypto) furthestStep = Math.max(furthestStep, 11)

            // Set the step and mark it as set from draft
            setCurrentStep(furthestStep)
            stepSetFromDraftRef.current = true
          }
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

  // Separate useEffect for handling Discord OAuth callback
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

        // Move to Discord verification success step
        console.log("Setting step to Discord Verification Success (3) due to discord_user param")
        setCurrentStep(3)

        // Clean up URL params
        const url = new URL(window.location.href)
        url.searchParams.delete("discord_user")
        window.history.replaceState({}, document.title, url.toString())
      } catch (e) {
        console.error("Error parsing Discord user data:", e)
      }
    }
  }, [searchParams, updateFormData])

  // Separate useEffect for initializing the form with existing session
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

            // Load draft data if available
            loadDraft(savedDiscordUser.id)

            // If we're on step 1 or 2, move to step 3 (Discord verification success)
            if (currentStep <= 2) {
              setCurrentStep(3)
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

      // If this is a return from Discord OAuth, set step to 2
      if (initialDiscordCallback) {
        console.log("Setting step to Discord Auth (2) due to OAuth callback")
        setCurrentStep(2)
      }
    }
  }, [initialDiscordCallback, updateFormData, loadDraft, currentStep, toast])

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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onContinue={nextStep} />
      case 2:
        return (
          <DiscordAuthStep
            onContinue={nextStep}
            onBack={prevStep}
            formData={formData}
            updateFormData={updateFormData}
          />
        )
      case 3:
        return (
          <DiscordVerificationSuccessStep
            onContinue={nextStep}
            onBack={prevStep}
            formData={{ ...formData, isLoadingDraft }}
          />
        )
      case 4:
        return (
          <ClassificationStep
            formData={formData}
            updateFormData={updateFormData}
            onContinue={nextStep}
            onBack={prevStep}
          />
        )
      case 5:
        return (
          <ServicesStep formData={formData} updateFormData={updateFormData} onContinue={nextStep} onBack={prevStep} />
        )
      case 6:
        return <GamesStep formData={formData} updateFormData={updateFormData} onContinue={nextStep} onBack={prevStep} />
      case 7:
        return (
          <ExperienceStep formData={formData} updateFormData={updateFormData} onContinue={nextStep} onBack={prevStep} />
        )
      case 8:
        return (
          <ContactStep formData={formData} updateFormData={updateFormData} onContinue={nextStep} onBack={prevStep} />
        )
      case 9:
        return (
          <PersonalStep formData={formData} updateFormData={updateFormData} onContinue={nextStep} onBack={prevStep} />
        )
      case 10:
        return (
          <DiscordServerStep
            formData={formData}
            updateFormData={updateFormData}
            onContinue={nextStep}
            onBack={prevStep}
          />
        )
      case 11:
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
        return <WelcomeStep onContinue={nextStep} />
    }
  }

  return (
    <div className="w-full max-w-3xl px-4">
      {isDiscordAuthenticated() && <DiscordUserDisplay user={formData.discordUser} onLogout={handleLogout} />}
      <StepIndicator currentStep={currentStep} totalSteps={11} />
      <div className="mt-4 bg-[#1A202C] border border-[#E53E3E]/30 rounded-xl p-8 text-white">{renderStep()}</div>
    </div>
  )
}
