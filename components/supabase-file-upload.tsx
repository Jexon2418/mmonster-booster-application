"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import { Loader2, X, Upload, AlertCircle } from "lucide-react"
import { Alert } from "./ui-components"

interface UploadedFile {
  url: string
  path: string
  name: string
  size: number
}

interface SupabaseFileUploadProps {
  discordId: string
  onFilesChange: (files: UploadedFile[]) => void
  initialFiles?: UploadedFile[]
  maxFiles?: number
  maxSizeMB?: number
}

export function SupabaseFileUpload({
  discordId,
  onFilesChange,
  initialFiles = [],
  maxFiles = 5,
  maxSizeMB = 3,
}: SupabaseFileUploadProps) {
  // Use a ref to track if we've initialized
  const hasInitialized = useRef(false)

  // Filter out any invalid initial files
  const validInitialFiles = initialFiles?.filter((file) => file && file.path && file.name && file.size) || []

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(validInitialFiles.length > 0)
  const maxSizeBytes = maxSizeMB * 1024 * 1024 // Convert MB to bytes

  // Initialize once on mount
  useEffect(() => {
    if (hasInitialized.current) return

    const initializeFiles = async () => {
      if (!validInitialFiles.length) {
        setIsLoading(false)
        hasInitialized.current = true
        return
      }

      try {
        // Process files in batches to avoid freezing
        const batchSize = 2
        const processedFiles: UploadedFile[] = []

        for (let i = 0; i < validInitialFiles.length; i += batchSize) {
          const batch = validInitialFiles.slice(i, i + batchSize)

          // Process each batch
          const batchResults = await Promise.all(
            batch.map(async (file) => {
              try {
                const { data } = supabase.storage.from("user-screenshots").getPublicUrl(file.path)
                return {
                  ...file,
                  url: data.publicUrl,
                }
              } catch (error) {
                console.error("Error generating URL for file:", file.path)
                return null
              }
            }),
          )

          // Add valid results to processed files
          processedFiles.push(...(batchResults.filter(Boolean) as UploadedFile[]))

          // Small delay to prevent UI freezing
          await new Promise((resolve) => setTimeout(resolve, 10))
        }

        setUploadedFiles(processedFiles)
      } catch (error) {
        console.error("Error initializing files:", error)
      } finally {
        setIsLoading(false)
        hasInitialized.current = true
      }
    }

    initializeFiles()
  }, [validInitialFiles])

  // Notify parent when files change, but only after initialization
  useEffect(() => {
    if (!hasInitialized.current || isLoading) return
    onFilesChange(uploadedFiles)
  }, [uploadedFiles, onFilesChange, isLoading])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    // Check if adding these files would exceed the maximum
    if (uploadedFiles.length + e.target.files.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files.`)
      return
    }

    setIsUploading(true)
    setError(null)

    const newFiles: UploadedFile[] = []
    const filesArray = Array.from(e.target.files)

    // Process files one by one to avoid freezing
    for (const file of filesArray) {
      // Check file size
      if (file.size > maxSizeBytes) {
        setError(`File "${file.name}" exceeds the maximum size of ${maxSizeMB}MB.`)
        continue
      }

      try {
        // Generate a unique filename
        const timestamp = new Date().getTime()
        const randomString = Math.random().toString(36).substring(2, 10)
        const fileExtension = file.name.split(".").pop()
        const fileName = `${timestamp}-${randomString}.${fileExtension}`
        const filePath = `${discordId}/${fileName}`

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage.from("user-screenshots").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (error) throw error

        // Get the public URL
        const { data: urlData } = supabase.storage.from("user-screenshots").getPublicUrl(filePath)

        if (!urlData || !urlData.publicUrl) {
          throw new Error("Failed to generate public URL")
        }

        newFiles.push({
          url: urlData.publicUrl,
          path: filePath,
          name: file.name,
          size: file.size,
        })

        // Small delay to prevent UI freezing
        await new Promise((resolve) => setTimeout(resolve, 10))
      } catch (error) {
        console.error("Error uploading file:", error)
        setError("Failed to upload file. Please try again.")
      }
    }

    // Update state with new files
    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }

    setIsUploading(false)
    e.target.value = ""
  }

  const handleDelete = async (fileToDelete: UploadedFile) => {
    try {
      // Delete file from Supabase Storage
      const { error } = await supabase.storage.from("user-screenshots").remove([fileToDelete.path])

      if (error) throw error

      // Remove file from state
      setUploadedFiles((prev) => prev.filter((file) => file.path !== fileToDelete.path))
    } catch (error) {
      console.error("Error deleting file:", error)
      setError("Failed to delete file. Please try again.")
    }
  }

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert type="error">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </Alert>
      )}

      <div className="border-2 border-dashed border-[#4A5568] rounded-md p-8 text-center">
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading || uploadedFiles.length >= maxFiles}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${uploadedFiles.length >= maxFiles ? "opacity-50" : ""}`}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-12 w-12 text-gray-400 mb-3" />
            <div className="text-[#E53E3E] font-medium">{isUploading ? "Uploading..." : "Upload screenshots"}</div>
            <p className="text-gray-400 text-sm mt-1">Choose or drag and drop</p>
            <p className="text-gray-500 text-xs mt-1">JPEG, PNG, WEBP (max {maxSizeMB} MB)</p>
            <p className="text-gray-500 text-xs mt-1">
              {uploadedFiles.length} of {maxFiles} files uploaded
            </p>
          </div>
        </label>
      </div>

      {(isUploading || isLoading) && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#E53E3E]" />
          <span className="ml-2 text-gray-400">{isUploading ? "Uploading..." : "Loading saved screenshots..."}</span>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          {uploadedFiles.map((file, index) => (
            <div key={`${file.path}-${index}`} className="relative group">
              <div className="relative h-32 w-full rounded-md overflow-hidden border border-[#4A5568] bg-[#1A202C]">
                <Image
                  src={file.url || "/placeholder.svg"}
                  alt={file.name}
                  fill
                  className="object-cover"
                  onError={() => {
                    console.error("Error loading image:", file.url)
                  }}
                  unoptimized
                  loading="lazy"
                />
              </div>
              <button
                type="button"
                onClick={() => handleDelete(file)}
                className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mt-1 text-xs text-gray-400 truncate">
                {file.name} ({formatFileSize(file.size)})
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
