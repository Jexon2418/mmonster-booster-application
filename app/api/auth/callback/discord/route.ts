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

    // WEBHOOK SECTION - Send webhook with Discord user data
    // Get webhook URL from environment variable or use production URL
    const webhookUrl =
      process.env.WEBHOOK_DISCORD_AUTH || "https://javesai.app.n8n.cloud/webhook/7c27a787-36b2-4e01-a154-973ccd8d1ae9"

    // Construct the avatar URL
    const avatarUrl = userData.avatar
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${Number.parseInt(userData.discriminator || "0") % 5}.png`

    // Prepare the payload
    const webhookPayload = {
      discord_id: userData.id,
      discord_username: userData.username,
      discord_email: userData.email || "",
      discord_avatar_url: avatarUrl || "",
    }

    // Send the webhook in a separate try-catch to not affect the main flow
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      })
    } catch (webhookError) {
      console.error("Webhook error:", webhookError)
    }
    // END WEBHOOK SECTION

    // Format the user data for the redirect
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

    // Add a small delay to ensure webhook has time to complete
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Redirect back to the application with the user data
    return NextResponse.redirect(`${baseUrl}/?discord_user=${encodedUserData}`)
  } catch (error) {
    console.error("Error handling Discord callback:", error)
    return NextResponse.redirect(`${baseUrl}/?error=server_error`)
  }
}
