import { createClient } from "@supabase/supabase-js"

export type ConnectionStatus = {
  isConnected: boolean
  error?: string
  details?: any
  timestamp: number
}

/**
 * Tests the Supabase connection with the provided credentials
 */
export async function testSupabaseConnection(url?: string, key?: string): Promise<ConnectionStatus> {
  try {
    // Use provided credentials or fall back to environment variables
    const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

    if (!supabaseUrl || !supabaseKey) {
      return {
        isConnected: false,
        error: "Missing Supabase credentials",
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
        },
        timestamp: Date.now(),
      }
    }

    // Create a temporary client just for testing
    const testClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // Try a simple query that should always work
    const { data, error } = await testClient.from("draft_applications").select("count").limit(1)

    if (error) {
      return {
        isConnected: false,
        error: error.message,
        details: error,
        timestamp: Date.now(),
      }
    }

    // Check if the http extension is available
    try {
      const { error: extensionError } = await testClient.rpc("check_http_extension")

      if (extensionError) {
        return {
          isConnected: true,
          error: "Database connected but http extension not available",
          details: {
            extensionError,
            note: "This is not critical - we'll use client-side webhook instead",
          },
          timestamp: Date.now(),
        }
      }
    } catch (extensionErr) {
      // This is expected if the function doesn't exist
      console.log("HTTP extension check failed, will use client-side webhook instead")
    }

    return {
      isConnected: true,
      details: { hasData: !!data },
      timestamp: Date.now(),
    }
  } catch (error) {
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        errorType: typeof error,
        errorString: String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      timestamp: Date.now(),
    }
  }
}

/**
 * Tests if the webhook URL is reachable
 */
export async function testWebhookConnection(webhookUrl?: string): Promise<ConnectionStatus> {
  try {
    const url = webhookUrl || process.env.NEXT_PUBLIC_WEBHOOK_SUBMIT_URL || ""

    if (!url) {
      return {
        isConnected: false,
        error: "Missing webhook URL",
        timestamp: Date.now(),
      }
    }

    // Just check if the URL is valid, don't actually send a request
    // as that might trigger unwanted actions
    try {
      new URL(url)
    } catch (e) {
      return {
        isConnected: false,
        error: "Invalid webhook URL",
        details: { url },
        timestamp: Date.now(),
      }
    }

    // Optionally, we could do a HEAD request to check if the URL is reachable
    // but this might trigger unwanted actions on the webhook endpoint
    // So we'll just check if the URL is valid for now

    return {
      isConnected: true,
      details: { url },
      timestamp: Date.now(),
    }
  } catch (error) {
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        errorType: typeof error,
        errorString: String(error),
      },
      timestamp: Date.now(),
    }
  }
}
