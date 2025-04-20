"use client"

import { useState, useRef, useEffect } from "react"
import { FormSection, FormButtons, FormInput, SearchableSelect } from "../ui-components"
import { Checkbox } from "@/components/ui/checkbox"
import type { FormData } from "../booster-application-form"

interface PersonalStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onContinue: () => void
  onBack: () => void
}

const COUNTRIES = [
  { value: "", label: "Select country" },
  { value: "Afghanistan", label: "Afghanistan" },
  { value: "Albania", label: "Albania" },
  { value: "Algeria", label: "Algeria" },
  { value: "Andorra", label: "Andorra" },
  { value: "Angola", label: "Angola" },
  { value: "Antigua and Barbuda", label: "Antigua and Barbuda" },
  { value: "Argentina", label: "Argentina" },
  { value: "Armenia", label: "Armenia" },
  { value: "Australia", label: "Australia" },
  { value: "Austria", label: "Austria" },
  { value: "Azerbaijan", label: "Azerbaijan" },
  { value: "Bahamas", label: "Bahamas" },
  { value: "Bahrain", label: "Bahrain" },
  { value: "Bangladesh", label: "Bangladesh" },
  { value: "Barbados", label: "Barbados" },
  { value: "Belarus", label: "Belarus" },
  { value: "Belgium", label: "Belgium" },
  { value: "Belize", label: "Belize" },
  { value: "Benin", label: "Benin" },
  { value: "Bhutan", label: "Bhutan" },
  { value: "Bolivia", label: "Bolivia" },
  { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
  { value: "Botswana", label: "Botswana" },
  { value: "Brazil", label: "Brazil" },
  { value: "Brunei", label: "Brunei" },
  { value: "Bulgaria", label: "Bulgaria" },
  { value: "Burkina Faso", label: "Burkina Faso" },
  { value: "Burundi", label: "Burundi" },
  { value: "Cabo Verde", label: "Cabo Verde" },
  { value: "Cambodia", label: "Cambodia" },
  { value: "Cameroon", label: "Cameroon" },
  { value: "Canada", label: "Canada" },
  { value: "Central African Republic", label: "Central African Republic" },
  { value: "Chad", label: "Chad" },
  { value: "Chile", label: "Chile" },
  { value: "China", label: "China" },
  { value: "Colombia", label: "Colombia" },
  { value: "Comoros", label: "Comoros" },
  { value: "Congo (Congo-Brazzaville)", label: "Congo (Congo-Brazzaville)" },
  { value: "Costa Rica", label: "Costa Rica" },
  { value: "Croatia", label: "Croatia" },
  { value: "Cuba", label: "Cuba" },
  { value: "Cyprus", label: "Cyprus" },
  { value: "Czechia", label: "Czechia" },
  { value: "Denmark", label: "Denmark" },
  { value: "Djibouti", label: "Djibouti" },
  { value: "Dominica", label: "Dominica" },
  { value: "Dominican Republic", label: "Dominican Republic" },
  { value: "Ecuador", label: "Ecuador" },
  { value: "Egypt", label: "Egypt" },
  { value: "El Salvador", label: "El Salvador" },
  { value: "Equatorial Guinea", label: "Equatorial Guinea" },
  { value: "Eritrea", label: "Eritrea" },
  { value: "Estonia", label: "Estonia" },
  { value: "Eswatini", label: "Eswatini" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Fiji", label: "Fiji" },
  { value: "Finland", label: "Finland" },
  { value: "France", label: "France" },
  { value: "Gabon", label: "Gabon" },
  { value: "Gambia", label: "Gambia" },
  { value: "Georgia", label: "Georgia" },
  { value: "Germany", label: "Germany" },
  { value: "Ghana", label: "Ghana" },
  { value: "Greece", label: "Greece" },
  { value: "Grenada", label: "Grenada" },
  { value: "Guatemala", label: "Guatemala" },
  { value: "Guinea", label: "Guinea" },
  { value: "Guinea-Bissau", label: "Guinea-Bissau" },
  { value: "Guyana", label: "Guyana" },
  { value: "Haiti", label: "Haiti" },
  { value: "Honduras", label: "Honduras" },
  { value: "Hungary", label: "Hungary" },
  { value: "Iceland", label: "Iceland" },
  { value: "India", label: "India" },
  { value: "Indonesia", label: "Indonesia" },
  { value: "Iran", label: "Iran" },
  { value: "Iraq", label: "Iraq" },
  { value: "Ireland", label: "Ireland" },
  { value: "Israel", label: "Israel" },
  { value: "Italy", label: "Italy" },
  { value: "Jamaica", label: "Jamaica" },
  { value: "Japan", label: "Japan" },
  { value: "Jordan", label: "Jordan" },
  { value: "Kazakhstan", label: "Kazakhstan" },
  { value: "Kenya", label: "Kenya" },
  { value: "Kiribati", label: "Kiribati" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Kyrgyzstan", label: "Kyrgyzstan" },
  { value: "Laos", label: "Laos" },
  { value: "Latvia", label: "Latvia" },
  { value: "Lebanon", label: "Lebanon" },
  { value: "Lesotho", label: "Lesotho" },
  { value: "Liberia", label: "Liberia" },
  { value: "Libya", label: "Libya" },
  { value: "Liechtenstein", label: "Liechtenstein" },
  { value: "Lithuania", label: "Lithuania" },
  { value: "Luxembourg", label: "Luxembourg" },
  { value: "Madagascar", label: "Madagascar" },
  { value: "Malawi", label: "Malawi" },
  { value: "Malaysia", label: "Malaysia" },
  { value: "Maldives", label: "Maldives" },
  { value: "Mali", label: "Mali" },
  { value: "Malta", label: "Malta" },
  { value: "Marshall Islands", label: "Marshall Islands" },
  { value: "Mauritania", label: "Mauritania" },
  { value: "Mauritius", label: "Mauritius" },
  { value: "Mexico", label: "Mexico" },
  { value: "Micronesia", label: "Micronesia" },
  { value: "Moldova", label: "Moldova" },
  { value: "Monaco", label: "Monaco" },
  { value: "Mongolia", label: "Mongolia" },
  { value: "Montenegro", label: "Montenegro" },
  { value: "Morocco", label: "Morocco" },
  { value: "Mozambique", label: "Mozambique" },
  { value: "Myanmar (formerly Burma)", label: "Myanmar (formerly Burma)" },
  { value: "Namibia", label: "Namibia" },
  { value: "Nauru", label: "Nauru" },
  { value: "Nepal", label: "Nepal" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "Nicaragua", label: "Nicaragua" },
  { value: "Niger", label: "Niger" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "North Macedonia", label: "North Macedonia" },
  { value: "Norway", label: "Norway" },
  { value: "Oman", label: "Oman" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "Palau", label: "Palau" },
  { value: "Palestine State", label: "Palestine State" },
  { value: "Panama", label: "Panama" },
  { value: "Papua New Guinea", label: "Papua New Guinea" },
  { value: "Paraguay", label: "Paraguay" },
  { value: "Peru", label: "Peru" },
  { value: "Philippines", label: "Philippines" },
  { value: "Poland", label: "Poland" },
  { value: "Portugal", label: "Portugal" },
  { value: "Qatar", label: "Qatar" },
  { value: "Romania", label: "Romania" },
  { value: "Russia", label: "Russia" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
  { value: "Saint Lucia", label: "Saint Lucia" },
  { value: "Saint Vincent and the Grenadines", label: "Saint Vincent and the Grenadines" },
  { value: "Samoa", label: "Samoa" },
  { value: "San Marino", label: "San Marino" },
  { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Senegal", label: "Senegal" },
  { value: "Serbia", label: "Serbia" },
  { value: "Seychelles", label: "Seychelles" },
  { value: "Sierra Leone", label: "Sierra Leone" },
  { value: "Singapore", label: "Singapore" },
  { value: "Slovakia", label: "Slovakia" },
  { value: "Slovenia", label: "Slovenia" },
  { value: "Solomon Islands", label: "Solomon Islands" },
  { value: "Somalia", label: "Somalia" },
  { value: "South Africa", label: "South Africa" },
  { value: "South Korea", label: "South Korea" },
  { value: "South Sudan", label: "South Sudan" },
  { value: "Spain", label: "Spain" },
  { value: "Sri Lanka", label: "Sri Lanka" },
  { value: "Sudan", label: "Sudan" },
  { value: "Suriname", label: "Suriname" },
  { value: "Sweden", label: "Sweden" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "Syria", label: "Syria" },
  { value: "Taiwan", label: "Taiwan" },
  { value: "Tajikistan", label: "Tajikistan" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Thailand", label: "Thailand" },
  { value: "Timor-Leste", label: "Timor-Leste" },
  { value: "Togo", label: "Togo" },
  { value: "Tonga", label: "Tonga" },
  { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
  { value: "Tunisia", label: "Tunisia" },
  { value: "Turkey", label: "Turkey" },
  { value: "Turkmenistan", label: "Turkmenistan" },
  { value: "Tuvalu", label: "Tuvalu" },
  { value: "Uganda", label: "Uganda" },
  { value: "Ukraine", label: "Ukraine" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States of America", label: "United States of America" },
  { value: "Uruguay", label: "Uruguay" },
  { value: "Uzbekistan", label: "Uzbekistan" },
  { value: "Vanuatu", label: "Vanuatu" },
  { value: "Vatican City", label: "Vatican City" },
  { value: "Venezuela", label: "Venezuela" },
  { value: "Vietnam", label: "Vietnam" },
  { value: "Yemen", label: "Yemen" },
  { value: "Zambia", label: "Zambia" },
  { value: "Zimbabwe", label: "Zimbabwe" },
]

const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "French", label: "French" },
  { value: "Spanish", label: "Spanish" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "German", label: "German" },
  { value: "Italian", label: "Italian" },
  { value: "Ukrainian", label: "Ukrainian" },
  { value: "Russian", label: "Russian" },
  { value: "Chinese", label: "Chinese" },
  { value: "Hindi", label: "Hindi" },
  { value: "Arabic", label: "Arabic" },
  { value: "Bengali", label: "Bengali" },
  { value: "Urdu", label: "Urdu" },
  { value: "Indonesian", label: "Indonesian" },
  { value: "Japanese", label: "Japanese" },
  { value: "Marathi", label: "Marathi" },
  { value: "Telugu", label: "Telugu" },
  { value: "Turkish", label: "Turkish" },
  { value: "Tamil", label: "Tamil" },
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "Korean", label: "Korean" },
]

export function PersonalStep({ formData, updateFormData, onContinue, onBack }: PersonalStepProps) {
  const [fullName, setFullName] = useState(formData.fullName)
  const [dateOfBirth, setDateOfBirth] = useState(formData.dateOfBirth)
  const [country, setCountry] = useState(formData.country)
  const [languages, setLanguages] = useState<string[]>(
    Array.isArray(formData.language) ? formData.language : formData.language ? [formData.language] : [],
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter languages based on search term
  const filteredLanguages = LANGUAGES.filter((language) =>
    language.label.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleLanguageToggle = (language: string) => {
    setLanguages((prev) => {
      if (prev.includes(language)) {
        return prev.filter((l) => l !== language)
      } else {
        return [...prev, language]
      }
    })
  }

  const handleLanguageRemove = (language: string) => {
    setLanguages(languages.filter((l) => l !== language))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleContinue = () => {
    updateFormData({ fullName, dateOfBirth, country, language: languages })
    onContinue()
  }

  return (
    <FormSection
      title="Personal Details"
      description="When working with you, we entrust you with our clients' game data, in-game assets, and other confidential information. We also engage in financial transactions with you (during payouts). For security reasons, we need to know who we are working with, which is why full identification as a booster is required."
    >
      <div className="space-y-6 mt-6">
        <FormInput
          id="fullName"
          label="Your Name"
          placeholder="Firstname and Lastname"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          helperText="Introduce yourself by providing your full name."
        />
        <FormInput
          id="dateOfBirth"
          label="Date of Birth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
        />
        <SearchableSelect
          id="country"
          label="Country of Residence"
          value={country}
          onChange={setCountry}
          options={COUNTRIES}
          required
        />

        <div className="space-y-2">
          <label htmlFor="languages" className="flex items-center text-white">
            Languages of Communication <span className="text-[#E53E3E] ml-1">*</span>
          </label>
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center justify-between w-full px-4 py-3 bg-[#2D3748] border border-[#4A5568] rounded-md text-white cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{languages.length} languages selected</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform ${isDropdownOpen ? "transform rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-[#2D3748] border border-[#4A5568] rounded-md shadow-lg max-h-96 overflow-auto">
                <div className="sticky top-0 bg-[#2D3748] p-2 z-10 border-b border-[#4A5568]">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search languages..."
                    className="w-full px-3 py-2 bg-[#1A202C] border border-[#4A5568] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50"
                  />
                </div>
                <div className="py-1">
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map((language) => (
                      <div
                        key={language.value}
                        className="flex items-center px-4 py-3 hover:bg-[#4A5568] cursor-pointer text-white"
                        onClick={() => handleLanguageToggle(language.value)}
                      >
                        <Checkbox
                          checked={languages.includes(language.value)}
                          onCheckedChange={() => handleLanguageToggle(language.value)}
                          className="mr-3 data-[state=checked]:bg-[#E53E3E] data-[state=checked]:border-[#E53E3E] border-[#4A5568]"
                        />
                        <span>{language.label}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-400">No languages found</div>
                  )}
                </div>
                <div className="sticky bottom-0 bg-[#2D3748] p-2 border-t border-[#4A5568]">
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full py-2 bg-[#E53E3E] text-white rounded-md hover:bg-[#E53E3E]/90 transition-colors"
                  >
                    Done ({languages.length} selected)
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {languages.map((language) => (
              <div key={language} className="inline-flex items-center bg-[#2D3748] text-white rounded-md px-3 py-1">
                {language}
                <button
                  type="button"
                  onClick={() => handleLanguageRemove(language)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
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
            ))}
          </div>
        </div>
      </div>

      <FormButtons
        onContinue={handleContinue}
        onBack={onBack}
        disabled={!fullName || !dateOfBirth || !country || languages.length === 0}
      />
    </FormSection>
  )
}
