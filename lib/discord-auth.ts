"use server"

// Discord OAuth2 configuration
const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!
const DISCORD_REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI!

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
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: SCOPES,
  })

  return `${DISCORD_AUTH_URL}?${params.toString()}`
}

/**
 * Exchanges an authorization code for an access token
 * @param code The authorization code from Discord
 * @returns The access token and related information
 */
async function exchangeCodeForToken(code: string) {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: DISCORD_REDIRECT_URI,
  })

  const response = await fetch(DISCORD_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to exchange code for token: ${JSON.stringify(error)}`)
  }

  return response.json()
}

/**
 * Fetches the user's Discord profile information
 * @param accessToken The Discord access token
 * @returns The user's Discord profile
 */
async function fetchDiscordUser(accessToken: string) {
  const response = await fetch(DISCORD_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to fetch Discord user: ${JSON.stringify(error)}`)
  }

  return response.json()
}

/**
 * Handles the OAuth2 callback from Discord
 * @param code The authorization code from Discord
 * @returns The user's Discord profile information
 */
export async function handleDiscordCallback(code: string) {
  try {
    // Exchange the code for an access token
    const tokenData = await exchangeCodeForToken(code)

    // Use the access token to fetch the user's profile
    const userData = await fetchDiscordUser(tokenData.access_token)

    return {
      success: true,
      user: {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        email: userData.email,
        fullDiscordTag: `${userData.username}#${userData.discriminator || "0000"}`,
      },
    }
  } catch (error) {
    console.error("Discord authentication error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during Discord authentication",
    }
  }
}
