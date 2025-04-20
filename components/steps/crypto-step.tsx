"use client"

import { useState } from "react"
import { FormSection, FormCheckbox, FormInput } from "../ui-components"
import { Card } from "@/components/ui/card"
import type { FormData } from "../booster-application-form"

interface CryptoStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onContinue: () => void
  onBack: () => void
  isSubmitting?: boolean
}

export function CryptoStep({ formData, updateFormData, onContinue, onBack, isSubmitting = false }: CryptoStepProps) {
  const [acceptCrypto, setAcceptCrypto] = useState(formData.acceptCrypto)
  const [cryptoWallet, setCryptoWallet] = useState(formData.cryptoWallet)

  const handleContinue = () => {
    updateFormData({ acceptCrypto, cryptoWallet })
    onContinue()
  }

  return (
    <FormSection
      title="Payment Details"
      description="Since completing orders involves payments for your work, we need to clarify a few points related to payouts."
    >
      <div className="mt-6 space-y-6">
        <Card className="border border-[#E53E3E]/30 bg-[#1E2533]">
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <FormCheckbox
                id="accept-crypto"
                label={
                  <span className="font-medium">
                    Crypto Payouts Agreement <span className="text-[#E53E3E]">*</span>
                  </span>
                }
                checked={acceptCrypto}
                onChange={setAcceptCrypto}
                required
              />
            </div>
            <p className="text-gray-400 text-sm mt-3 ml-8">
              We process payments exclusively via cryptocurrency (USDT) using the TRC-20 network or via Binance ID.
              Please confirm that you can receive payments in USDT cryptocurrency.
            </p>
          </div>
        </Card>

        <div className="mt-4">
          <h3 className="text-white mb-2">Crypto Wallet (optional)</h3>
          <p className="text-gray-400 text-sm mb-4">
            Please provide your TRC-20 USDT wallet address or Binance ID for receiving payments. You can update this
            information in the future or skip this step for now.
          </p>
          <FormInput
            id="crypto-wallet"
            label=""
            placeholder="TRC-20 USDT Wallet or Binance ID"
            value={cryptoWallet}
            onChange={(e) => setCryptoWallet(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <button
          onClick={handleContinue}
          disabled={!acceptCrypto || isSubmitting}
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
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </FormSection>
  )
}
