import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface ConferenceRegistration {
  id?: string
  created_at?: string
  full_name: string
  email: string
  phone_number: string
  age: string
  is_grm_member: boolean
  grm_branch?: string
  church_name?: string
  wants_to_exhibit: boolean
  exhibition_description?: string
}

// Registration service functions
export const registrationService = {
  // Save registration data
  async saveRegistration(data: Omit<ConferenceRegistration, 'id' | 'created_at'>) {
    try {
      const { data: result, error } = await supabase
        .from('conference_registrations')
        .insert([data])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Failed to save registration: ${error.message}`)
      }

      return { success: true, data: result }
    } catch (error) {
      console.error('Registration save error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Get all registrations (for admin use)
  async getAllRegistrations() {
    try {
      const { data, error } = await supabase
        .from('conference_registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch registrations: ${error.message}`)
      }

      return { success: true, data }
    } catch (error) {
      console.error('Fetch registrations error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Check if email already exists
  async checkEmailExists(email: string) {
    try {
      const { data, error } = await supabase
        .from('conference_registrations')
        .select('id')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to check email: ${error.message}`)
      }

      return { success: true, exists: !!data }
    } catch (error) {
      console.error('Email check error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }
}
