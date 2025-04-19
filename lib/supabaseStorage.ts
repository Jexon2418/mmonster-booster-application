import { supabase } from "./supabaseClient"
import { v4 as uuidv4 } from "uuid"

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
    const filePath = `boosting-experience-screenshots/${discordId}/${uniqueFilename}`

    console.log("Uploading file to path:", filePath)

    // Upload the file
    const { data, error } = await supabase.storage.from("booster-applications").upload(filePath, file, {
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
    const { data: urlData } = supabase.storage.from("booster-applications").getPublicUrl(data.path)

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

    const { error } = await supabase.storage.from("booster-applications").remove([path])

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

    const { data, error } = await supabase.storage
      .from("booster-applications")
      .list(`boosting-experience-screenshots/${discordId}`)

    if (error) {
      console.error("Error listing files:", error)
      throw new Error(`Failed to list files: ${error.message}`)
    }

    if (!data) {
      console.log("No files found for user")
      return []
    }

    console.log("Files found:", data.length)

    return Promise.all(
      data.map(async (item) => {
        const path = `boosting-experience-screenshots/${discordId}/${item.name}`

        // Get the public URL for each file
        const { data: urlData } = supabase.storage.from("booster-applications").getPublicUrl(path)

        return {
          path: path,
          filename: item.name,
          size: item.metadata?.size || 0,
          type: item.metadata?.mimetype || "",
          url: urlData.publicUrl,
        }
      }),
    )
  } catch (error) {
    console.error("Error in listUserFiles:", error)
    return []
  }
}

/**
 * Check if the Supabase bucket exists and create it if it doesn't
 */
export async function ensureStorageBucket(): Promise<boolean> {
  try {
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return false
    }

    const bucketExists = buckets.some((bucket) => bucket.name === "booster-applications")

    if (!bucketExists) {
      console.log("Creating booster-applications bucket")
      const { error: createError } = await supabase.storage.createBucket("booster-applications", {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        return false
      }

      console.log("Bucket created successfully")
    } else {
      console.log("Bucket already exists")
    }

    return true
  } catch (error) {
    console.error("Error in ensureStorageBucket:", error)
    return false
  }
}
