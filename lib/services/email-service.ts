export interface SignupNotificationPayload {
  fullName: string;
  email: string;
  authProvider: 'google' | 'email';
  createdAt: string;
}

class EmailNotificationService {
  private ADMIN_EMAIL = 'admin@propertymanager.in'; // Your Admin Notification Email

  async sendWelcomeEmailToLandlord(fullName: string, email: string): Promise<boolean> {
    console.log(`[EMAIL SERVICE] Sending Welcome Email to Landlord: ${fullName} <${email}>`);
    
    // In production with Resend / SendGrid / Supabase Auth Hooks:
    // await fetch('/api/email/welcome', { method: 'POST', body: JSON.stringify({ fullName, email }) });
    
    return true;
  }

  async sendAdminSignupNotification(payload: SignupNotificationPayload): Promise<boolean> {
    console.log(`[EMAIL SERVICE] Sending Admin Signup Notification to ${this.ADMIN_EMAIL}:`, payload);
    
    // In production with Resend / SendGrid:
    // await fetch('/api/email/admin-notify', { method: 'POST', body: JSON.stringify(payload) });

    return true;
  }
}

export const emailService = new EmailNotificationService();
