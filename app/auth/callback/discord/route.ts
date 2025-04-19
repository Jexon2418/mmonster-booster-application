import { redirect } from "next/navigation"
import { handleDiscordCallback } from "@/lib/discord-auth"

export async function GET(request: Request) {
  // Get the code from the URL query parameters
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")

  if (!code) {
    // If there's no code, redirect to the form with an error
    redirect("/?error=missing_code")
  }

  try {
    // Process the Discord callback
    const result = await handleDiscordCallback(code)

    if (result.success) {
      // Store the Discord user data in a cookie or session
      // For simplicity, we'll use URL parameters, but in a production app
      // you should use a more secure method like cookies or server sessions
      const userData = encodeURIComponent(JSON.stringify(result.user))
      redirect(`/?discord_user=${userData}`)
    } else {
      // If there was an error, redirect with the error message
      redirect(`/?error=${encodeURIComponent(result.error || "unknown_error")}`)
    }
  } catch (error) {
    console.error("Error handling Discord callback:", error)
    redirect("/?error=server_error")
  }
}
