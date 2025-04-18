const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

// Check for required environment variables
const requiredEnvVars = ["DISCORD_CLIENT_SECRET"]
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`)
  console.error("Please set these environment variables before starting the server.")
  process.exit(1)
}

// Set additional environment variables
// We're using hardcoded values for client ID and redirect URI
process.env.DISCORD_CLIENT_ID = "1362383105670774944"
process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID = "1362383105670774944"
process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI = "http://139.59.129.132:3000/api/auth/discord/callback"
process.env.NEXT_PUBLIC_RUNTIME_CHECK = "1"

// Log information about environment variables (without revealing secrets)
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

// Initialize Next.js application
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url, true)

      // Handle request with Next.js
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
