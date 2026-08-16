-- =============================================================================
-- PROPERTYMANAGER DATABASE SCHEMA MIGRATION SCRIPT
-- Features: Multi-tenant RLS, IDOR/BOLA Protection, Strict 1-to-1 Unit Mapping, Partial Payments
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Landlords Table
CREATE TABLE IF NOT EXISTS public.landlords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    upi_id VARCHAR(100),
    is_pro_member BOOLEAN DEFAULT FALSE,
    preferred_language VARCHAR(10) DEFAULT 'hi' CHECK (preferred_language IN ('en', 'hi', 'hinglish')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES public.landlords(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL, -- e.g. "Sirisha Amma Commercial Complex"
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('shop', 'house', 'commercial', 'residential')),
    address VARCHAR(300),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Tenants Table & Strict 1-to-1 Unit Mapping Unique Index
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES public.landlords(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    unit_no VARCHAR(50) NOT NULL, -- e.g. "Shop 12" or "Flat 201"
    base_rent NUMERIC(10, 2) NOT NULL CHECK (base_rent >= 0 AND base_rent <= 10000000),
    due_day INT NOT NULL DEFAULT 1 CHECK (due_day BETWEEN 1 AND 28),
    grace_period_days INT NOT NULL DEFAULT 10 CHECK (grace_period_days BETWEEN 0 AND 30),
    lease_start_date DATE NOT NULL,
    lease_end_date DATE NOT NULL,
    notice_period_months INT DEFAULT 2 CHECK (notice_period_months BETWEEN 1 AND 6),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'notice_given', 'archived')),
    notice_given_date DATE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STRICT 1-TO-1 UNIT MAPPING: Prevent multiple active tenants under a single property unit
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_unit 
ON public.tenants (property_id, unit_no) 
WHERE (status != 'archived');

-- 4. Create Monthly Ledgers Table with Partial Payment Support
CREATE TABLE IF NOT EXISTS public.monthly_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES public.landlords(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    amount_due NUMERIC(10, 2) NOT NULL CHECK (amount_due >= 0 AND amount_due <= 10000000),
    late_fee NUMERIC(10, 2) DEFAULT 0 CHECK (late_fee >= 0),
    amount_paid NUMERIC(10, 2) DEFAULT 0 CHECK (amount_paid >= 0 AND amount_paid <= 10000000),
    balance_due NUMERIC(10, 2) DEFAULT 0 CHECK (balance_due >= 0),
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'partial')),
    paid_date DATE,
    payment_mode VARCHAR(20) CHECK (payment_mode IN ('cash', 'upi', 'bank_transfer', 'cheque')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Security Policies
ALTER TABLE public.landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_ledgers ENABLE ROW LEVEL SECURITY;

CREATE POLICY landlords_manage_own ON public.landlords 
    FOR ALL USING (auth.uid() = auth_user_id);

CREATE POLICY properties_manage_own ON public.properties 
    FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM public.landlords WHERE id = landlord_id));

CREATE POLICY tenants_manage_own ON public.tenants 
    FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM public.landlords WHERE id = landlord_id));

CREATE POLICY ledgers_manage_own ON public.monthly_ledgers 
    FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM public.landlords WHERE id = landlord_id));
