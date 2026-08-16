export type PropertyType = 'shop' | 'residential';

export type TenantStatus = 'active' | 'notice_given' | 'archived';

export type LedgerStatus = 'pending' | 'paid' | 'overdue' | 'partial';

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque';

export interface Landlord {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone_number: string;
  upi_id?: string;
  preferred_language?: 'hi' | 'en' | 'hinglish';
  is_pro_member?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  property_type: PropertyType;
  address?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
}

export interface Tenant {
  id: string;
  landlord_id: string;
  property_id: string;
  full_name: string;
  phone_number: string;
  unit_no: string;
  base_rent: number;
  due_day: number; // e.g. 1st of the month
  grace_period_days: number; // e.g. 10 days
  lease_start_date: string;
  lease_end_date: string;
  notice_period_months: number;
  status: TenantStatus;
  notice_given_date?: string;
  deleted_at?: string;
  created_at?: string;
}

export interface MonthlyLedger {
  id: string;
  landlord_id: string;
  tenant_id: string;
  month_year: string; // YYYY-MM e.g. '2026-08'
  amount_due: number;
  late_fee?: number;
  amount_paid: number;
  balance_due: number;
  total_payable?: number;
  due_date: string; // YYYY-MM-DD e.g. '2026-08-10'
  status: LedgerStatus;
  paid_date?: string;
  payment_mode?: PaymentMode;
  notes?: string;
  created_at?: string;
}
