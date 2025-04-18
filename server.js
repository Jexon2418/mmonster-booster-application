const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

// Проверяем наличие необходимых переменных окружения
const requiredEnvVars = ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET", "NEXT_PUBLIC_DISCORD_CLIENT_ID"]
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`)
  console.error("Please set these environment variables before starting the server.")
  process.exit(1)
}

// Устанавливаем дополнительные переменные окружения
process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI = "http://139.59.129.132:3000/api/auth/discord/callback"
process.env.NEXT_PUBLIC_RUNTIME_CHECK = "1"

// Логируем информацию о переменных окружения (без раскрытия секретов)
console.log("Server starting with environment variables:", {
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID
    ? `Set (${process.env.DISCORD_CLIENT_ID.substring(0, 5)}...)`
    : "NOT SET",
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET ? "Set (hidden)" : "NOT SET",
  NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    ? `Set (${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID.substring(0, 5)}...)`
    : "NOT SET",
  NEXT_PUBLIC_DISCORD_REDIRECT_URI: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || "NOT SET",
  NEXT_PUBLIC_RUNTIME_CHECK: process.env.NEXT_PUBLIC_RUNTIME_CHECK || "NOT SET",
})

const dev = process.env.NODE_ENV !== "production"
const hostname = "0.0.0.0"
const port = 3000

// Инициализируем приложение Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Разбираем URL
      const parsedUrl = parse(req.url, true)

      // Обрабатываем запрос с помощью Next.js
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("Internal Server Error")
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
