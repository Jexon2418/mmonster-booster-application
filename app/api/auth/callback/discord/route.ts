import { NextResponse } from "next/server"
import { DISCORD_CONFIG } from "@/lib/env"

export async function GET(request: Request) {
  // Get the code from the URL query parameters
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  // Get the host from the request headers
  const host = request.headers.get("host") || ""
  const protocol = host.includes("localhost") || host.includes("0.0.0.0") ? "http" : "https"

  // Construct the base URL
  const baseUrl = `${protocol}://${host}`

  if (!code) {
    console.error("Missing authorization code from Discord")
    return NextResponse.redirect(`${baseUrl}/?error=missing_code`)
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CONFIG.CLIENT_ID!,
        client_secret: DISCORD_CONFIG.CLIENT_SECRET!,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: DISCORD_CONFIG.REDIRECT_URI!,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Failed to exchange code for token:", errorData)
      return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent("Failed to authenticate with Discord")}`)
    }

    const tokenData = await tokenResponse.json()
    console.log("Successfully obtained Discord access token")

    // Use the access token to fetch the user's profile
    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      const errorData = await userResponse.text()
      console.error("Failed to fetch Discord user:", errorData)
      return NextResponse.redirect(`${baseUrl}/?error=${encodeURIComponent("Failed to fetch Discord user data")}`)
    }

    const userData = await userResponse.json()
    console.log("Successfully fetched Discord user data")

    // Format the user data
    const formattedUserData = {
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator || "0",
      avatar: userData.avatar,
      email: userData.email,
      fullDiscordTag: userData.discriminator ? `${userData.username}#${userData.discriminator}` : userData.username,
    }

    // Encode the user data to pass it in the URL
    const encodedUserData = encodeURIComponent(JSON.stringify(formattedUserData))

    // Redirect back to the application with the user data
    return NextResponse.redirect(`${baseUrl}/?discord_user=${encodedUserData}`)
  } catch (error) {
    console.error("Error handling Discord callback:", error)
    return NextResponse.redirect(`${baseUrl}/?error=server_error`)
  }
}
