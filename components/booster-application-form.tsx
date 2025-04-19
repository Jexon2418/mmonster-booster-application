"use client"

import { useState, useCallback, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"

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
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const updateFormData = useCallback((data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }, [])

  const nextStep = () => {
    if (currentStep < 11) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  // Обработка возврата после аутентификации Discord
  useEffect(() => {
    // Если это возврат от Discord OAuth, переходим на шаг 2 (Discord Auth)
    if (initialDiscordCallback) {
      console.log("Setting step to Discord Auth (2) due to OAuth callback")
      setCurrentStep(2)
    }

    // Проверяем, есть ли параметр discord_user в URL
    const discordUserParam = searchParams.get("discord_user")
    if (discordUserParam) {
      try {
        const discordUser = JSON.parse(decodeURIComponent(discordUserParam)) as DiscordUser

        // Обновляем данные формы с информацией о Discord пользователе
        updateFormData({
          discordId: discordUser.fullDiscordTag,
          discordUser: discordUser,
        })

        // Переходим на шаг успешной верификации Discord
        console.log("Setting step to Discord Verification Success (3) due to discord_user param")
        setCurrentStep(3)

        // Очищаем URL от параметров
        const url = new URL(window.location.href)
        url.searchParams.delete("discord_user")
        window.history.replaceState({}, document.title, url.toString())
      } catch (e) {
        console.error("Error parsing Discord user data:", e)
      }
    }
  }, [initialDiscordCallback, searchParams, updateFormData])

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

      setIsSubmitted(true)
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted. We'll review it shortly.",
      })

      // Reset form or show success page
      setFormData(initialFormData)
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
        return <DiscordVerificationSuccessStep onContinue={nextStep} onBack={prevStep} formData={formData} />
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
      <StepIndicator currentStep={currentStep} totalSteps={11} />
      <div className="mt-4 bg-[#1A202C] border border-[#E53E3E]/30 rounded-xl p-8 text-white">{renderStep()}</div>
    </div>
  )
}
