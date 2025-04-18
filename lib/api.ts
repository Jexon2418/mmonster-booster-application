export async function submitBoosterApplication(formData: any) {
  try {
    // Замените URL на ваш n8n webhook URL
    const n8nWebhookUrl =
      process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://your-n8n-instance.com/webhook/booster-application"

    const response = await fetch(n8nWebhookUrl, {
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
