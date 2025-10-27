import { useState } from 'react';
import { 
  saveRegistrationOffline, 
  checkEmailExistsOffline, 
  exportToExcel,
  getRegistrationCount
} from '../lib/offlineStorage';
import { registrationService } from '../lib/supabase';

export interface RegistrationFormData {
  fullName: string;
  email: string;
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

  // Check online status
  const checkConnection = async () => {
    try {
      const response = await fetch('/ping', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      setIsOnline(response.ok);
      return response.ok;
    } catch {
      setIsOnline(false);
      return false;
    }
  };

  const submitRegistration = async (formData: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if email already exists offline
      if (checkEmailExistsOffline(formData.email)) {
        throw new Error('This email is already registered offline');
      }

      // Try online first if we think we're online
      if (isOnline) {
        try {
          // Check online email existence
          const emailCheck = await registrationService.checkEmailExists(formData.email);
          
          if (!emailCheck.success) {
            throw new Error('Connection lost - saving offline');
          }

          if (emailCheck.exists) {
            throw new Error('This email is already registered online');
          }

          // Try to save online
          const registrationData = {
            full_name: formData.fullName,
            email: formData.email,
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
            return {
              success: true,
              data: result.data,
              message: '✅ Registration saved online successfully!',
              isOffline: false
            };
          } else {
            throw new Error('Online save failed - switching to offline');
          }
        } catch (onlineError) {
          console.log('Online failed, switching to offline:', onlineError);
          setIsOnline(false);
        }
      }

      // Save offline (fallback or if offline)
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
