import { supabase } from "./supabaseClient"

// Maximum file size in bytes (3MB)
export const MAX_FILE_SIZE = 3 * 1024 * 1024
// Maximum number of files
export const MAX_FILES = 5
// Allowed file types
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export type UploadedFile = {
  path: string
  filename: string
  size: number
  type: string
}

/**
 * Uploads a file to Supabase Storage
 */
export async function uploadFile(file: File, discordId: string): Promise<UploadedFile | null> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`)
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error("File type not allowed. Please upload JPG, PNG, or WebP images only.")
    }

    // Create a unique filename to avoid collisions
    const timestamp = new Date().getTime()
    const uniqueFilename = `${timestamp}-${file.name.replace(/\s+/g, "_")}`
    const filePath = `boosting-experience-screenshots/${discordId}/${uniqueFilename}`

    // Upload the file
    const { data, error } = await supabase.storage.from("booster-applications").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading file:", error)
      throw error
    }

    return {
      path: data.path,
      filename: file.name,
      size: file.size,
      type: file.type,
    }
  } catch (error) {
    console.error("Error in uploadFile:", error)
    throw error
  }
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from("booster-applications").remove([path])

    if (error) {
      console.error("Error deleting file:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error in deleteFile:", error)
    throw error
  }
}

/**
 * Gets a list of files for a specific Discord user
 */
export async function listUserFiles(discordId: string): Promise<UploadedFile[]> {
  try {
    const { data, error } = await supabase.storage
      .from("booster-applications")
      .list(`boosting-experience-screenshots/${discordId}`)

    if (error) {
      console.error("Error listing files:", error)
      throw error
    }

    return data.map((item) => ({
      path: `boosting-experience-screenshots/${discordId}/${item.name}`,
      filename: item.name.substring(item.name.indexOf("-") + 1).replace(/_/g, " "),
      size: item.metadata?.size || 0,
      type: item.metadata?.mimetype || "",
    }))
  } catch (error) {
    console.error("Error in listUserFiles:", error)
    return []
  }
}
