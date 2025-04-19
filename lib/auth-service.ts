import { supabase } from "./supabaseClient"
import type { DiscordUser } from "@/components/booster-application-form"

// Key for storing Discord user in localStorage
const DISCORD_USER_KEY = "discord_user"

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
    const userData = localStorage.getItem(DISCORD_USER_KEY)
    if (!userData) return null

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

    // Check if user exists in Supabase
    const { data, error } = await supabase.from("discord_users").select("discord_id").eq("discord_id", userId).single()

    if (error || !data) {
      console.error("Error verifying Discord session:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in verifyDiscordSession:", error)
    return false
  }
}
