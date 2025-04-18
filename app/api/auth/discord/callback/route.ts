import { type NextRequest, NextResponse } from "next/server"

// Функция для безопасного получения переменных окружения
function getEnvVar(name: string, defaultValue = ""): string {
  const value = process.env[name]

  if (!value || value === "" || value.includes("YOUR_")) {
    console.error(`Missing or invalid environment variable: ${name}`)
    return defaultValue
  }

  return value
}

export async function GET(request: NextRequest) {
  // Получаем код из URL параметров
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  // Если Discord вернул ошибку
  if (error) {
    console.error(`Discord auth error: ${error} - ${errorDescription}`)
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || "")}`,
        request.url,
      ),
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url))
  }

  try {
    // Проверяем, что у нас есть все необходимые переменные окружения
    const clientId = getEnvVar("DISCORD_CLIENT_ID", process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "")
    const clientSecret = getEnvVar("DISCORD_CLIENT_SECRET", "")

    // Используем URL перенаправления из переменных окружения или создаем на основе текущего запроса
    const redirectUri = getEnvVar(
      "NEXT_PUBLIC_DISCORD_REDIRECT_URI",
      "http://139.59.129.132:3000/api/auth/discord/callback",
    )

    // Логирование для отладки
    console.log("DEBUG: Using Discord credentials:", {
      clientId: clientId ? `Set (length: ${clientId.length})` : "NOT SET",
      clientSecret: clientSecret ? "Set (hidden)" : "NOT SET",
      redirectUri,
    })

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("Failed to get token:", errorText)
      return NextResponse.redirect(new URL(`/?error=token_error&details=${encodeURIComponent(errorText)}`, request.url))
    }

    const tokenData = await tokenResponse.json()
    const { access_token } = tokenData

    // Получаем информацию о пользователе
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error("Failed to get user:", errorText)
      return NextResponse.redirect(new URL(`/?error=user_error&details=${encodeURIComponent(errorText)}`, request.url))
    }

    const userData = await userResponse.json()

    // Перенаправляем обратно в приложение с данными пользователя в URL
    const encodedUserData = encodeURIComponent(JSON.stringify(userData))

    // Используем базовый URL сервера для перенаправления
    const baseUrl = "http://139.59.129.132:3000"
    return NextResponse.redirect(new URL(`${baseUrl}/?discord_user=${encodedUserData}`))
  } catch (error) {
    console.error("Discord auth error:", error)
    return NextResponse.redirect(
      new URL(`/?error=server_error&details=${encodeURIComponent(String(error))}`, request.url),
    )
  }
}
