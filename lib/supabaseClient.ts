import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
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
      .select("id")
      .eq("discord_id", discordId)
      .eq("status", "draft")
      .maybeSingle()

    if (queryError) {
      console.error("Error querying draft application:", queryError)
      return false
    }

    const now = new Date().toISOString()

    if (existingDraft) {
      // Update existing draft
      const { error } = await supabase
        .from("draft_applications")
        .update({
          email,
          application_data: cleanedData,
          updated_at: now,
        })
        .eq("id", existingDraft.id)

      if (error) {
        console.error("Error updating draft application:", error)
        return false
      }
    } else {
      // Insert new draft
      const { error } = await supabase.from("draft_applications").insert({
        discord_id: discordId,
        email,
        application_data: cleanedData,
        status: "draft",
        created_at: now,
        updated_at: now,
      })

      if (error) {
        console.error("Error saving draft application:", error)
        return false
      }
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

    const { error } = await supabase
      .from("draft_applications")
      .update({
        status: "submitted",
        updated_at: new Date().toISOString(),
      })
      .eq("discord_id", discordId)
      .eq("status", "draft")

    if (error) {
      console.error("Error marking draft as submitted:", error)
      return false
    }

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

    const { error } = await supabase
      .from("draft_applications")
      .update({
        status: "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("discord_id", discordId)
      .eq("status", "submitted")

    if (error) {
      console.error("Error marking application as editable:", error)
      return false
    }

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
