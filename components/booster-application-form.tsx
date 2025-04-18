"use client"

import { useState } from "react"
import { WelcomeStep } from "./steps/welcome-step"
import { DiscordAuthStep } from "./steps/discord-auth-step"
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
}

export default function BoosterApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < 10) {
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Подготовка данных для отправки
      const submissionData = {
        ...formData,
        submissionDate: new Date().toISOString(),
        status: "pending",
      }

      // Если есть скриншоты, нужно их обработать отдельно
      // В этом примере мы просто добавляем имена файлов, но в реальном приложении
      // вам нужно будет загрузить файлы на сервер или в облачное хранилище
      if (submissionData.screenshots.length > 0) {
        submissionData.screenshotNames = submissionData.screenshots.map((file) => file.name)
        // Удаляем сами файлы из данных, так как их нельзя сериализовать в JSON
        delete submissionData.screenshots
      }

      // Отправка данных в n8n
      await submitBoosterApplication(submissionData)

      setIsSubmitted(true)
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted. We'll review it shortly.",
      })

      // Сбросить форму или показать страницу успеха
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
        return <DiscordAuthStep onContinue={nextStep} onBack={prevStep} />
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
        return <WelcomeStep onContinue={nextStep} />
    }
  }

  return (
    <div className="w-full max-w-3xl px-4">
      <StepIndicator currentStep={currentStep} totalSteps={10} />
      <div className="mt-4 bg-[#1A202C] border border-[#E53E3E]/30 rounded-xl p-8 text-white">{renderStep()}</div>
    </div>
  )
}
