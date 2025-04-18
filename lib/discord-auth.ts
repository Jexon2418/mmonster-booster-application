// Тип для данных пользователя Discord
export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
}

// Области доступа, которые мы запрашиваем
const SCOPES = ["identify", "email"]

// Создаем URL для аутентификации с проверкой
export function getDiscordAuthUrl(state?: string) {
  // Получаем переменные окружения только во время выполнения
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID

  if (!clientId) {
    console.error("Discord Client ID is not properly set")
    throw new Error("Discord Client ID is not properly configured")
  }

  // Используем фиксированный URL перенаправления для вашего сервера
  const redirectUri = "http://139.59.129.132:3000/api/auth/discord/callback"

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
