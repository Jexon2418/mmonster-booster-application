// Тип для данных пользователя Discord
export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
}

// Функция для безопасного получения переменных окружения
function getEnvVar(name: string, defaultValue = ""): string {
  // Проверяем, что мы находимся в браузере или на сервере во время выполнения
  if (typeof window !== "undefined" || process.env.NEXT_PUBLIC_RUNTIME_CHECK === "1") {
    const value = process.env[name]

    if (!value || value === "" || value.includes("YOUR_")) {
      console.error(`Missing or invalid environment variable: ${name}`)
      return defaultValue
    }

    return value
  }

  // Во время сборки возвращаем пустую строку или значение по умолчанию
  return defaultValue
}

// Области доступа, которые мы запрашиваем
const SCOPES = ["identify", "email"]

// Создаем URL для аутентификации с проверкой
export function getDiscordAuthUrl(state?: string) {
  // Получаем переменные окружения только во время выполнения
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "1362383105670774944"

  // Используем фиксированный URL перенаправления для вашего сервера
  const redirectUri = "http://139.59.129.132:3000/api/auth/discord/callback"

  console.log("Using Discord auth with:", { clientId, redirectUri })

  // Проверяем, что Client ID не пустой
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
