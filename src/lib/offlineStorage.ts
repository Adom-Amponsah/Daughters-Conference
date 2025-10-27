import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface RegistrationData {
  id: string;
  timestamp: string;
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

// LocalStorage key
const STORAGE_KEY = 'grm_conference_registrations';

// Save registration to localStorage
export const saveRegistrationOffline = (data: Omit<RegistrationData, 'id' | 'timestamp'>) => {
  try {
    const existingData = getOfflineRegistrations();
    
    const newRegistration: RegistrationData = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...data
    };
    
    const updatedData = [...existingData, newRegistration];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    
    console.log('✅ Registration saved offline:', newRegistration);
    return { success: true, data: newRegistration };
  } catch (error) {
    console.error('❌ Failed to save offline:', error);
    return { success: false, error: 'Failed to save registration offline' };
  }
};

// Get all offline registrations
export const getOfflineRegistrations = (): RegistrationData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Failed to load offline data:', error);
    return [];
  }
};

// Export to Excel
export const exportToExcel = () => {
  try {
    const registrations = getOfflineRegistrations();
    
    if (registrations.length === 0) {
      alert('No registrations to export!');
      return;
    }
    
    // Prepare data for Excel
    const excelData = registrations.map(reg => ({
      'Registration ID': reg.id,
      'Timestamp': new Date(reg.timestamp).toLocaleString(),
      'Full Name': reg.fullName,
      'Email': reg.email,
      'Phone Number': reg.phoneNumber,
      'Age': reg.age,
      'GRM Member': reg.isGrmMember ? 'Yes' : 'No',
      'GRM Branch': reg.grmBranch || 'N/A',
      'Church Name': reg.churchName || 'N/A',
      'Wants to Exhibit': reg.wantsToExhibit ? 'Yes' : 'No',
      'Exhibition Description': reg.exhibitionDescription || 'N/A'
    }));
    
    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Download file
    const fileName = `GRM_Conference_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileName);
    
    console.log(`✅ Excel exported: ${fileName}`);
    return { success: true, fileName };
  } catch (error) {
    console.error('❌ Excel export failed:', error);
    return { success: false, error: 'Failed to export Excel file' };
  }
};

// Clear all offline data
export const clearOfflineData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ Offline data cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to clear data:', error);
    return { success: false, error: 'Failed to clear offline data' };
  }
};

// Get registration count
export const getRegistrationCount = (): number => {
  return getOfflineRegistrations().length;
};

// Check if email exists offline
export const checkEmailExistsOffline = (email: string): boolean => {
  const registrations = getOfflineRegistrations();
  return registrations.some(reg => reg.email.toLowerCase() === email.toLowerCase());
};

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Export individual registration as CSV
export const exportSingleRegistrationCSV = (registration: RegistrationData) => {
  try {
    const csvContent = [
      'Field,Value',
      `Registration ID,${registration.id}`,
      `Timestamp,${new Date(registration.timestamp).toLocaleString()}`,
      `Full Name,${registration.fullName}`,
      `Email,${registration.email}`,
      `Phone Number,${registration.phoneNumber}`,
      `Age,${registration.age}`,
      `GRM Member,${registration.isGrmMember ? 'Yes' : 'No'}`,
      `GRM Branch,${registration.grmBranch || 'N/A'}`,
      `Church Name,${registration.churchName || 'N/A'}`,
      `Wants to Exhibit,${registration.wantsToExhibit ? 'Yes' : 'No'}`,
      `Exhibition Description,${registration.exhibitionDescription || 'N/A'}`
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `Registration_${registration.fullName.replace(/\s+/g, '_')}_${registration.id}.csv`;
    saveAs(blob, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('❌ CSV export failed:', error);
    return { success: false, error: 'Failed to export CSV file' };
  }
};
