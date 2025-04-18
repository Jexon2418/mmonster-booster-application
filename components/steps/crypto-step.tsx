"use client"

import { useState } from "react"
import { FormSection, FormCheckbox, FormInput } from "../ui-components"
import type { FormData } from "../booster-application-form"

interface CryptoStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onSubmit: () => void
  onBack: () => void
  isSubmitting?: boolean
}

export function CryptoStep({ formData, updateFormData, onSubmit, onBack, isSubmitting = false }: CryptoStepProps) {
  const [acceptCrypto, setAcceptCrypto] = useState(formData.acceptCrypto)
  const [cryptoWallet, setCryptoWallet] = useState(formData.cryptoWallet)

  const handleSubmit = () => {
    updateFormData({ acceptCrypto, cryptoWallet })
    onSubmit()
  }

  return (
    <FormSection
      title="Payment Details"
      description="Since completing orders involves payments for your work, we need to clarify a few points related to payouts."
    >
      <div className="mt-6 space-y-6">
        <FormCheckbox
          id="accept-crypto"
          label={
            <span>
              Crypto Payouts Agreement <span className="text-[#E53E3E]">*</span>
            </span>
          }
          checked={acceptCrypto}
          onChange={setAcceptCrypto}
          required
        />
        <p className="text-gray-400 text-sm ml-8">
          We process payments exclusively via cryptocurrency (USDT) using the TRC-20 network or via Binance ID. Please
          confirm that you can receive payments in USDT cryptocurrency.
        </p>

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
          onClick={handleSubmit}
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
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </button>
        {onBack && (
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-transparent border border-[#E53E3E]/30 text-[#E53E3E] rounded-md hover:bg-[#E53E3E]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous Step
          </button>
        )}
      </div>
    </FormSection>
  )
}
