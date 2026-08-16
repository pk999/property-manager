import { MonthlyLedger, Tenant, Landlord } from '../types/database';
import { dataService } from './data-service';

export interface AgentAlertSummary {
  hasActionRequired: boolean;
  pendingCount: number;
  overdueCount: number;
  partialCount: number;
  totalBalanceDue: number;
  alertHeadline: string;
  alertSubtext: string;
  actionButtonText: string;
  batchReminders: {
    tenant: Tenant;
    ledger: MonthlyLedger;
    whatsappUrl: string;
    upiDeepLink: string;
    messageText: string;
  }[];
}

class AgentEngineService {
  public auditAndGenerateAlerts(): AgentAlertSummary {
    const landlord = dataService.getLandlord();
    const tenants = dataService.getTenants(false);
    const ledgers = dataService.getLedgers();

    const pendingOrPartialLedgers = ledgers.filter(
      l => l.status === 'pending' || l.status === 'overdue' || l.status === 'partial'
    );

    const pendingCount = pendingOrPartialLedgers.filter(l => l.status === 'pending').length;
    const overdueCount = pendingOrPartialLedgers.filter(l => l.status === 'overdue').length;
    const partialCount = pendingOrPartialLedgers.filter(l => l.status === 'partial').length;
    
    const totalBalanceDue = pendingOrPartialLedgers.reduce((sum, l) => sum + (l.balance_due || 0), 0);
    const totalActionUnits = pendingOrPartialLedgers.length;

    const upiId = landlord.upi_id || 'sirisha.amma@upi';
    const ownerName = landlord.full_name || 'Sirisha Amma';

    const batchReminders = pendingOrPartialLedgers.map(ledger => {
      const tenant = tenants.find(t => t.id === ledger.tenant_id);
      const cleanPhone = tenant ? tenant.phone_number.replace(/[^0-9]/g, '') : '';
      const amountPaid = ledger.amount_paid || 0;
      const balanceDue = ledger.balance_due || ledger.amount_due;
      const currentMonth = 'August 2026';
      const tenantName = tenant ? tenant.full_name : 'Tenant';
      const unitNo = tenant ? tenant.unit_no : 'Shop';

      // Standard Direct UPI Deep-Link
      const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&am=${balanceDue}&pn=${encodeURIComponent(ownerName)}&cu=INR`;

      let messageText = '';
      if (ledger.status === 'partial') {
        messageText = `Namaste ${tenantName} ji 🙏\n\nThank you for ₹${amountPaid.toLocaleString('en-IN')} received towards ${currentMonth} rent for ${unitNo}.\n\nGentle Reminder: Balance of ₹${balanceDue.toLocaleString('en-IN')} is pending.\n\nKindly clear via direct UPI (0% Fee):\n${upiId}\n\nPay Now Link:\n${upiDeepLink}\n\n- ${ownerName}`;
      } else if (ledger.status === 'overdue') {
        messageText = `Namaste ${tenantName} ji 🙏\n\nUrgent: Rent for ${unitNo} (${currentMonth}) is overdue.\n\nTotal Due (incl. Late Fine): ₹${balanceDue.toLocaleString('en-IN')}\n\nPlease transfer immediately via UPI:\n${upiId}\n\nPay Direct UPI Link:\n${upiDeepLink}\n\n- ${ownerName}`;
      } else {
        messageText = `Namaste ${tenantName} ji 🙏\n\nReminder: ${currentMonth} rent for ${unitNo} (₹${balanceDue.toLocaleString('en-IN')}) is due on ${ledger.due_date}.\n\nPay via Direct UPI (0% Fee):\n${upiId}\n\nPay Direct UPI Link:\n${upiDeepLink}\n\n- ${ownerName}`;
      }

      const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(messageText)}`;

      return {
        tenant: tenant!,
        ledger,
        whatsappUrl,
        upiDeepLink,
        messageText,
      };
    }).filter(item => item.tenant !== undefined);

    if (totalActionUnits === 0) {
      return {
        hasActionRequired: false,
        pendingCount: 0,
        overdueCount: 0,
        partialCount: 0,
        totalBalanceDue: 0,
        alertHeadline: "All Rents Collected! 🎉",
        alertSubtext: "All active tenant ledgers for August 2026 are fully cleared.",
        actionButtonText: "View Reminders Engine",
        batchReminders: [],
      };
    }

    return {
      hasActionRequired: true,
      pendingCount,
      overdueCount,
      partialCount,
      totalBalanceDue,
      alertHeadline: `Digital Rental Agent: Rent for ${totalActionUnits} property units is pending`,
      alertSubtext: `Total Pending Balance: ₹${totalBalanceDue.toLocaleString('en-IN')}. Shall I prepare the 1-tap WhatsApp reminders?`,
      actionButtonText: `Prepare 1-Tap Reminders (${totalActionUnits})`,
      batchReminders,
    };
  }
}

export const agentEngine = new AgentEngineService();
