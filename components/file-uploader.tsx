"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, X, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { uploadFile, deleteFile, MAX_FILES, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/lib/supabaseStorage"

export type UploadedFile = {
  path: string
  filename: string
  size: number
  type: string
}

interface FileUploaderProps {
  discordId: string
  uploadedFiles: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
}

export function FileUploader({ discordId, uploadedFiles, onFilesChange }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    // Reset the input value so the same file can be selected again if needed
    e.target.value = ""

    // Check if we've reached the maximum number of files
    if (uploadedFiles.length >= MAX_FILES) {
      toast({
        title: "Upload limit reached",
        description: `You can only upload a maximum of ${MAX_FILES} images.`,
        variant: "destructive",
      })
      return
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPG, PNG, and WebP images are allowed.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 200)

      // Upload the file
      const uploadedFile = await uploadFile(file, discordId)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (uploadedFile) {
        // Add the new file to the list
        const newFiles = [...uploadedFiles, uploadedFile]
        onFilesChange(newFiles)

        toast({
          title: "File uploaded",
          description: "Your image has been uploaded successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveFile = async (file: UploadedFile) => {
    try {
      await deleteFile(file.path)

      // Remove the file from the list
      const newFiles = uploadedFiles.filter((f) => f.path !== file.path)
      onFilesChange(newFiles)

      toast({
        title: "File removed",
        description: "The image has been removed successfully.",
      })
    } catch (error) {
      toast({
        title: "Error removing file",
        description: "Failed to remove the file. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-white font-medium">
          Screenshots ({uploadedFiles.length} / {MAX_FILES})
        </div>
        <div className="text-gray-400 text-xs">JPG, PNG, WebP • Max {MAX_FILE_SIZE / (1024 * 1024)}MB</div>
      </div>

      {/* Upload progress indicator */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-[#2D3748] rounded-full h-2">
            <div
              className="bg-[#E53E3E] h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload button */}
      <div className="flex flex-col items-center">
        <label
          htmlFor="file-upload"
          className={`flex items-center justify-center w-full p-4 border-2 border-dashed border-[#4A5568] rounded-md cursor-pointer hover:bg-[#1E2533] transition-colors ${
            uploadedFiles.length >= MAX_FILES || isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept={ALLOWED_FILE_TYPES.join(",")}
            onChange={handleFileChange}
            disabled={uploadedFiles.length >= MAX_FILES || isUploading}
          />
          <div className="flex flex-col items-center">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-2" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
            )}
            <span className="text-[#E53E3E] font-medium">{isUploading ? "Uploading..." : "Upload screenshot"}</span>
            <p className="text-gray-400 text-sm mt-1">
              {uploadedFiles.length >= MAX_FILES
                ? "Maximum number of files reached"
                : "Click to browse or drag and drop"}
            </p>
          </div>
        </label>
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2 mt-4">
          <div className="text-white font-medium">Uploaded screenshots:</div>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={file.path} className="flex items-center justify-between bg-[#2D3748] p-3 rounded-md">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">{index + 1}.</span>
                  <span className="text-white truncate max-w-[200px]">{file.filename}</span>
                </div>
                <button
                  onClick={() => handleRemoveFile(file)}
                  className="text-gray-400 hover:text-[#E53E3E] transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
