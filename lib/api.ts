export async function submitBoosterApplication(formData: any) {
  try {
    // Use the webhook URL directly from the environment variable
    const webhookUrl = process.env.WEBHOOK_DISCORD_AUTH

    if (!webhookUrl) {
      throw new Error("Webhook URL is not configured")
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error submitting application:", error)
    throw error
  }
}
