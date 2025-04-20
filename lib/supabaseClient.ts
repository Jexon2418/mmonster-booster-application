import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vaepzzldbinkjaaqxfpk.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if the environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env.local file.")
}

// Create a Supabase client with better error handling
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => {
      return fetch(...args)
    },
  },
})

// Log connection status on initialization (for debugging)
;(async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error("Supabase connection error:", error)
    } else {
      console.log("Supabase connection established", data ? "with session" : "anonymously")
    }
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err)
  }
})()

// Type definition for draft applications
export type DraftApplication = {
  id?: number
  discord_id: string
  email: string | null
  application_data: any
  status: "draft" | "submitted"
  submit_count: number
  created_at?: string
  updated_at?: string
}

/**
 * Saves or updates a draft application in Supabase
 */
export async function saveDraftToSupabase(
  discordId: string,
  email: string | null,
  applicationData: any,
): Promise<boolean> {
  try {
    if (!discordId) {
      console.error("Cannot save draft: Discord ID is missing")
      return false
    }

    // Remove circular references and non-serializable data
    const cleanedData = JSON.parse(
      JSON.stringify(applicationData, (key, value) => {
        // Skip File objects which can't be serialized
        if (value instanceof File) {
          return undefined
        }
        return value
      }),
    )

    // Check if a draft already exists for this Discord ID
    const { data: existingDraft, error: queryError } = await supabase
      .from("draft_applications")
      .select("id, submit_count, status")
      .eq("discord_id", discordId)
      .maybeSingle()

    if (queryError) {
      console.error("Error querying draft application:", queryError)
      return false
    }

    const now = new Date().toISOString()

    if (existingDraft) {
      console.log(
        `Updating existing draft for Discord ID: ${discordId}, current status: ${existingDraft.status}, submit_count: ${existingDraft.submit_count || 0}`,
      )

      // Update existing draft but preserve the status and submit_count
      const { error } = await supabase
        .from("draft_applications")
        .update({
          email,
          application_data: cleanedData,
          updated_at: now,
          // Don't update status or submit_count here
        })
        .eq("id", existingDraft.id)

      if (error) {
        console.error("Error updating draft application:", error)
        return false
      }

      console.log("Draft updated successfully")
    } else {
      console.log(`Creating new draft for Discord ID: ${discordId}`)

      // Insert new draft with submit_count initialized to 0
      const { error } = await supabase.from("draft_applications").insert({
        discord_id: discordId,
        email,
        application_data: cleanedData,
        status: "draft",
        submit_count: 0,
        created_at: now,
        updated_at: now,
      })

      if (error) {
        console.error("Error saving draft application:", error)
        return false
      }

      console.log("New draft created successfully")
    }

    return true
  } catch (error) {
    console.error("Error in saveDraftToSupabase:", error)
    return false
  }
}

/**
 * Loads a draft application from Supabase by Discord ID
 */
export async function loadDraftFromSupabase(discordId: string): Promise<any | null> {
  try {
    if (!discordId) {
      console.error("Cannot load draft: Discord ID is missing")
      return null
    }

    const { data, error } = await supabase
      .from("draft_applications")
      .select("application_data")
      .eq("discord_id", discordId)
      .eq("status", "draft")
      .maybeSingle()

    if (error) {
      console.error("Error loading draft application:", error)
      return null
    }

    return data?.application_data || null
  } catch (error) {
    console.error("Error in loadDraftFromSupabase:", error)
    return null
  }
}

/**
 * Marks a draft application as submitted in Supabase
 */
export async function markDraftAsSubmitted(discordId: string): Promise<boolean> {
  try {
    if (!discordId) {
      console.error("Cannot update draft status: Discord ID is missing")
      return false
    }

    console.log(`Attempting to mark application as submitted for Discord ID: ${discordId}`)

    // First, get the current draft to access submit_count and application_data
    const { data: currentDraft, error: fetchError } = await supabase
      .from("draft_applications")
      .select("id, submit_count, application_data, status")
      .eq("discord_id", discordId)
      .eq("status", "draft")
      .single()

    if (fetchError) {
      console.error("Error fetching draft for submission:", fetchError)
      return false
    }

    if (!currentDraft) {
      console.error("No draft found for submission. Discord ID:", discordId)
      return false
    }

    console.log(
      `Found draft with ID: ${currentDraft.id}, current status: ${currentDraft.status}, current submit_count: ${currentDraft.submit_count || 0}`,
    )

    // Increment the submit_count
    const newSubmitCount = (currentDraft.submit_count || 0) + 1
    const now = new Date().toISOString()

    console.log(`Updating draft to status 'submitted' with submit_count: ${newSubmitCount}`)

    // Use the proper Supabase client SDK method to update the record by ID
    const { data, error: updateError } = await supabase
      .from("draft_applications")
      .update({
        status: "submitted",
        submit_count: newSubmitCount,
        updated_at: now,
      })
      .eq("id", currentDraft.id)
      .select()

    if (updateError) {
      console.error("Error marking draft as submitted:", updateError)
      return false
    }

    console.log("Successfully updated draft status to 'submitted':", data)
    return true
  } catch (error) {
    console.error("Error in markDraftAsSubmitted:", error)
    return false
  }
}

/**
 * Marks a submitted application as editable (draft) in Supabase
 */
export async function markDraftAsEditable(discordId: string): Promise<boolean> {
  try {
    if (!discordId) {
      console.error("Cannot update application status: Discord ID is missing")
      return false
    }

    console.log(`Attempting to mark application as editable for Discord ID: ${discordId}`)

    // First check if the application exists and is in submitted status
    const { data: existingApp, error: queryError } = await supabase
      .from("draft_applications")
      .select("id, status, submit_count")
      .eq("discord_id", discordId)
      .eq("status", "submitted")
      .maybeSingle()

    if (queryError) {
      console.error("Error querying application:", queryError)
      return false
    }

    if (!existingApp) {
      console.error("No submitted application found for Discord ID:", discordId)
      return false
    }

    console.log(
      `Found application with ID: ${existingApp.id}, current status: ${existingApp.status}, submit_count: ${existingApp.submit_count || 0}`,
    )

    // Update the application status to draft
    const { data: updateData, error: updateError } = await supabase
      .from("draft_applications")
      .update({
        status: "draft",
        updated_at: new Date().toISOString(),
        // We don't change submit_count here, it stays the same
      })
      .eq("id", existingApp.id)
      .select()

    if (updateError) {
      console.error("Error marking application as editable:", updateError)
      return false
    }

    console.log("Successfully updated application status to 'draft':", updateData)
    return true
  } catch (error) {
    console.error("Error in markDraftAsEditable:", error)
    return false
  }
}

/**
 * Checks if a user has a submitted application
 */
export async function hasSubmittedApplication(discordId: string): Promise<boolean> {
  try {
    if (!discordId) {
      return false
    }

    const { data, error } = await supabase
      .from("draft_applications")
      .select("status")
      .eq("discord_id", discordId)
      .eq("status", "submitted")
      .maybeSingle()

    if (error) {
      console.error("Error checking submitted application:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error in hasSubmittedApplication:", error)
    return false
  }
}

/**
 * Deletes a draft application from Supabase
 */
export async function deleteDraft(discordId: string): Promise<boolean> {
  try {
    if (!discordId) {
      console.error("Cannot delete draft: Discord ID is missing")
      return false
    }

    const { error } = await supabase
      .from("draft_applications")
      .delete()
      .eq("discord_id", discordId)
      .eq("status", "draft")

    if (error) {
      console.error("Error deleting draft application:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteDraft:", error)
    return false
  }
}

// Add a function to get the current submit_count
export async function getSubmitCount(discordId: string): Promise<number> {
  try {
    if (!discordId) {
      return 0
    }

    const { data, error } = await supabase
      .from("draft_applications")
      .select("submit_count")
      .eq("discord_id", discordId)
      .maybeSingle()

    if (error) {
      console.error("Error getting submit count:", error)
      return 0
    }

    return data?.submit_count || 0
  } catch (error) {
    console.error("Error in getSubmitCount:", error)
    return 0
  }
}

/**
 * Gets the current status of an application
 */
export async function getApplicationStatus(discordId: string): Promise<{ status: string | null; submitCount: number }> {
  try {
    if (!discordId) {
      return { status: null, submitCount: 0 }
    }

    const { data, error } = await supabase
      .from("draft_applications")
      .select("status, submit_count")
      .eq("discord_id", discordId)
      .maybeSingle()

    if (error) {
      console.error("Error getting application status:", error)
      return { status: null, submitCount: 0 }
    }

    return {
      status: data?.status || null,
      submitCount: data?.submit_count || 0,
    }
  } catch (error) {
    console.error("Error in getApplicationStatus:", error)
    return { status: null, submitCount: 0 }
  }
}
