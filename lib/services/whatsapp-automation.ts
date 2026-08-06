import { Tenant, MonthlyLedger, Landlord } from '../types/database';

export interface WhatsAppAutoConfig {
  autoSendEnabled: boolean;
  scheduledHour: number; // e.g. 9 for 9:00 AM
  metaPhoneNumberId?: string;
  metaAccessToken?: string;
  templateLanguage: 'hi' | 'en' | 'hinglish';
}

const CONFIG_KEY = 'pm_whatsapp_auto_config';

class WhatsAppAutomationService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  getConfig(): WhatsAppAutoConfig {
    if (!this.isBrowser()) {
      return { autoSendEnabled: true, scheduledHour: 9, templateLanguage: 'hi' };
    }
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) {
      const defaultConfig: WhatsAppAutoConfig = {
        autoSendEnabled: true,
        scheduledHour: 9,
        templateLanguage: 'hi',
      };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
      return defaultConfig;
    }
    return JSON.parse(stored);
  }

  saveConfig(config: WhatsAppAutoConfig): WhatsAppAutoConfig {
    if (this.isBrowser()) {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    }
    return config;
  }

  // Trigger Automatic WhatsApp Message (via Meta Cloud API or Click-to-Chat Dispatcher)
  async triggerAutoReminder(
    tenant: Tenant,
    ledger: MonthlyLedger,
    landlord: Landlord,
    type: 'overdue' | 'receipt' | 'next_month' | 'reminder'
  ): Promise<{ success: boolean; mode: 'meta_api' | 'wa_me_auto'; message: string }> {
    const config = this.getConfig();
    const upiId = landlord.upi_id || 'sirisha.amma@upi';
    const owner = landlord.full_name || 'Sirisha Amma';
    const baseRent = tenant.base_rent;
    const lateFee = ledger.late_fee || 0;
    const totalPayable = baseRent + lateFee;

    let text = '';
    if (type === 'overdue') {
      text = `नमस्ते ${tenant.full_name} जी 🙏\n\nअति आवश्यक: ${tenant.unit_no} का August किराया ₹${baseRent} देय तिथि (${ledger.due_date}) से बिलंब हो गया है।\n\nLate Fine: +₹${lateFee > 0 ? lateFee : 500}\nकुल देय: ₹${totalPayable}\n\nPay via UPI: ${upiId}\n- ${owner}`;
    } else if (type === 'next_month') {
      text = `नमस्ते ${tenant.full_name} जी 🙏\n\nAugust किराया प्राप्त हो चुका है, धन्यवाद!\nSeptember 2026 किराया ₹${baseRent} (${tenant.unit_no}) की देय तिथि 10th October 2026 होगी।\n\nUPI: ${upiId}\n- ${owner}`;
    } else {
      text = `नमस्ते ${tenant.full_name} जी 🙏\n\nAugust किराया ₹${baseRent} (${tenant.unit_no}) की देय तिथि ${ledger.due_date} है।\nUPI: ${upiId}\n- ${owner}`;
    }

    // Check if Meta Cloud API keys are provided for true zero-click background sending
    if (config.metaPhoneNumberId && config.metaAccessToken) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${config.metaPhoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.metaAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: `91${tenant.phone_number.replace(/[^0-9]/g, '')}`,
              type: 'text',
              text: { body: text },
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          return { success: true, mode: 'meta_api', message: 'Auto-sent via WhatsApp Cloud API!' };
        }
      } catch (err) {
        console.error('Meta API Dispatch Error:', err);
      }
    }

    // Fallback mode: Trigger automated click-to-chat dispatch URL
    const cleanPhone = tenant.phone_number.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
    if (this.isBrowser()) {
      window.open(waUrl, '_blank');
    }

    return {
      success: true,
      mode: 'wa_me_auto',
      message: `Auto-dispatching WhatsApp chat for +91 ${cleanPhone}`,
    };
  }
}

export const whatsAppAutomation = new WhatsAppAutomationService();
