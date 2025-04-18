interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex justify-center space-x-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step <= currentStep ? "bg-[#E53E3E] text-white" : "bg-gray-600 text-gray-300"
          } ${step === currentStep ? "ring-2 ring-[#E53E3E]/50" : ""}`}
        >
          {step < currentStep ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            step
          )}
        </div>
      ))}
    </div>
  )
}
