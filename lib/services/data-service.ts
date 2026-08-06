import { Landlord, Property, Tenant, MonthlyLedger } from '../types/database';
import { DEMO_LANDLORD, INITIAL_PROPERTIES, INITIAL_TENANTS, INITIAL_LEDGERS } from '../storage/mock-db';

const STORAGE_KEYS = {
  LANDLORD: 'pm_landlord_profile_v5',
  PROPERTIES: 'pm_properties_v5',
  TENANTS: 'pm_tenants_v5',
  LEDGERS: 'pm_ledgers_v5',
};

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
  getProperties(): Property[] {
    if (!this.isBrowser()) return INITIAL_PROPERTIES;
    const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
      return INITIAL_PROPERTIES;
    }
    return JSON.parse(stored);
  }

  addProperty(property: Omit<Property, 'id' | 'landlord_id' | 'created_at'>): Property {
    const properties = this.getProperties();
    if (properties.length >= 200) {
      throw new Error("Property limit (200) reached for zero-cost quota guard.");
    }
    const landlord = this.getLandlord();
    const newProperty: Property = {
      ...property,
      id: crypto.randomUUID(),
      landlord_id: landlord.id,
      created_at: new Date().toISOString(),
    };
    const updated = [newProperty, ...properties];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updated));
    }
    return newProperty;
  }

  // --- TENANTS ---
  getTenants(): Tenant[] {
    if (!this.isBrowser()) return INITIAL_TENANTS;
    const stored = localStorage.getItem(STORAGE_KEYS.TENANTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
      return INITIAL_TENANTS;
    }
    return JSON.parse(stored);
  }

  addTenant(tenant: Omit<Tenant, 'id' | 'landlord_id' | 'created_at'>): Tenant {
    const tenants = this.getTenants();
    if (tenants.length >= 1000) {
      throw new Error("Tenant limit (1,000) reached for zero-cost quota guard.");
    }
    const landlord = this.getLandlord();
    const newTenant: Tenant = {
      ...tenant,
      id: crypto.randomUUID(),
      landlord_id: landlord.id,
      created_at: new Date().toISOString(),
    };
    const updated = [newTenant, ...tenants];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(updated));
    }

    this.generateLedgerForTenant(newTenant);
    return newTenant;
  }

  updateTenant(id: string, updates: Partial<Tenant>): Tenant {
    const tenants = this.getTenants();
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
      const tenants = this.getTenants();
      const tenant = tenants.find(t => t.id === targetLedger.tenant_id);
      if (tenant) {
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
