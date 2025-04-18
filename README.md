# Mmonster.co Booster Application Form

## Настройка переменных окружения

Для работы приложения необходимы следующие переменные окружения:

\`\`\`
DISCORD_CLIENT_ID=ваш_discord_client_id
DISCORD_CLIENT_SECRET=ваш_discord_client_secret
NEXT_PUBLIC_DISCORD_CLIENT_ID=ваш_discord_client_id
NEXT_PUBLIC_DISCORD_REDIRECT_URI=http://139.59.129.132:3000/api/auth/discord/callback
NEXT_PUBLIC_RUNTIME_CHECK=1
\`\`\`

## Запуск приложения

\`\`\`bash
# Установка зависимостей
npm install

# Сборка приложения
npm run build

# Запуск приложения
npm start
\`\`\`

## Устранение проблем с Discord OAuth2

Если возникают проблемы с аутентификацией Discord:

1. Убедитесь, что переменные окружения установлены правильно
2. Проверьте, что URL перенаправления в Discord Developer Portal соответствует `http://139.59.129.132:3000/api/auth/discord/callback`
3. Проверьте логи сервера для получения дополнительной информации об ошибках
\`\`\`


```plaintext file=".env.example"
# Discord OAuth Credentials
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
NEXT_PUBLIC_DISCORD_REDIRECT_URI=http://139.59.129.132:3000/api/auth/discord/callback

# Runtime check
NEXT_PUBLIC_RUNTIME_CHECK=1

# n8n webhook
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
