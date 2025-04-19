import { supabase } from "./supabaseClient"
import type { DiscordUser } from "@/components/booster-application-form"

// Key for storing Discord user in localStorage
const DISCORD_USER_KEY = "discord_user"
// Key for storing session timestamp
const SESSION_TIMESTAMP_KEY = "discord_session_timestamp"
// Session expiration time (7 days in milliseconds)
const SESSION_EXPIRATION = 7 * 24 * 60 * 60 * 1000

/**
 * Saves Discord user to localStorage and Supabase auth metadata
 */
export async function saveDiscordUser(user: DiscordUser): Promise<boolean> {
  try {
    if (!user || !user.id) {
      console.error("Cannot save Discord user: Invalid user data")
      return false
    }

    // Save to localStorage for immediate access
    localStorage.setItem(DISCORD_USER_KEY, JSON.stringify(user))
    // Save session timestamp
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())

    // Check if user exists in Supabase
    const { data: existingUser } = await supabase
      .from("discord_users")
      .select("id")
      .eq("discord_id", user.id)
      .maybeSingle()

    const now = new Date().toISOString()

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from("discord_users")
        .update({
          username: user.username,
          discriminator: user.discriminator,
          avatar: user.avatar,
          email: user.email,
          updated_at: now,
        })
        .eq("discord_id", user.id)

      if (error) {
        console.error("Error updating Discord user:", error)
        return false
      }
    } else {
      // Insert new user
      const { error } = await supabase.from("discord_users").insert({
        discord_id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
        email: user.email,
        created_at: now,
        updated_at: now,
      })

      if (error) {
        console.error("Error saving Discord user:", error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error in saveDiscordUser:", error)
    return false
  }
}

/**
 * Loads Discord user from localStorage
 */
export function getDiscordUser(): DiscordUser | null {
  try {
    // Check if session is expired
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY)
    if (timestamp) {
      const sessionAge = Date.now() - Number.parseInt(timestamp)
      if (sessionAge > SESSION_EXPIRATION) {
        // Session expired, clear it
        clearDiscordUser()
        return null
      }
    }

    const userData = localStorage.getItem(DISCORD_USER_KEY)
    if (!userData) return null

    // Update session timestamp
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())

    return JSON.parse(userData) as DiscordUser
  } catch (error) {
    console.error("Error loading Discord user from localStorage:", error)
    return null
  }
}

/**
 * Clears Discord user from localStorage and session
 */
export function clearDiscordUser(): void {
  try {
    localStorage.removeItem(DISCORD_USER_KEY)
    localStorage.removeItem(SESSION_TIMESTAMP_KEY)
  } catch (error) {
    console.error("Error clearing Discord user:", error)
  }
}

/**
 * Checks if user is authenticated with Discord
 */
export function isDiscordAuthenticated(): boolean {
  return !!getDiscordUser()
}

/**
 * Verifies if a Discord user session is valid by checking against Supabase
 */
export async function verifyDiscordSession(userId: string): Promise<boolean> {
  try {
    if (!userId) return false

    // Check if session is expired
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY)
    if (timestamp) {
      const sessionAge = Date.now() - Number.parseInt(timestamp)
      if (sessionAge > SESSION_EXPIRATION) {
        // Session expired, clear it
        clearDiscordUser()
        return false
      }
    }

    // Check if user exists in Supabase
    const { data, error } = await supabase.from("discord_users").select("discord_id").eq("discord_id", userId).single()

    if (error || !data) {
      console.error("Error verifying Discord session:", error)
      return false
    }

    // Update session timestamp
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())

    return true
  } catch (error) {
    console.error("Error in verifyDiscordSession:", error)
    return false
  }
}

/**
 * Refreshes the session timestamp
 */
export function refreshSession(): void {
  try {
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())
  } catch (error) {
    console.error("Error refreshing session:", error)
  }
}
