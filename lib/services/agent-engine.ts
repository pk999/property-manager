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

    const upiId = landlord?.upi_id || 'sirisha.amma@upi';
    const ownerName = landlord?.full_name || 'Landlord';

    const batchReminders = pendingOrPartialLedgers.map(l => {
      const tenant = tenants.find(t => t.id === l.tenant_id);
      const cleanPhone = tenant ? tenant.phone_number.replace(/[^0-9]/g, '') : '';
      const balance = l.balance_due !== undefined ? l.balance_due : l.amount_due;

      const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&am=${balance}&pn=${encodeURIComponent(ownerName)}&cu=INR`;
      const messageText = `Namaste ${tenant?.full_name || 'ji'} 🙏\n\nOfficial Rent Statement for ${tenant?.unit_no || 'Shop'}.\nPending Rent Balance: ₹${balance.toLocaleString('en-IN')}.\n\nDirect UPI (0% Fee):\n${upiId}\n\nPay Direct UPI Link:\n${upiDeepLink}\n\n- ${ownerName}`;

      const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(messageText)}`;

      return {
        tenant: tenant || ({ id: 'unknown', full_name: 'Tenant', phone_number: '', unit_no: 'Unit', base_rent: l.amount_due } as Tenant),
        ledger: l,
        whatsappUrl,
        upiDeepLink,
        messageText,
      };
    });

    const hasActionRequired = totalActionUnits > 0;
    const alertHeadline = hasActionRequired
      ? `Digital Rental Agent: Rent for ${totalActionUnits} property units is pending`
      : `Digital Rental Agent: All August rent collections are 100% complete!`;

    const alertSubtext = hasActionRequired
      ? `Total Pending Balance: ₹${totalBalanceDue.toLocaleString('en-IN')}. Shall I prepare the 1-tap WhatsApp reminders?`
      : `No pending balances for August 2026. Automated next month ledgers scheduled.`;

    const actionButtonText = hasActionRequired
      ? `Prepare 1-Tap Reminders (${totalActionUnits})`
      : `View Collected Ledgers`;

    return {
      hasActionRequired,
      pendingCount,
      overdueCount,
      partialCount,
      totalBalanceDue,
      alertHeadline,
      alertSubtext,
      actionButtonText,
      batchReminders,
    };
  }
}

export const agentEngine = new AgentEngineService();
