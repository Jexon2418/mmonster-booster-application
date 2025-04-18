"use client"

import { useState, useRef, useEffect } from "react"
import { FormSection, FormButtons, GameTag } from "../ui-components"
import { Checkbox } from "@/components/ui/checkbox"
import type { FormData } from "../booster-application-form"

interface GamesStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onContinue: () => void
  onBack: () => void
}

// Sample list of games
const GAMES_LIST = [
  "Albion Online",
  "Arena Breakout: Infinite",
  "Ashes of Creation",
  "Black Desert Online",
  "Battlefield 2042",
  "Call of Duty: VANGUARD",
  "Clash of Clans",
  "College Football 25",
  "Counter-Strike 2",
  "Diablo 4",
  "Dota 2",
  "Escape from Tarkov",
  "Final Fantasy XIV",
  "Fortnite",
  "League of Legends",
  "Lost Ark",
  "New World",
  "Overwatch 2",
  "Path of Exile",
  "PUBG: BATTLEGROUNDS",
  "Rocket League",
  "Rust",
  "Valorant",
  "World of Warcraft",
]

export function GamesStep({ formData, updateFormData, onContinue, onBack }: GamesStepProps) {
  const [selectedGames, setSelectedGames] = useState<string[]>(formData.games)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter games based on search term only, not on selection status
  const filteredGames = GAMES_LIST.filter((game) => game.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleGameToggle = (game: string) => {
    setSelectedGames((prev) => {
      if (prev.includes(game)) {
        return prev.filter((g) => g !== game)
      } else {
        return [...prev, game]
      }
    })
  }

  const handleGameRemove = (game: string) => {
    setSelectedGames(selectedGames.filter((g) => g !== game))
  }

  const handleContinue = () => {
    updateFormData({ games: selectedGames })
    onContinue()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <FormSection
      title="Games Selection"
      description="Please select the main games you work in. This won't limit the games you can get orders for, we just need this information to review your application."
    >
      <div className="mt-6 space-y-4">
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center justify-between w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{selectedGames.length} games selected</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${isDropdownOpen ? "transform rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-[#2D3748] border border-[#4A5568] rounded-md shadow-lg max-h-96 overflow-auto">
              <div className="sticky top-0 bg-[#2D3748] p-2 z-10 border-b border-[#4A5568]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search games..."
                  className="w-full px-3 py-2 bg-[#1A202C] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
                />
              </div>
              <div className="py-1">
                {filteredGames.length > 0 ? (
                  filteredGames.map((game) => (
                    <div
                      key={game}
                      className="flex items-center px-4 py-3 hover:bg-[#4A5568] cursor-pointer text-white"
                      onClick={() => handleGameToggle(game)}
                    >
                      <Checkbox
                        checked={selectedGames.includes(game)}
                        onCheckedChange={() => handleGameToggle(game)}
                        className="mr-3 data-[state=checked]:bg-[#E53E3E] data-[state=checked]:border-[#E53E3E] border-[#4A5568]"
                      />
                      <span>{game}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-400">No games found</div>
                )}
              </div>
              <div className="sticky bottom-0 bg-[#2D3748] p-2 border-t border-[#4A5568]">
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full py-2 bg-[#E53E3E] text-white rounded-md hover:bg-[#E53E3E]/90 transition-colors"
                >
                  Done ({selectedGames.length} selected)
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          {selectedGames.map((game) => (
            <GameTag key={game} name={game} onRemove={() => handleGameRemove(game)} />
          ))}
        </div>
      </div>

      <FormButtons onContinue={handleContinue} onBack={onBack} disabled={selectedGames.length === 0} />
    </FormSection>
  )
}
