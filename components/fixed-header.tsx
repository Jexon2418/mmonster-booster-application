"use client"

import Image from "next/image"
import type { DiscordUser } from "./booster-application-form"

interface FixedHeaderProps {
  user: DiscordUser | null
  onLogout?: () => void
  onLogin?: () => void
  isLoginStep?: boolean
}

export function FixedHeader({ user, onLogout, onLogin, isLoginStep = false }: FixedHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#1A202C] border-b border-[#4A5568] z-50">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-6 h-6 relative mr-2">
            <Image
              src="https://mmonster.co/media/b7/b3/58/1729440457/mmonster_letter.svg"
              alt="MMOnster Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <div className="text-white font-semibold">MmonsteR Booster Application</div>
        </div>

        {isLoginStep ? (
          <button onClick={onLogin} className="text-[#5865F2] hover:text-[#5865F2]/80 transition-colors text-sm">
            Login with Discord
          </button>
        ) : user ? (
          <div className="flex items-center">
            <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2 border border-[#5865F2]">
              <Image
                src={getAvatarUrl(user) || "/placeholder.svg"}
                alt="Discord Avatar"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-white text-sm mr-3 hidden sm:inline">
              {user.username}
              {/* Только показываем дискриминатор, если он существует и не равен "0" */}
              {user.discriminator && user.discriminator !== "0" && (
                <span className="text-gray-400">#{user.discriminator}</span>
              )}
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-xs text-[#E53E3E] hover:text-[#E53E3E]/80 transition-colors px-2 py-1 rounded hover:bg-[#E53E3E]/10"
                aria-label="Logout from Discord"
              >
                Logout
              </button>
            )}
          </div>
        ) : null}
      </div>
    </header>
  )
}

// Function to generate Discord avatar URL
function getAvatarUrl(user: DiscordUser | null): string {
  if (!user?.avatar) {
    // Default Discord avatar
    const defaultAvatarNumber = Number.parseInt(user?.discriminator || "0") % 5
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
  }

  // Custom avatar
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
}
