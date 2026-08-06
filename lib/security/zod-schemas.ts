import { z } from "zod";

export const LandlordSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters").max(100, "Name too long"),
  phone_number: z.string().regex(/^[0-9+ ]{10,15}$/, "Enter a valid phone number"),
  upi_id: z.string().max(100, "UPI ID too long").optional().or(z.literal("")),
  preferred_language: z.enum(["en", "hi"]).default("en"),
});

export const PropertySchema = z.object({
  title: z.string().min(2, "Property title required").max(150, "Title too long"),
  property_type: z.enum(["shop", "house", "commercial", "residential"]),
  address: z.string().max(300, "Address too long").optional().or(z.literal("")),
});

export const TenantSchema = z.object({
  property_id: z.string().uuid("Select a valid property"),
  full_name: z.string().min(2, "Tenant name required").max(100, "Name too long"),
  phone_number: z.string().regex(/^[0-9+ ]{10,15}$/, "Enter a valid 10-digit phone number"),
  unit_no: z.string().min(1, "Unit / Shop / Flat number required").max(50, "Unit number too long"),
  base_rent: z.number().min(0, "Rent cannot be negative").max(10000000, "Rent exceeds maximum limit"),
  due_day: z.number().int().min(1).max(28).default(1),
  grace_period_days: z.number().int().min(0).max(30).default(10),
  lease_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  lease_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  notice_period_months: z.number().int().min(1).max(6).default(2),
});

export const LedgerRecordSchema = z.object({
  tenant_id: z.string().uuid("Invalid tenant ID"),
  month_year: z.string().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM"),
  amount_due: z.number().min(0),
  status: z.enum(["paid", "pending", "overdue", "partially_paid"]),
  amount_paid: z.number().min(0).default(0),
  paid_date: z.string().optional().nullable(),
  payment_mode: z.enum(["upi", "cash", "bank_transfer", "other"]).optional().nullable(),
  notes: z.string().max(500, "Notes too long").optional().nullable(),
});
