"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Search, ChevronDown, X, Check } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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
    <div className="mt-8">
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
  helperText?: string
}

function DatePickerInput({ id, value, onChange, disabled = false }: DatePickerInputProps) {
  // Convert string date to Date object
  const date = value ? new Date(value) : undefined

  // State to track the currently displayed month in the calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(() => date || new Date())

  // Update currentMonth when the selected date changes, but only when the value prop changes
  useEffect(() => {
    if (date) {
      setCurrentMonth(new Date(date))
    }
  }, [value]) // Only depend on the value prop, not the date object

  // Handle year selection
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = Number.parseInt(e.target.value)

    // Create a new date based on the current month but with the new year
    const newDate = new Date(currentMonth)
    newDate.setFullYear(newYear)

    // Update the current month view
    setCurrentMonth(newDate)

    // If there's already a selected date, update it with the new year
    if (date) {
      const updatedDate = new Date(date)
      updatedDate.setFullYear(newYear)
      onChange(updatedDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal px-4 py-6 bg-[#2D3748] border border-[#4A5568] rounded-md text-white hover:bg-[#2D3748]/90 hover:text-white",
            !date && "text-gray-400",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : "Select date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[#1E2533] border-[#4A5568]" align="start" sideOffset={5}>
        <div className="p-3 border-b border-[#4A5568]">
          <div className="flex justify-between items-center">
            <select
              value={currentMonth.getFullYear()}
              onChange={handleYearChange}
              className="bg-[#2D3748] text-white border border-[#4A5568] rounded px-2 py-1 text-sm"
            >
              {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 80 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          initialFocus
          disabled={disabled}
          className="bg-[#1E2533] text-white"
          classNames={{
            nav_button: "text-white hover:bg-[#2D3748] hover:text-white",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            caption: "relative flex justify-center items-center px-8 py-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#E53E3E]/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-[#2D3748] hover:text-white",
            day_selected:
              "bg-[#E53E3E] text-white hover:bg-[#E53E3E] hover:text-white focus:bg-[#E53E3E] focus:text-white",
            day_today: "bg-[#2D3748] text-white",
            day_outside: "text-gray-500 opacity-50",
            day_disabled: "text-gray-500 opacity-50",
            day_range_middle: "aria-selected:bg-[#2D3748] aria-selected:text-white",
            day_hidden: "invisible",
            head_cell: "text-gray-400 font-normal text-center w-9",
            table: "border-collapse w-full",
          }}
          fixedWeeks
        />
      </PopoverContent>
    </Popover>
  )
}

export function FormInput({ label, required = false, helperText, ...props }: FormInputProps) {
  // Special handling for date inputs
  if (props.type === "date") {
    return (
      <div className="space-y-2">
        <Label htmlFor={props.id} className="flex items-center text-white">
          {label} {required && <span className="text-[#E53E3E] ml-1">*</span>}
        </Label>
        <DatePickerInput
          id={props.id || "date-picker"}
          value={props.value as string}
          onChange={(date) => {
            // Create a synthetic event to mimic input change
            const event = {
              target: {
                value: date ? format(date, "yyyy-MM-dd") : "",
                name: props.name,
                id: props.id,
              },
            } as React.ChangeEvent<HTMLInputElement>

            if (props.onChange) props.onChange(event)
          }}
          disabled={props.disabled}
        />
        {helperText && <p className="text-gray-400 text-sm">{helperText}</p>}
      </div>
    )
  }

  // Regular input handling
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="flex items-center text-white">
        {label} {required && <span className="text-[#E53E3E] ml-1">*</span>}
      </Label>
      <input
        {...props}
        placeholder={props.placeholder || "Discord Username"}
        className="w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
      />
      {helperText && <p className="text-gray-400 text-sm">{helperText}</p>}
    </div>
  )
}

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  required?: boolean
}

interface DatePickerInputProps {
  id: string
  value: string
  onChange: (date: Date | undefined) => void
  disabled?: boolean
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

interface SearchableSelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label: string
  required?: boolean
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function SearchableSelect({
  label,
  required = false,
  options,
  value,
  onChange,
  ...props
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Find the selected option label
  const selectedOption = options.find((option) => option.value === value)

  // Filter options based on search term
  const filteredOptions = options.filter(
    (option) => option.label && option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="flex items-center text-white">
        {label} {required && <span className="text-[#E53E3E] ml-1">*</span>}
      </Label>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="flex items-center justify-between w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          id={props.id}
        >
          <span className={value ? "text-white" : "text-gray-400"}>
            {selectedOption ? selectedOption.label : "Select option"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-[#2D3748] border border-[#4A5568] rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="sticky top-0 bg-[#2D3748] p-2 border-b border-[#4A5568]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-8 pr-4 py-2 bg-[#1A202C] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <ul className="py-1" role="listbox">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    className={`px-4 py-2 cursor-pointer hover:bg-[#4A5568] ${
                      option.value === value ? "bg-[#E53E3E]/10 text-[#E53E3E]" : "text-white"
                    }`}
                    onClick={() => handleSelect(option.value)}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {option.label}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-400">No results found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

interface MultiSelectDropdownProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  label: string
  required?: boolean
  options: { value: string; label: string }[]
  values: string[]
  onChange: (values: string[]) => void
}

export function MultiSelectDropdown({
  label,
  required = false,
  options,
  values,
  onChange,
  ...props
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Find the selected option labels
  const selectedOptions = options.filter((option) => values.includes(option.value))

  // Filter options based on search term
  const filteredOptions = options.filter(
    (option) => option.label && option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter((value) => value !== optionValue))
    } else {
      onChange([...values, optionValue])
    }
  }

  // Handle removing a selected option
  const handleRemove = (optionValue: string) => {
    onChange(values.filter((value) => value !== optionValue))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="flex items-center text-white">
        {label} {required && <span className="text-[#E53E3E] ml-1">*</span>}
      </Label>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="flex items-center justify-between w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          id={props.id}
        >
          <span className={values.length > 0 ? "text-white" : "text-gray-400"}>
            {values.length > 0 ? `${values.length} selected` : "Select options"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {/* Selected options display */}
        {values.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center bg-[#4A5568] text-white text-sm rounded-md px-2 py-1"
              >
                <span className="mr-1">{option.label}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(option.value)
                  }}
                  className="text-gray-300 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-[#2D3748] border border-[#4A5568] rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="sticky top-0 bg-[#2D3748] p-2 border-b border-[#4A5568]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-8 pr-4 py-2 bg-[#1A202C] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <ul className="py-1" role="listbox" aria-multiselectable="true">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    className={`px-4 py-2 cursor-pointer hover:bg-[#4A5568] flex items-center justify-between ${
                      values.includes(option.value) ? "bg-[#E53E3E]/10 text-[#E53E3E]" : "text-white"
                    }`}
                    onClick={() => handleSelect(option.value)}
                    role="option"
                    aria-selected={values.includes(option.value)}
                  >
                    <span>{option.label}</span>
                    {values.includes(option.value) && <Check className="h-4 w-4" />}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-400">No results found</li>
              )}
            </ul>

            <div className="sticky bottom-0 bg-[#2D3748] p-2 border-t border-[#4A5568]">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-[#E53E3E] text-white rounded-md hover:bg-[#E53E3E]/90 transition-colors"
              >
                Done ({values.length} selected)
              </button>
            </div>
          </div>
        )}
      </div>
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
    <div className="flex items-center space-x-4 py-1">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#E53E3E] data-[state=checked]:border-[#E53E3E] border-[#4A5568] h-5 w-5"
      />
      <Label htmlFor={id} className="text-white cursor-pointer text-base">
        {label}
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
  // Create a handler for clicking the entire container
  const handleContainerClick = () => {
    // Create a synthetic event object that mimics a change event
    const syntheticEvent = {
      target: {
        value: value,
      },
    } as React.ChangeEvent<HTMLInputElement>

    // Call the onChange handler with our synthetic event
    onChange(syntheticEvent)
  }

  return (
    <div
      className={`flex items-center p-4 border ${checked ? "border-[#E53E3E]" : "border-[#4A5568]"} rounded-md bg-[#2D3748] hover:bg-[#2D3748]/80 transition-colors cursor-pointer`}
      onClick={handleContainerClick}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 text-[#E53E3E] border-[#4A5568] focus:ring-[#E53E3E]/50 bg-[#2D3748] cursor-pointer"
        // Prevent the click event from bubbling up to the container
        // which would trigger handleContainerClick again
        onClick={(e) => e.stopPropagation()}
      />
      <Label htmlFor={id} className="ml-3 text-white cursor-pointer w-full">
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
      <Label
        htmlFor={id}
        className="text-white cursor-pointer flex-1"
        onClick={(e) => {
          e.preventDefault() // Prevent default behavior
          onChange(!checked) // Directly toggle the checkbox state
        }}
      >
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
