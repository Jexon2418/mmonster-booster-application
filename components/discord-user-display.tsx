"use client"
import Image from "next/image"
import type { DiscordUser } from "./booster-application-form"

interface DiscordUserDisplayProps {
  user: DiscordUser | null
  onLogout: () => void
}

export function DiscordUserDisplay({ user, onLogout }: DiscordUserDisplayProps) {
  if (!user) return null

  // Function to generate Discord avatar URL
  const getAvatarUrl = () => {
    if (!user.avatar) {
      // Default Discord avatar
      const defaultAvatarNumber = Number.parseInt(user.discriminator || "0") % 5
      return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
    }

    // Custom avatar
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
  }

  return (
    <div className="flex items-center justify-end mb-4 bg-[#1A202C] p-2 rounded-md shadow-md">
      <div className="flex items-center">
        <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 border-2 border-[#5865F2]">
          <Image src={getAvatarUrl() || "/placeholder.svg"} alt="Discord Avatar" fill className="object-cover" />
        </div>
        <span className="text-white text-sm mr-3 hidden sm:inline">
          {user.username}
          {user.discriminator && user.discriminator !== "0" && (
            <span className="text-gray-400">#{user.discriminator}</span>
          )}
        </span>
        <button
          onClick={onLogout}
          className="text-xs text-[#E53E3E] hover:text-[#E53E3E]/80 transition-colors px-2 py-1 rounded hover:bg-[#E53E3E]/10"
          aria-label="Logout from Discord"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
