# Mmonster.co Booster Application Form

## Environment Variables Setup

The application requires the following environment variables:

\`\`\`
DISCORD_CLIENT_SECRET=your_discord_client_secret
\`\`\`

The following values are hardcoded in the application:
\`\`\`
DISCORD_CLIENT_ID=1362383105670774944
NEXT_PUBLIC_DISCORD_CLIENT_ID=1362383105670774944
NEXT_PUBLIC_DISCORD_REDIRECT_URI=http://139.59.129.132:3000/api/auth/discord/callback
NEXT_PUBLIC_RUNTIME_CHECK=1
\`\`\`

## Running the Application

\`\`\`bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the application
npm start
\`\`\`

## Troubleshooting Discord OAuth2

If you encounter issues with Discord authentication:

1. Make sure the environment variables are set correctly
2. Verify that the redirect URL in Discord Developer Portal matches `http://139.59.129.132:3000/api/auth/discord/callback`
3. Check server logs for additional error information
\`\`\`


```plaintext file=".env.example"
# Discord OAuth Credentials
DISCORD_CLIENT_SECRET=your_discord_client_secret

# n8n webhook (optional)
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
