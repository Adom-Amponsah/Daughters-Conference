import { useState } from 'react';
import { 
  saveRegistrationOffline, 
  checkEmailExistsOffline, 
  exportToExcel,
  getRegistrationCount
} from '../lib/offlineStorage';
import { registrationService } from '../lib/supabase';
import { emailService } from '../lib/emailService';

export interface RegistrationFormData {
  fullName: string;
  hasEmail: boolean;
  email?: string;
  phoneNumber: string;
  age: string;
  isGrmMember: boolean;
  grmBranch?: string;
  churchName?: string;
  wantsToExhibit: boolean;
  exhibitionDescription?: string;
}

export const useOfflineRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check online status by testing Supabase connection
  const checkConnection = async () => {
    try {
      // Test connection by trying to check email (quick operation)
      const testResult = await registrationService.checkEmailExists('test@test.com');
      const online = testResult.success || testResult.error !== 'Network error';
      setIsOnline(online);
      return online;
    } catch {
      setIsOnline(false);
      return false;
    }
  };

  const submitRegistration = async (formData: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if email already exists offline (only if they have email)
      if (formData.hasEmail && formData.email && checkEmailExistsOffline(formData.email)) {
        throw new Error('This email is already registered offline');
      }

      // Check internet connection first
      const connectionStatus = await checkConnection();
      
      // Try online first if we have internet connection
      if (connectionStatus) {
        try {
          // Check online email existence (only if they have email)
          if (formData.hasEmail && formData.email) {
            const emailCheck = await registrationService.checkEmailExists(formData.email);
            
            if (!emailCheck.success) {
              throw new Error('Connection lost - saving offline');
            }

            if (emailCheck.exists) {
              throw new Error('This email is already registered online');
            }
          }

          // Try to save online (only if email exists)
          const registrationData = {
            full_name: formData.fullName,
            email: formData.email || '', // Provide empty string if no email
            phone_number: formData.phoneNumber,
            age: formData.age,
            is_grm_member: formData.isGrmMember,
            grm_branch: formData.isGrmMember ? formData.grmBranch : undefined,
            church_name: !formData.isGrmMember ? formData.churchName : undefined,
            wants_to_exhibit: formData.wantsToExhibit,
            exhibition_description: formData.wantsToExhibit ? formData.exhibitionDescription : undefined,
          };

          const result = await registrationService.saveRegistration(registrationData);
          
          if (result.success) {
            // Try to send confirmation email
            if (formData.hasEmail && formData.email) {
              try {
                const emailResult = await emailService.sendRegistrationConfirmation(formData);
                if (emailResult.success) {
                  return {
                    success: true,
                    data: result.data,
                    message: `✅ Registration successful! Confirmation email sent to ${formData.email}`,
                    isOffline: false
                  };
                } else {
                  return {
                    success: true,
                    data: result.data,
                    message: `✅ Registration successful! (Email failed to send, but registration is complete)`,
                    isOffline: false
                  };
                }
              } catch (emailError) {
                console.error('Email sending failed:', emailError);
                return {
                  success: true,
                  data: result.data,
                  message: `✅ Registration successful! (Email failed to send, but registration is complete)`,
                  isOffline: false
                };
              }
            } else {
              return {
                success: true,
                data: result.data,
                message: `✅ Registration successful! Welcome ${formData.fullName}`,
                isOffline: false
              };
            }
          } else {
            throw new Error(result.error || 'Failed to save registration');
          }
        } catch (onlineError) {
          console.log('Online registration error:', onlineError);
          
          // Only go offline for actual network/connection errors
          const errorMessage = onlineError instanceof Error ? onlineError.message : String(onlineError);
          const isNetworkError = errorMessage.includes('fetch') || 
                                errorMessage.includes('network') || 
                                errorMessage.includes('Connection lost') ||
                                errorMessage.includes('Failed to fetch');
          
          if (isNetworkError) {
            console.log('Network error detected, switching to offline');
            setIsOnline(false);
          } else {
            // For non-network errors, throw them up to be handled normally
            throw onlineError;
          }
        }
      }

      // Only save offline if we're actually offline
      if (!connectionStatus) {
        const offlineResult = saveRegistrationOffline(formData);

        if (offlineResult.success) {
          return {
            success: true,
            data: offlineResult.data,
            message: `📱 Registration saved offline! (${getRegistrationCount()} total)`,
            isOffline: true
          };
        } else {
          throw new Error(offlineResult.error || 'Failed to save offline');
        }
      }

      // If we reach here, online registration failed but we have connection
      // This shouldn't happen, but if it does, show the actual error
      throw new Error('Online registration failed unexpectedly');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const exportRegistrations = () => {
    try {
      const result = exportToExcel();
      if (result && result.success) {
        return {
          success: true,
          message: `📊 Excel file downloaded: ${result.fileName}`
        };
      } else {
        throw new Error(result?.error || 'Export failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const getStats = () => {
    return {
      totalRegistrations: getRegistrationCount(),
      isOnline,
      canExport: getRegistrationCount() > 0
    };
  };

  const clearError = () => setError(null);

  return {
    submitRegistration,
    exportRegistrations,
    getStats,
    isLoading,
    error,
    isOnline,
    clearError,
    checkConnection
  };
};
