import { type NextRequest, NextResponse } from "next/server"

// Функция для безопасного получения переменных окружения
function getEnvVar(name: string): string {
  const value = process.env[name]

  if (!value || value === "") {
    throw new Error(`Missing required environment variable: ${name}`)
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
        "http://139.59.129.132:3000",
      ),
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", "http://139.59.129.132:3000"))
  }

  try {
    // Получаем переменные окружения
    const clientId = getEnvVar("DISCORD_CLIENT_ID")
    const clientSecret = getEnvVar("DISCORD_CLIENT_SECRET")
    const redirectUri = "http://139.59.129.132:3000/api/auth/discord/callback"

    // Логирование для отладки (без раскрытия секретов)
    console.log("DEBUG: Using Discord credentials:", {
      clientId: `${clientId.substring(0, 5)}...`,
      clientSecret: "Hidden for security",
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
      return NextResponse.redirect(
        new URL(`/?error=token_error&details=${encodeURIComponent(errorText)}`, "http://139.59.129.132:3000"),
      )
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
      return NextResponse.redirect(
        new URL(`/?error=user_error&details=${encodeURIComponent(errorText)}`, "http://139.59.129.132:3000"),
      )
    }

    const userData = await userResponse.json()

    // Перенаправляем обратно в приложение с данными пользователя в URL
    const encodedUserData = encodeURIComponent(JSON.stringify(userData))

    // ВАЖНО: Используем жестко закодированный URL вашего сервера
    return NextResponse.redirect(new URL(`/?discord_user=${encodedUserData}`, "http://139.59.129.132:3000"))
  } catch (error) {
    console.error("Discord auth error:", error)
    return NextResponse.redirect(
      new URL(`/?error=server_error&details=${encodeURIComponent(String(error))}`, "http://139.59.129.132:3000"),
    )
  }
}
