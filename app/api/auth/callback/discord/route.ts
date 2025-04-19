import { NextResponse } from "next/server"
import { DISCORD_CONFIG } from "@/lib/env"

export async function GET(request: Request) {
  console.log("=== DISCORD CALLBACK STARTED (App Router - API Route) ===")
  console.log("Route: /api/auth/callback/discord")
  console.log("Request URL:", request.url)

  // Get the code from the URL query parameters
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  // Get the host from the request headers
  const host = request.headers.get("host") || ""
  const protocol = host.includes("localhost") || host.includes("0.0.0.0") ? "http" : "https"

  // Construct the base URL
  const baseUrl = `${protocol}://${host}`
  console.log(`Base URL: ${baseUrl}`)

  if (!code) {
    console.error("Missing authorization code from Discord")
    return NextResponse.redirect(`${baseUrl}/?error=missing_code`)
  }

  try {
    console.log("Exchanging code for token...")
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
    console.log("Fetching user profile...")
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
    console.log("Fetched user info:", JSON.stringify(userData))

    // WEBHOOK SECTION - Send webhook with Discord user data
    console.log("=== SENDING WEBHOOK - START ===")

    // Get webhook URL from environment variable or use hardcoded fallback
    const webhookUrl =
      process.env.WEBHOOK_DISCORD_AUTH ||
      "https://javesai.app.n8n.cloud/webhook-test/7c27a787-36b2-4e01-a154-973ccd8d1ae9"
    console.log(`Webhook URL: ${webhookUrl}`)

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
      timestamp: new Date().toISOString(),
      source: "api_route_callback",
    }

    console.log("Webhook payload:", JSON.stringify(webhookPayload))

    // Send the webhook in a separate try-catch to not affect the main flow
    try {
      console.log("Sending webhook request...")

      // Use a simple fetch with no fancy options
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      })

      const responseText = await webhookResponse.text()

      if (webhookResponse.ok) {
        console.log(`Webhook sent successfully! Status: ${webhookResponse.status}`)
        console.log(`Response: ${responseText}`)
      } else {
        console.error(`Webhook failed! Status: ${webhookResponse.status}`)
        console.error(`Error response: ${responseText}`)
      }
    } catch (webhookError) {
      console.error("Webhook error:", webhookError)
    }

    console.log("=== SENDING WEBHOOK - END ===")
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
    console.log("Redirecting with user data...")

    // Add a small delay to ensure webhook has time to complete
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Redirect back to the application with the user data
    return NextResponse.redirect(`${baseUrl}/?discord_user=${encodedUserData}`)
  } catch (error) {
    console.error("Error handling Discord callback:", error)
    return NextResponse.redirect(`${baseUrl}/?error=server_error`)
  }
}
