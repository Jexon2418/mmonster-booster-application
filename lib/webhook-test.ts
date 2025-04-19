/**
 * A standalone function to test the webhook functionality
 * This can be called from anywhere to verify the webhook is working
 */
export async function testDiscordWebhook() {
  console.log("=== TESTING WEBHOOK DIRECTLY ===")

  const webhookUrl = "https://javesai.app.n8n.cloud/webhook-test/7c27a787-36b2-4e01-a154-973ccd8d1ae9"
  console.log(`Webhook URL: ${webhookUrl}`)

  // Test payload
  const testPayload = {
    discord_id: "test_" + Date.now(),
    discord_username: "TestUser_" + Math.floor(Math.random() * 1000),
    discord_email: "test@example.com",
    discord_avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
  }

  console.log("Test payload:", JSON.stringify(testPayload))

  try {
    console.log("Sending test webhook request...")

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    })

    const responseText = await response.text()

    if (response.ok) {
      console.log(`Test webhook sent successfully! Status: ${response.status}`)
      console.log(`Response: ${responseText}`)
      return { success: true, message: "Webhook sent successfully" }
    } else {
      console.error(`Test webhook failed! Status: ${response.status}`)
      console.error(`Error response: ${responseText}`)
      return { success: false, message: `Failed with status ${response.status}: ${responseText}` }
    }
  } catch (error) {
    console.error("Test webhook error:", error)
    return { success: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` }
  }
}
