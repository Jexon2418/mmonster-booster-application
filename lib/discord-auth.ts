// Type for Discord user data
export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
}

// Scopes we request
const SCOPES = ["identify", "email"]

// Create authentication URL with verification
export function getDiscordAuthUrl(state?: string) {
  // Use hardcoded values for client-side
  const clientId = "1362383105670774944" // Hardcoded client ID
  const redirectUri = "http://139.59.129.132:3000/api/auth/discord/callback" // Hardcoded redirect URI

  console.log("Using Discord auth with:", { clientId, redirectUri })

  // Check that Client ID is not empty
  if (!clientId) {
    console.error("Discord Client ID is not properly set")
    throw new Error("Discord Client ID is not properly configured")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
  })

  if (state) {
    params.append("state", state)
  }

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`
}
