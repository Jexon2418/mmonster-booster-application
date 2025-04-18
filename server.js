const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

// Устанавливаем переменные окружения перед запуском Next.js
// Убедимся, что используем правильные значения
process.env.DISCORD_CLIENT_ID = "1362383105670774944"
process.env.DISCORD_CLIENT_SECRET = "67af0fc2ed9cf8351af7bc4a06848fa4b8ca4d229be81c7fcf164f0d2158da37"
process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID = "1362383105670774944"
process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI = "http://139.59.129.132:3000/api/auth/discord/callback"
process.env.NEXT_PUBLIC_RUNTIME_CHECK = "1"

// Добавляем отладочную информацию при запуске сервера
console.log("Starting server with Discord credentials:", {
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID
    ? `Set (length: ${process.env.DISCORD_CLIENT_ID.length})`
    : "NOT SET",
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET ? "Set (hidden)" : "NOT SET",
  NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    ? `Set (length: ${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID.length})`
    : "NOT SET",
  NEXT_PUBLIC_DISCORD_REDIRECT_URI: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || "NOT SET",
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
