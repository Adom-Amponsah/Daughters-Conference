// Email Service using EmailJS (FREE)
import emailjs from '@emailjs/browser';
import type { RegistrationFormData } from '../hooks/useOfflineRegistration';

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private serviceId: string;
  private templateId: string;
  private publicKey: string;

  constructor() {
    // These will be set in your .env file
    this.serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    this.templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    this.publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
    
    // Initialize EmailJS
    if (this.publicKey) {
      emailjs.init(this.publicKey);
    }
  }

  // Send registration confirmation email
  async sendRegistrationConfirmation(registrationData: RegistrationFormData): Promise<EmailResult> {
    try {
      // Only send if user has email
      if (!registrationData.hasEmail || !registrationData.email) {
        return {
          success: true, // Not an error, just no email to send
          messageId: 'no-email-provided'
        };
      }

      // Prepare email template parameters (minimal data since template doesn't show personal details)
      const templateParams = {
        to_email: registrationData.email,
        to_name: registrationData.fullName,
        from_name: 'Daughters & Builders Conference',
        subject: '🎉 Registration Confirmed - Daughters & Builders Conference 2025',
        
        // These are kept for EmailJS requirements but not displayed in template
        full_name: registrationData.fullName,
        email: registrationData.email,
        phone: registrationData.phoneNumber,
        age: registrationData.age,
        is_grm_member: registrationData.isGrmMember ? 'Yes' : 'No',
        grm_branch: registrationData.isGrmMember ? registrationData.grmBranch : 'N/A',
        church_name: !registrationData.isGrmMember ? registrationData.churchName : 'N/A',
        wants_to_exhibit: registrationData.wantsToExhibit ? 'Yes' : 'No',
        exhibition_description: registrationData.wantsToExhibit ? registrationData.exhibitionDescription : 'N/A',
        event_name: 'Daughters & Builders Conference 2025',
        event_date: '[Event Date - Update This]',
        event_time: '[Event Time - Update This]',
        event_venue: '[Event Venue - Update This]',
        contact_info: '[Contact Info - Update This]',
        custom_message: 'Thank you for registering!',
      };

      // Send email via EmailJS
      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      return {
        success: true,
        messageId: response.text,
      };

    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  // Create custom message based on registration details
  // private createCustomMessage(data: RegistrationFormData): string {
  //   let message = `Dear ${data.fullName},\n\nThank you for registering for the Daughters & Builders Conference 2025!\n\n`;
    
  //   if (data.isGrmMember) {
  //     message += `We're excited to have you as a GRM member from ${data.grmBranch} branch.\n\n`;
  //   } else {
  //     message += `We're excited to have you representing ${data.churchName}.\n\n`;
  //   }
    
  //   if (data.wantsToExhibit) {
  //     message += `🎪 EXHIBITION: You've registered to exhibit! We'll contact you soon with exhibition details.\n\n`;
  //   }
    
  //   message += `Please save this email as your registration confirmation.\n\nSee you at the conference!\n\nBlessings,\nDaughters & Builders Conference Team`;
    
  //   return message;
  // }

  // Send event reminder email (for later use)
  async sendEventReminder(email: string, name: string): Promise<EmailResult> {
    try {
      const templateParams = {
        to_email: email,
        to_name: name,
        from_name: 'Daughters & Builders Conference',
        subject: '🔔 Reminder: Conference Tomorrow!',
        
        reminder_message: `Hi ${name}!\n\nThis is a friendly reminder that the Daughters & Builders Conference 2025 is tomorrow!\n\nDon't forget to bring:\n• Your registration confirmation\n• Notebook and pen\n• Your excitement!\n\nSee you there!\n\nBlessings,\nConference Team`
      };

      const response = await emailjs.send(
        this.serviceId,
        'reminder_template', // You'd create a separate template for reminders
        templateParams
      );

      return {
        success: true,
        messageId: response.text,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send reminder',
      };
    }
  }

  // Test email configuration
  async testEmailSetup(): Promise<EmailResult> {
    try {
      const testParams = {
        to_email: 'test@example.com',
        to_name: 'Test User',
        from_name: 'Conference Test',
        subject: 'Test Email',
        message: 'This is a test email to verify EmailJS setup.'
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        testParams
      );

      return {
        success: true,
        messageId: response.text,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email test failed',
      };
    }
  }
}

export const emailService = new EmailService();
