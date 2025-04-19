// Удаляем директиву "use server", так как она вызывает проблемы
// "use server"

import { DISCORD_CONFIG, validateEnv } from "./env"

// Экспортируем DISCORD_CONFIG для использования в других файлах
export { DISCORD_CONFIG }

// Discord API endpoints
const DISCORD_API_URL = "https://discord.com/api/v10"
const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize`
const DISCORD_TOKEN_URL = `${DISCORD_API_URL}/oauth2/token`
const DISCORD_USER_URL = `${DISCORD_API_URL}/users/@me`

// Scopes needed for our application
const SCOPES = ["identify", "email"].join(" ")

/**
 * Generates the Discord OAuth2 authorization URL
 * @returns The URL to redirect the user to for Discord authentication
 */
export async function getDiscordAuthUrl() {
  // Validate environment variables
  const isValid = validateEnv()
  if (!isValid) {
    throw new Error("Missing required Discord configuration. Please check your environment variables.")
  }

  // Add a state parameter for CSRF protection
  const state = Math.random().toString(36).substring(2, 15)

  // Log the redirect URI being used
  console.log("Using Discord redirect URI:", DISCORD_CONFIG.REDIRECT_URI)

  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.CLIENT_ID!,
    redirect_uri: DISCORD_CONFIG.REDIRECT_URI!,
    response_type: "code",
    scope: SCOPES,
    state: state,
  })

  return `${DISCORD_AUTH_URL}?${params.toString()}`
}
