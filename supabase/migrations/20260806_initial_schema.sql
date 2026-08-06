-- =============================================================================
-- PROPERTYMANAGER DATABASE SCHEMA MIGRATION SCRIPT
-- Features: Multi-tenant RLS, IDOR/BOLA Protection, Storage Exhaustion Quota Guards
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
    preferred_language VARCHAR(5) DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES public.landlords(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL, -- e.g. "Gokul Dham Complex" or "Shop No. 4, Main Market"
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('shop', 'house', 'commercial', 'residential')),
    address VARCHAR(300),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Tenants Table
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
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'notice_given', 'vacated')),
    notice_given_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Monthly Ledgers Table
CREATE TABLE IF NOT EXISTS public.monthly_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id UUID NOT NULL REFERENCES public.landlords(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    amount_due NUMERIC(10, 2) NOT NULL CHECK (amount_due >= 0 AND amount_due <= 10000000),
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'partially_paid')),
    amount_paid NUMERIC(10, 2) DEFAULT 0 CHECK (amount_paid >= 0 AND amount_paid <= 10000000),
    paid_date DATE,
    payment_mode VARCHAR(20) CHECK (payment_mode IN ('upi', 'cash', 'bank_transfer', 'other')),
    notes VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_tenant_month_year UNIQUE(tenant_id, month_year)
);

-- INDEXES FOR HIGH-PERFORMANCE SECURITY SCOPED LOOKUPS
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON public.properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenants_landlord ON public.tenants(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property ON public.tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_landlord ON public.monthly_ledgers(landlord_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_tenant ON public.monthly_ledgers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_month_year ON public.monthly_ledgers(month_year);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES & QUOTA ENFORCEMENT
-- -----------------------------------------------------------------------------
ALTER TABLE public.landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_ledgers ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTION FOR CURRENT LANDLORD ID LOOKUP (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_current_landlord_id()
RETURNS UUID AS $$
  SELECT id FROM public.landlords WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS POLICIES FOR LANDLORDS
CREATE POLICY "Landlords can select own profile" ON public.landlords
    FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Landlords can update own profile" ON public.landlords
    FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Landlords can insert own profile" ON public.landlords
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- RLS POLICIES FOR PROPERTIES (Max 200 properties per landlord quota guard)
CREATE POLICY "Landlords view own properties" ON public.properties
    FOR SELECT USING (landlord_id = public.get_current_landlord_id());
CREATE POLICY "Landlords insert own properties" ON public.properties
    FOR INSERT WITH CHECK (
        landlord_id = public.get_current_landlord_id() AND
        (SELECT COUNT(*) FROM public.properties WHERE landlord_id = public.get_current_landlord_id()) < 200
    );
CREATE POLICY "Landlords update own properties" ON public.properties
    FOR UPDATE USING (landlord_id = public.get_current_landlord_id());
CREATE POLICY "Landlords delete own properties" ON public.properties
    FOR DELETE USING (landlord_id = public.get_current_landlord_id());

-- RLS POLICIES FOR TENANTS (Max 1000 tenants per landlord quota guard)
CREATE POLICY "Landlords view own tenants" ON public.tenants
    FOR SELECT USING (landlord_id = public.get_current_landlord_id());
CREATE POLICY "Landlords insert own tenants" ON public.tenants
    FOR INSERT WITH CHECK (
        landlord_id = public.get_current_landlord_id() AND
        (SELECT COUNT(*) FROM public.tenants WHERE landlord_id = public.get_current_landlord_id()) < 1000
    );
CREATE POLICY "Landlords update own tenants" ON public.tenants
    FOR UPDATE USING (landlord_id = public.get_current_landlord_id());
CREATE POLICY "Landlords delete own tenants" ON public.tenants
    FOR DELETE USING (landlord_id = public.get_current_landlord_id());

-- RLS POLICIES FOR MONTHLY LEDGERS
CREATE POLICY "Landlords view own ledgers" ON public.monthly_ledgers
    FOR SELECT USING (landlord_id = public.get_current_landlord_id());
CREATE POLICY "Landlords insert own ledgers" ON public.monthly_ledgers
    FOR INSERT WITH CHECK (landlord_id = public.get_current_landlord_id());
CREATE POLICY "Landlords update own ledgers" ON public.monthly_ledgers
    FOR UPDATE USING (landlord_id = public.get_current_landlord_id());
CREATE POLICY "Landlords delete own ledgers" ON public.monthly_ledgers
    FOR DELETE USING (landlord_id = public.get_current_landlord_id());
