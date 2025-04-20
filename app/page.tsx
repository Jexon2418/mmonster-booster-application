"use client"

import { Suspense, useEffect, useState } from "react"
import BoosterApplicationForm from "@/components/booster-application-form"
import { useSearchParams } from "next/navigation"

export default function Home() {
  const [isDiscordCallback, setIsDiscordCallback] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if there's a code parameter in URL, indicating return from Discord OAuth
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (code && state) {
      console.log("Detected Discord OAuth callback with code and state")
      setIsDiscordCallback(true)

      // Clean URL from OAuth parameters without page reload
      const url = new URL(window.location.href)
      url.searchParams.delete("code")
      url.searchParams.delete("state")
      window.history.replaceState({}, document.title, url.toString())
    }
  }, [searchParams])

  return (
    <main className="min-h-screen bg-[#171923] flex flex-col items-center">
      <div className="pt-16 pb-8 w-full flex justify-center">
        <Suspense fallback={<LoadingState />}>
          <BoosterApplicationForm initialDiscordCallback={isDiscordCallback} />
        </Suspense>
      </div>
    </main>
  )
}

// Update the LoadingState component to reflect the new total steps
function LoadingState() {
  return (
    <div className="w-full max-w-3xl px-4">
      <div className="flex justify-center space-x-2 overflow-x-auto py-2">
        {Array.from({ length: 11 }, (_, i) => (
          <div key={i} className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 text-gray-300">
            {i + 1}
          </div>
        ))}
      </div>
      <div className="mt-4 bg-[#1A202C] border border-[#E53E3E]/30 rounded-xl p-8 text-white min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-[#E53E3E] mb-4"
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
          <p className="text-gray-400">Loading application form...</p>
        </div>
      </div>
    </div>
  )
}
