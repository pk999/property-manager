export type PropertyType = 'shop' | 'house' | 'commercial' | 'residential';
export type TenantStatus = 'active' | 'notice_given' | 'vacated';
export type LedgerStatus = 'paid' | 'pending' | 'overdue' | 'partially_paid';
export type PaymentMode = 'upi' | 'cash' | 'bank_transfer' | 'other';

export interface Landlord {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone_number: string;
  upi_id?: string;
  preferred_language: 'en' | 'hi';
  created_at?: string;
  updated_at?: string;
}

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  property_type: PropertyType;
  address?: string;
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
  due_day: number; // 1 to 28
  grace_period_days: number; // e.g. 10 days
  lease_start_date: string;
  lease_end_date: string;
  notice_period_months: number; // e.g. 2
  status: TenantStatus;
  notice_given_date?: string;
  created_at?: string;
}

export interface MonthlyLedger {
  id: string;
  landlord_id: string;
  tenant_id: string;
  month_year: string; // YYYY-MM
  amount_due: number;
  late_fee?: number; // ₹500 per week of delay after 7 days past grace period
  total_payable?: number; // amount_due + late_fee
  due_date: string;
  status: LedgerStatus;
  amount_paid: number;
  paid_date?: string;
  payment_mode?: PaymentMode;
  notes?: string;
  next_month_alert_sent?: boolean;
  created_at?: string;
}
