// Environment variable configuration with validation

// Discord OAuth configuration
export const DISCORD_CONFIG = {
  CLIENT_ID: process.env.DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
  CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  REDIRECT_URI: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || "https://gamerxt.com/api/auth/callback/discord",
}

// N8N webhook configuration
export const N8N_CONFIG = {
  WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
}

// Validate required environment variables
export function validateEnv() {
  const missingVars = []

  if (!DISCORD_CONFIG.CLIENT_ID) missingVars.push("DISCORD_CLIENT_ID or NEXT_PUBLIC_DISCORD_CLIENT_ID")
  if (!DISCORD_CONFIG.CLIENT_SECRET) missingVars.push("DISCORD_CLIENT_SECRET")

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(", ")}`)
    return false
  }

  return true
}
