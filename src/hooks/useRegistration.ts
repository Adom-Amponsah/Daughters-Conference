import { useState } from 'react'
import { registrationService, type ConferenceRegistration } from '../lib/supabase'

export interface RegistrationFormData {
  fullName: string
  email: string
  phoneNumber: string
  age: string
  isGrmMember: boolean
  grmBranch?: string
  churchName?: string
  wantsToExhibit: boolean
  exhibitionDescription?: string
}

export const useRegistration = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitRegistration = async (formData: RegistrationFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if email already exists
      const emailCheck = await registrationService.checkEmailExists(formData.email)
      
      if (!emailCheck.success) {
        throw new Error(emailCheck.error || 'Failed to verify email')
      }

      if (emailCheck.exists) {
        throw new Error('This email is already registered for the conference')
      }

      // Prepare data for Supabase
      const registrationData: Omit<ConferenceRegistration, 'id' | 'created_at'> = {
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        age: formData.age,
        is_grm_member: formData.isGrmMember,
        grm_branch: formData.isGrmMember ? formData.grmBranch : undefined,
        church_name: !formData.isGrmMember ? formData.churchName : undefined,
        wants_to_exhibit: formData.wantsToExhibit,
        exhibition_description: formData.wantsToExhibit ? formData.exhibitionDescription : undefined,
      }

      // Save to Supabase
      const result = await registrationService.saveRegistration(registrationData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to save registration')
      }

      return {
        success: true,
        data: result.data,
        message: 'Registration completed successfully!'
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    submitRegistration,
    isLoading,
    error,
    clearError
  }
}
