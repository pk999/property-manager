import { Landlord, Property, Tenant, MonthlyLedger } from '../types/database';
import { DEMO_LANDLORD, INITIAL_PROPERTIES, INITIAL_TENANTS, INITIAL_LEDGERS } from '../storage/mock-db';

const STORAGE_KEYS = {
  LANDLORD: 'pm_landlord_profile_v6',
  PROPERTIES: 'pm_properties_v6',
  TENANTS: 'pm_tenants_v6',
  LEDGERS: 'pm_ledgers_v6',
};

export class QuotaExceededError extends Error {
  quotaType: 'property_limit' | 'tenant_limit';
  limit: number;

  constructor(message: string, quotaType: 'property_limit' | 'tenant_limit', limit: number) {
    super(message);
    this.name = 'QuotaExceededError';
    this.quotaType = quotaType;
    this.limit = limit;
  }
}

class DataService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // --- LATE FEE CALCULATOR HELPER ---
  public calculateLateFee(dueDateStr: string, baseRent: number): { lateFee: number; totalPayable: number; weeksLate: number } {
    const today = new Date('2026-08-20'); // Simulation date
    const dueDate = new Date(dueDateStr);
    const diffTime = today.getTime() - dueDate.getTime();
    const daysPastDue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (daysPastDue > 7) {
      const weeksLate = Math.floor((daysPastDue - 1) / 7);
      const lateFee = weeksLate * 500;
      return { lateFee, totalPayable: baseRent + lateFee, weeksLate };
    }

    return { lateFee: 0, totalPayable: baseRent, weeksLate: 0 };
  }

  // --- LANDLORD ---
  getLandlord(): Landlord {
    if (!this.isBrowser()) return DEMO_LANDLORD;
    const stored = localStorage.getItem(STORAGE_KEYS.LANDLORD);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.LANDLORD, JSON.stringify(DEMO_LANDLORD));
      return DEMO_LANDLORD;
    }
    return JSON.parse(stored);
  }

  updateLandlord(profile: Partial<Landlord>): Landlord {
    const current = this.getLandlord();
    const updated = { ...current, ...profile, updated_at: new Date().toISOString() };
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LANDLORD, JSON.stringify(updated));
    }
    return updated;
  }

  // --- PROPERTIES ---
  getProperties(includeInactive: boolean = true): Property[] {
    if (!this.isBrowser()) return INITIAL_PROPERTIES;
    const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    let properties: Property[] = [];
    if (!stored) {
      properties = INITIAL_PROPERTIES;
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    } else {
      properties = JSON.parse(stored);
    }
    return includeInactive ? properties : properties.filter(p => p.status !== 'inactive');
  }

  addProperty(property: Omit<Property, 'id' | 'landlord_id' | 'created_at'>): Property {
    const landlord = this.getLandlord();
    const properties = this.getProperties(true);
    
    // FREEMIUM RULE: Free tier allows max 2 properties unless Pro member
    if (!landlord.is_pro_member && properties.length >= 2) {
      throw new QuotaExceededError(
        "Free tier is limited to up to 2 properties. Upgrade to Pro for unlimited properties!",
        'property_limit',
        2
      );
    }

    const newProperty: Property = {
      ...property,
      id: crypto.randomUUID(),
      landlord_id: landlord.id,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    const updated = [newProperty, ...properties];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updated));
    }
    return newProperty;
  }

  togglePropertyStatus(id: string): Property {
    const properties = this.getProperties(true);
    const index = properties.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Property not found");

    const current = properties[index];
    const newStatus = current.status === 'inactive' ? 'active' : 'inactive';
    const updated = { ...current, status: newStatus as 'active' | 'inactive' };
    properties[index] = updated;

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    }
    return updated;
  }

  deleteProperty(id: string, archiveLinkedTenants: boolean = true): void {
    const properties = this.getProperties(true);
    const filtered = properties.filter(p => p.id !== id);

    if (archiveLinkedTenants) {
      const tenants = this.getTenants(true);
      const updatedTenants = tenants.map(t => {
        if (t.property_id === id) {
          return { ...t, status: 'archived' as const, deleted_at: new Date().toISOString() };
        }
        return t;
      });
      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(updatedTenants));
      }
    }

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(filtered));
    }
  }

  // --- TENANTS ---
  getTenants(includeArchived: boolean = false): Tenant[] {
    if (!this.isBrowser()) return includeArchived ? INITIAL_TENANTS : INITIAL_TENANTS.filter(t => t.status !== 'archived');
    const stored = localStorage.getItem(STORAGE_KEYS.TENANTS);
    let tenants: Tenant[] = [];
    if (!stored) {
      tenants = INITIAL_TENANTS;
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
    } else {
      tenants = JSON.parse(stored);
    }
    return includeArchived ? tenants : tenants.filter(t => t.status !== 'archived');
  }

  addTenant(tenant: Omit<Tenant, 'id' | 'landlord_id' | 'created_at'>): Tenant {
    const landlord = this.getLandlord();
    const allTenants = this.getTenants(true);
    const activePropertyTenants = allTenants.filter(t => t.property_id === tenant.property_id && t.status !== 'archived');

    // FREEMIUM RULE: Free tier allows max 3 tenants per property unless Pro member
    if (!landlord.is_pro_member && activePropertyTenants.length >= 3) {
      throw new QuotaExceededError(
        "Free tier is limited to up to 3 tenants per property. Upgrade to Pro for unlimited shops!",
        'tenant_limit',
        3
      );
    }

    const newTenant: Tenant = {
      ...tenant,
      id: crypto.randomUUID(),
      landlord_id: landlord.id,
      created_at: new Date().toISOString(),
    };
    const updated = [newTenant, ...allTenants];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(updated));
    }

    this.generateLedgerForTenant(newTenant);
    return newTenant;
  }

  updateTenant(id: string, updates: Partial<Tenant>): Tenant {
    const tenants = this.getTenants(true);
    const index = tenants.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Tenant not found or access denied.");
    
    const landlord = this.getLandlord();
    if (tenants[index].landlord_id !== landlord.id) {
      throw new Error("Security Violation: Access denied to tenant record.");
    }

    const updatedTenant = { ...tenants[index], ...updates };
    tenants[index] = updatedTenant;
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
    }
    return updatedTenant;
  }

  archiveTenant(id: string): Tenant {
    return this.updateTenant(id, {
      status: 'archived',
      deleted_at: new Date().toISOString(),
    });
  }

  reinstateTenant(id: string, newPropertyId: string, newUnitNo: string, newRent: number): Tenant {
    const landlord = this.getLandlord();
    const activeTenants = this.getTenants(false).filter(t => t.property_id === newPropertyId);

    if (!landlord.is_pro_member && activeTenants.length >= 3) {
      throw new QuotaExceededError(
        "Cannot reinstate. Selected property has reached the 3 tenant free tier limit. Upgrade to Pro!",
        'tenant_limit',
        3
      );
    }

    return this.updateTenant(id, {
      status: 'active',
      property_id: newPropertyId,
      unit_no: newUnitNo,
      base_rent: newRent,
      deleted_at: undefined,
    });
  }

  // --- MONTHLY LEDGERS ---
  getLedgers(): MonthlyLedger[] {
    if (!this.isBrowser()) return INITIAL_LEDGERS;
    const stored = localStorage.getItem(STORAGE_KEYS.LEDGERS);
    if (!stored) {
      const initialized = INITIAL_LEDGERS.map(l => {
        const { lateFee, totalPayable } = this.calculateLateFee(l.due_date, l.amount_due);
        return { ...l, late_fee: lateFee, total_payable: totalPayable };
      });
      localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(initialized));
      return initialized;
    }

    const ledgers: MonthlyLedger[] = JSON.parse(stored);
    return ledgers.map(l => {
      if (l.status === 'overdue' || l.status === 'pending') {
        const { lateFee, totalPayable } = this.calculateLateFee(l.due_date, l.amount_due);
        return { ...l, late_fee: lateFee, total_payable: totalPayable };
      }
      return { ...l, total_payable: l.amount_due + (l.late_fee || 0) };
    });
  }

  getTenantLedgerHistory(tenantId: string): MonthlyLedger[] {
    const ledgers = this.getLedgers();
    return ledgers.filter(l => l.tenant_id === tenantId);
  }

  updateLedger(id: string, updates: Partial<MonthlyLedger>): MonthlyLedger {
    const ledgers = this.getLedgers();
    const index = ledgers.findIndex(l => l.id === id);
    if (index === -1) throw new Error("Ledger entry not found");

    const landlord = this.getLandlord();
    if (ledgers[index].landlord_id !== landlord.id) {
      throw new Error("Security Violation: Access denied to ledger record.");
    }

    const targetLedger = ledgers[index];
    const updatedLedger = { ...targetLedger, ...updates };
    ledgers[index] = updatedLedger;

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(ledgers));
    }

    // AUTO-SCHEDULE NEXT MONTH LEDGER ON PAYMENT COMPLETION
    if (updates.status === 'paid') {
      const tenants = this.getTenants(true);
      const tenant = tenants.find(t => t.id === targetLedger.tenant_id);
      if (tenant && tenant.status !== 'archived') {
        this.generateNextMonthLedgerForTenant(tenant, targetLedger.month_year);
      }
    }

    return updatedLedger;
  }

  generateNextMonthLedgerForTenant(tenant: Tenant, currentMonthYear: string): MonthlyLedger {
    const [yearStr, monthStr] = currentMonthYear.split('-');
    let year = parseInt(yearStr);
    let month = parseInt(monthStr) + 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }

    // September rent due on 10th October!
    let dueMonth = month + 1;
    let dueYear = year;
    if (dueMonth > 12) {
      dueMonth = 1;
      dueYear += 1;
    }

    const nextMonthYear = `${year}-${String(month).padStart(2, '0')}`;
    const nextDueDate = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(tenant.grace_period_days || 10).padStart(2, '0')}`;
    
    const ledgers = this.getLedgers();
    const existing = ledgers.find(l => l.tenant_id === tenant.id && l.month_year === nextMonthYear);
    if (existing) return existing;

    const newLedger: MonthlyLedger = {
      id: crypto.randomUUID(),
      landlord_id: tenant.landlord_id,
      tenant_id: tenant.id,
      month_year: nextMonthYear,
      amount_due: tenant.base_rent,
      late_fee: 0,
      total_payable: tenant.base_rent,
      due_date: nextDueDate,
      status: 'pending',
      amount_paid: 0,
      created_at: new Date().toISOString(),
    };

    const updated = [newLedger, ...ledgers];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(updated));
    }
    return newLedger;
  }

  generateLedgerForTenant(tenant: Tenant): MonthlyLedger {
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const ledgers = this.getLedgers();

    const existing = ledgers.find(l => l.tenant_id === tenant.id && l.month_year === currentMonthYear);
    if (existing) return existing;

    const targetDate = new Date(now.getFullYear(), now.getMonth(), tenant.grace_period_days || 10);
    const dueDateStr = targetDate.toISOString().split('T')[0];

    const newLedger: MonthlyLedger = {
      id: crypto.randomUUID(),
      landlord_id: tenant.landlord_id,
      tenant_id: tenant.id,
      month_year: currentMonthYear,
      amount_due: tenant.base_rent,
      late_fee: 0,
      total_payable: tenant.base_rent,
      due_date: dueDateStr,
      status: 'pending',
      amount_paid: 0,
      created_at: new Date().toISOString(),
    };

    const updated = [newLedger, ...ledgers];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(updated));
    }
    return newLedger;
  }
}

export const dataService = new DataService();
