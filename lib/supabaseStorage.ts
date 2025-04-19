import { supabase } from "./supabaseClient"
import { v4 as uuidv4 } from "uuid"

// Maximum file size in bytes (3MB)
export const MAX_FILE_SIZE = 3 * 1024 * 1024
// Maximum number of files
export const MAX_FILES = 5
// Allowed file types
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"]

// Bucket name - this should already exist in your Supabase project
const BUCKET_NAME = "screenshots"

export type UploadedFile = {
  path: string
  filename: string
  size: number
  type: string
  url?: string
}

/**
 * Uploads a file to Supabase Storage
 */
export async function uploadFile(file: File, discordId: string): Promise<UploadedFile | null> {
  try {
    console.log("Starting file upload process:", file.name)

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`)
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error("File type not allowed. Please upload JPG, PNG, or WebP images only.")
    }

    // Create a unique filename to avoid collisions
    const fileExt = file.name.split(".").pop()
    const uniqueId = uuidv4()
    const uniqueFilename = `${uniqueId}.${fileExt}`
    const filePath = `boosting-experience/${discordId}/${uniqueFilename}`

    console.log("Uploading file to path:", filePath)

    // Upload the file
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Supabase storage upload error:", error)
      throw new Error(`Upload failed: ${error.message}`)
    }

    if (!data) {
      throw new Error("Upload failed: No data returned from Supabase")
    }

    console.log("File uploaded successfully:", data.path)

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

    return {
      path: data.path,
      filename: file.name,
      size: file.size,
      type: file.type,
      url: urlData.publicUrl,
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
    console.log("Attempting to delete file:", path)

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

    if (error) {
      console.error("Error deleting file:", error)
      throw new Error(`Delete failed: ${error.message}`)
    }

    console.log("File deleted successfully")
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
    console.log("Listing files for user:", discordId)

    // First check if the folder exists
    const folderPath = `boosting-experience/${discordId}`

    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folderPath)

      if (error) {
        // If there's an error, the folder might not exist yet, which is normal for new users
        console.log(`Folder ${folderPath} might not exist yet:`, error.message)
        return []
      }

      if (!data || data.length === 0) {
        console.log("No files found for user")
        return []
      }

      console.log("Files found:", data.length)

      return Promise.all(
        data.map(async (item) => {
          const path = `${folderPath}/${item.name}`

          // Get the public URL for each file
          const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)

          return {
            path: path,
            filename: item.name,
            size: item.metadata?.size || 0,
            type: item.metadata?.mimetype || "",
            url: urlData.publicUrl,
          }
        }),
      )
    } catch (innerError) {
      console.error("Error listing files in folder:", innerError)
      return []
    }
  } catch (error) {
    console.error("Error in listUserFiles:", error)
    return []
  }
}

/**
 * Check if the Supabase storage is available and the bucket exists
 */
export async function checkStorageAvailability(): Promise<boolean> {
  try {
    console.log("Checking storage availability...")

    // First, check if we can connect to Supabase at all
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Supabase connection error:", sessionError)
      return false
    }

    console.log("Supabase connection successful")

    // Try a direct operation on the bucket instead of listing all buckets
    try {
      // Try to list the root of the bucket (which should work even if empty)
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list()

      if (error) {
        console.error(`Error accessing bucket "${BUCKET_NAME}":`, error)
        return false
      }

      console.log(`Successfully accessed bucket "${BUCKET_NAME}"`)
      return true
    } catch (bucketError) {
      console.error(`Error checking bucket "${BUCKET_NAME}":`, bucketError)
      return false
    }
  } catch (error) {
    console.error("Error checking storage availability:", error)
    return false
  }
}
