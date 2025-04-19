"use client"

import type React from "react"

import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={`space-y-6 ${className || ""}`}>
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description && <p className="text-gray-400 mt-2">{description}</p>}
      </div>
      {children}
    </div>
  )
}

interface FormButtonsProps {
  onBack?: () => void
  onContinue: () => void
  continueText?: string
  disabled?: boolean
}

// Update the FormButtons component to remove the "Previous Step" button

export function FormButtons({ onBack, onContinue, continueText = "Continue", disabled = false }: FormButtonsProps) {
  return (
    <div className="mt-8 space-y-4">
      <button
        onClick={onContinue}
        disabled={disabled}
        className="w-full py-3 bg-[#E53E3E] text-white rounded-md hover:bg-[#E53E3E]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {continueText}
      </button>
    </div>
  )
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
}

export function FormInput({ label, required = false, ...props }: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="flex items-center text-white">
        {label} {required && <span className="text-[#E53E3E] ml-1">*</span>}
      </Label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
        defaultValue={props.defaultValue || ""}
      />
    </div>
  )
}

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  required?: boolean
}

export function FormTextarea({ label, required = false, ...props }: FormTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="flex items-center text-white">
        {label} {required && <span className="text-[#E53E3E] ml-1">*</span>}
      </Label>
      <textarea
        {...props}
        className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50 min-h-[120px]"
      />
    </div>
  )
}

interface FormSelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label: string
  required?: boolean
  options: { value: string; label: string }[]
}

export function FormSelect({ label, required = false, options, ...props }: FormSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="flex items-center text-white">
        {label} {required && <span className="text-[#E53E3E] ml-1">*</span>}
      </Label>
      <select
        {...props}
        className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50 appearance-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface FormCheckboxProps {
  id: string
  label: ReactNode
  required?: boolean
  checked: boolean
  onChange: (checked: boolean) => void
}

export function FormCheckbox({ id, label, required = false, checked, onChange }: FormCheckboxProps) {
  return (
    <div className="flex items-start space-x-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#E53E3E] data-[state=checked]:border-[#E53E3E] border-[#4A5568] mt-1"
      />
      <Label htmlFor={id} className="text-white cursor-pointer">
        {label} {required && <span className="text-[#E53E3E] ml-1">*</span>}
      </Label>
    </div>
  )
}

interface FormRadioProps {
  id: string
  name: string
  label: string
  value: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function FormRadio({ id, name, label, value, checked, onChange }: FormRadioProps) {
  return (
    <div className="flex items-center p-4 border border-[#4A5568] rounded-md bg-[#2D3748] hover:bg-[#2D3748]/80 transition-colors">
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 text-[#E53E3E] border-[#4A5568] focus:ring-[#E53E3E]/50 bg-[#2D3748]"
      />
      <Label htmlFor={id} className="ml-3 text-white cursor-pointer">
        {label}
      </Label>
    </div>
  )
}

interface FormCheckboxCardProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function FormCheckboxCard({ id, label, checked, onChange }: FormCheckboxCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 border ${checked ? "border-[#E53E3E]" : "border-[#4A5568]"} rounded-md bg-[#2D3748] hover:bg-[#2D3748]/80 transition-colors cursor-pointer`}
      onClick={() => onChange(!checked)}
    >
      <Label htmlFor={id} className="text-white cursor-pointer">
        {label}
      </Label>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#E53E3E] data-[state=checked]:border-[#E53E3E] border-[#4A5568]"
      />
    </div>
  )
}

interface AlertProps {
  type: "error" | "info"
  children: ReactNode
}

export function Alert({ type, children }: AlertProps) {
  return (
    <div
      className={`p-4 rounded-md ${type === "error" ? "bg-[#E53E3E]/10 text-[#E53E3E]" : "bg-blue-500/10 text-blue-500"}`}
    >
      {children}
    </div>
  )
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  multiple?: boolean
  accept?: string
  maxSize?: number // in MB
}

export function FileUpload({ onFilesSelected, multiple = false, accept = "image/*", maxSize = 50 }: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      onFilesSelected(filesArray)
    }
  }

  return (
    <div className="border-2 border-dashed border-[#4A5568] rounded-md p-8 text-center">
      <input
        type="file"
        id="file-upload"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="text-[#E53E3E] font-medium">Upload file</div>
          <p className="text-gray-400 text-sm mt-1">Choose or drag and drop</p>
          <p className="text-gray-500 text-xs mt-1">JPEG, PNG, HEIC, WEBP, PDF (max {maxSize} MB)</p>
        </div>
      </label>
    </div>
  )
}

interface GameTagProps {
  name: string
  onRemove: () => void
}

export function GameTag({ name, onRemove }: GameTagProps) {
  return (
    <div className="inline-flex items-center bg-[#2D3748] text-white rounded-md px-3 py-1 mr-2 mb-2">
      {name}
      <button type="button" onClick={onRemove} className="ml-2 text-gray-400 hover:text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
