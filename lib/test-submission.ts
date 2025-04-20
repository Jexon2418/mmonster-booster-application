import { createClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase client with the provided credentials or falls back to environment variables
 */
function getSupabaseClient(customUrl?: string, customKey?: string) {
  const supabaseUrl = customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = customKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials. Please provide URL and API key.")
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
    },
  })
}

/**
 * Sends a webhook notification directly from the client
 * This bypasses the need for the database http_post function
 */
async function sendWebhookNotification(
  discordId: string,
  applicationData: any,
): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_SUBMIT_URL

    if (!webhookUrl) {
      return {
        success: false,
        message: "Webhook URL is not configured",
      }
    }

    // Prepare the payload
    const payload = {
      discord_id: discordId,
      application_data: applicationData,
      status: "submitted",
      submit_timestamp: new Date().toISOString(),
    }

    // Send the webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        message: `Webhook failed with status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        },
      }
    }

    const responseData = await response.json().catch(() => ({}))

    return {
      success: true,
      message: "Webhook sent successfully",
      details: responseData,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to send webhook",
      details: {
        error: String(error),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    }
  }
}

/**
 * Test function to verify the submission process works correctly
 */
export async function testSubmission(
  discordId: string,
  customUrl?: string,
  customKey?: string,
): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    console.log(`Testing submission process for Discord ID: ${discordId}`)

    // Create Supabase client with custom credentials if provided
    const supabase = getSupabaseClient(customUrl, customKey)

    // Step 1: Check if the draft exists with retry logic
    let draftData = null
    let draftError = null

    // Try up to 3 times
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`Attempt ${attempt + 1} to fetch draft application`)
        const response = await supabase
          .from("draft_applications")
          .select("id, status, submit_count, application_data")
          .eq("discord_id", discordId)
          .maybeSingle()

        draftError = response.error
        draftData = response.data

        if (!draftError) {
          console.log("Successfully fetched draft data")
          break // Success, exit retry loop
        }

        console.log(`Attempt ${attempt + 1} failed with error:`, draftError)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
      } catch (err) {
        draftError = err
        console.error(`Fetch attempt ${attempt + 1} failed with error:`, err)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
      }
    }

    if (draftError) {
      console.error("Error checking draft after retries:", draftError)
      return {
        success: false,
        message: "Failed to check if draft exists after multiple attempts",
        details: {
          error: draftError,
          errorType: typeof draftError,
          errorMessage: draftError.message,
          errorStack: draftError.stack,
        },
      }
    }

    if (!draftData) {
      return {
        success: false,
        message: "No draft found for this Discord ID",
      }
    }

    console.log(
      `Found draft with ID: ${draftData.id}, status: ${draftData.status}, submit_count: ${draftData.submit_count || 0}`,
    )

    // Step 2: Update the draft status
    const now = new Date().toISOString()
    const newSubmitCount = (draftData.submit_count || 0) + 1

    try {
      const { data: updateData, error: updateError } = await supabase
        .from("draft_applications")
        .update({
          status: "submitted",
          submit_count: newSubmitCount,
          updated_at: now,
        })
        .eq("id", draftData.id)
        .select()

      if (updateError) {
        // Check if the error is related to the http_post function
        if (updateError.message && updateError.message.includes("http_post")) {
          console.warn("Database webhook function not available, falling back to direct webhook")

          // Continue with the process but note the issue
          const webhookResult = await sendWebhookNotification(discordId, draftData.application_data)

          return {
            success: true,
            message: "Draft marked as submitted, but database webhook failed. Sent webhook directly instead.",
            details: {
              databaseUpdate: {
                success: false,
                error: updateError,
              },
              webhook: webhookResult,
            },
          }
        }

        // For other errors, return the error
        console.error("Error updating draft:", updateError)
        return {
          success: false,
          message: "Failed to update draft status",
          details: updateError,
        }
      }

      // Step 3: Send webhook directly as a backup
      const webhookResult = await sendWebhookNotification(discordId, draftData.application_data)

      return {
        success: true,
        message: "Draft marked as submitted successfully",
        details: {
          databaseUpdate: {
            success: true,
            data: updateData,
          },
          webhook: webhookResult,
        },
      }
    } catch (updateErr) {
      console.error("Exception during update:", updateErr)
      return {
        success: false,
        message: "Exception occurred while updating draft",
        details: {
          error: String(updateErr),
          errorMessage: updateErr instanceof Error ? updateErr.message : "Unknown error",
        },
      }
    }
  } catch (error) {
    console.error("Error in testSubmission:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
      details: {
        error: String(error),
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : "No stack trace",
      },
    }
  }
}

/**
 * Reset a submitted application back to draft status for testing
 */
export async function resetSubmission(
  discordId: string,
  customUrl?: string,
  customKey?: string,
): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    console.log(`Resetting submission for Discord ID: ${discordId}`)

    // Create Supabase client with custom credentials if provided
    const supabase = getSupabaseClient(customUrl, customKey)

    // Check if the application exists with retry logic
    let appData = null
    let appError = null

    // Try up to 3 times
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`Attempt ${attempt + 1} to fetch application`)
        const response = await supabase
          .from("draft_applications")
          .select("id, status, submit_count")
          .eq("discord_id", discordId)
          .maybeSingle()

        appError = response.error
        appData = response.data

        if (!appError) {
          console.log("Successfully fetched application data")
          break // Success, exit retry loop
        }

        console.log(`Attempt ${attempt + 1} failed with error:`, appError)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
      } catch (err) {
        appError = err
        console.error(`Fetch attempt ${attempt + 1} failed with error:`, err)
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
      }
    }

    if (appError) {
      console.error("Error checking application after retries:", appError)
      return {
        success: false,
        message: "Failed to check if application exists after multiple attempts",
        details: appError,
      }
    }

    if (!appData) {
      return {
        success: false,
        message: "No application found for this Discord ID",
      }
    }

    try {
      // Reset the application status to draft
      const { data: updateData, error: updateError } = await supabase
        .from("draft_applications")
        .update({
          status: "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("id", appData.id)
        .select()

      if (updateError) {
        console.error("Error resetting application:", updateError)
        return {
          success: false,
          message: "Failed to reset application status",
          details: updateError,
        }
      }

      return {
        success: true,
        message: "Application reset to draft status successfully",
        details: updateData,
      }
    } catch (updateErr) {
      console.error("Exception during reset:", updateErr)
      return {
        success: false,
        message: "Exception occurred while resetting application",
        details: {
          error: String(updateErr),
          errorMessage: updateErr instanceof Error ? updateErr.message : "Unknown error",
        },
      }
    }
  } catch (error) {
    console.error("Error in resetSubmission:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
      details: {
        error: String(error),
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    }
  }
}
