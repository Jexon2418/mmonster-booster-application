"use client"

interface TopNavigationProps {
  onBack?: () => void
  onNext: () => void
  currentStep: number
  totalSteps: number
  disableNext?: boolean
}

export function TopNavigation({ onBack, onNext, currentStep, totalSteps, disableNext = false }: TopNavigationProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      {onBack && currentStep > 1 ? (
        <button
          onClick={onBack}
          className="px-4 py-2 bg-transparent border border-[#E53E3E]/30 text-[#E53E3E] rounded-md hover:bg-[#E53E3E]/10 transition-colors"
        >
          Back
        </button>
      ) : (
        <div></div> // Empty div to maintain layout when back button is not shown
      )}

      <button
        onClick={onNext}
        disabled={disableNext}
        className="px-4 py-2 bg-[#E53E3E] text-white rounded-md hover:bg-[#E53E3E]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {currentStep === totalSteps ? "Submit" : "Next"}
      </button>
    </div>
  )
}
