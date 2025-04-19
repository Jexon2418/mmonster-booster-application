// Environment variable configuration with validation

// Discord OAuth configuration
export const DISCORD_CONFIG = {
  CLIENT_ID: process.env.DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
  CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  // Use the environment variable for redirect URI
  REDIRECT_URI: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || "https://apply.mmonster.co/api/auth/callback/discord",
}

// Discord webhook configuration
export const WEBHOOK_CONFIG = {
  DISCORD_AUTH:
    process.env.WEBHOOK_DISCORD_AUTH || "https://javesai.app.n8n.cloud/webhook/7c27a787-36b2-4e01-a154-973ccd8d1ae9",
}

// Validate required environment variables
export function validateEnv() {
  const missingVars = []

  if (!DISCORD_CONFIG.CLIENT_ID) missingVars.push("DISCORD_CLIENT_ID or NEXT_PUBLIC_DISCORD_CLIENT_ID")
  if (!DISCORD_CONFIG.CLIENT_SECRET) missingVars.push("DISCORD_CLIENT_SECRET")
  if (!DISCORD_CONFIG.REDIRECT_URI) missingVars.push("NEXT_PUBLIC_DISCORD_REDIRECT_URI")

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(", ")}`)
    return false
  }

  return true
}
