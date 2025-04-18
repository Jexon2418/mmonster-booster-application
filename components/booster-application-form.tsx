"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { WelcomeStep } from "./steps/welcome-step"
import { DiscordAuthStep } from "./steps/discord-auth-step"
import { DiscordSuccessStep } from "./steps/discord-success-step"
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
import type { DiscordUser } from "@/lib/discord-auth"

export type FormData = {
  classification: "solo" | "group" | "reseller" | ""
  services: string[]
  games: string[]
  experience: string
  screenshots: File[]
  discordId: string
  discordUser: DiscordUser | null
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
  discordUser: null,
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
  const searchParams = useSearchParams()
  const router = useRouter()

  // Проверяем наличие данных Discord пользователя или ошибок в URL
  useEffect(() => {
    // Обработка ошибок Discord аутентификации
    const error = searchParams?.get("error")
    const errorDescription = searchParams?.get("error_description") || searchParams?.get("details")

    if (error) {
      console.error(`Discord auth error: ${error}${errorDescription ? ` - ${errorDescription}` : ""}`)
      toast({
        title: "Discord Authentication Error",
        description:
          errorDescription ||
          "An error occurred during Discord authentication. Please try again or continue without authentication.",
        variant: "destructive",
      })

      // Очищаем URL от параметров ошибки
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/")
      }
    }

    // Обработка успешной аутентификации
    const discordUserParam = searchParams?.get("discord_user")

    if (discordUserParam) {
      try {
        const discordUser = JSON.parse(decodeURIComponent(discordUserParam)) as DiscordUser

        // Обновляем данные формы с информацией о пользователе Discord
        updateFormData({
          discordUser,
          discordId: `${discordUser.username}${discordUser.discriminator !== "0" ? `#${discordUser.discriminator}` : ""}`,
        })

        // Если пользователь находится на шаге Discord, переходим к шагу успешной аутентификации
        if (currentStep === 2) {
          setCurrentStep(2.5) // Используем дробное значение для вставки шага между 2 и 3
          window.scrollTo(0, 0)
        }

        toast({
          title: "Успешная аутентификация",
          description: `Вы авторизованы как ${discordUser.username}${discordUser.discriminator !== "0" ? `#${discordUser.discriminator}` : ""}`,
        })

        // Очищаем URL от параметров, чтобы избежать повторной обработки при обновлении страницы
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/")
        }
      } catch (error) {
        console.error("Failed to parse Discord user data:", error)
        toast({
          title: "Error",
          description: "Failed to process Discord authentication data.",
          variant: "destructive",
        })
      }
    }
  }, [searchParams, toast, currentStep])

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep === 2.5) {
      setCurrentStep(3) // После шага успешной аутентификации переходим к шагу 3
    } else if (currentStep < 11) {
      setCurrentStep(currentStep + 1)
    }
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    if (currentStep === 2.5) {
      setCurrentStep(2) // Возвращаемся к шагу аутентификации
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
    window.scrollTo(0, 0)
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

  // Получаем общее количество шагов (включая дробный шаг)
  const totalSteps = 11 // 10 основных шагов + 1 дополнительный шаг успешной аутентификации

  // Преобразуем дробный шаг в целое число для индикатора шагов
  const displayStep = currentStep === 2.5 ? 3 : currentStep > 2.5 ? Math.ceil(currentStep) : currentStep

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onContinue={nextStep} />
      case 2:
        return <DiscordAuthStep onContinue={nextStep} onBack={prevStep} discordUser={formData.discordUser} />
      case 2.5: // Новый шаг для успешной аутентификации
        return formData.discordUser ? (
          <DiscordSuccessStep discordUser={formData.discordUser} onContinue={nextStep} onBack={prevStep} />
        ) : (
          // Если по какой-то причине у нас нет данных пользователя, вернемся к шагу аутентификации
          <DiscordAuthStep onContinue={nextStep} onBack={prevStep} discordUser={formData.discordUser} />
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
        return <WelcomeStep onContinue={nextStep} />
    }
  }

  return (
    <div className="w-full max-w-3xl px-4">
      <StepIndicator currentStep={displayStep} totalSteps={10} />
      <div className="mt-4 bg-[#1A202C] border border-[#E53E3E]/30 rounded-xl p-8 text-white">{renderStep()}</div>
    </div>
  )
}
