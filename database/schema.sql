-- SpendNote Database Schema for Supabase
-- This file contains all table definitions and relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.gen_random_bytes(integer)
RETURNS bytea
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT extensions.gen_random_bytes($1);
$$;

CREATE OR REPLACE FUNCTION public.digest(text, text)
RETURNS bytea
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT extensions.digest(convert_to($1, 'utf8'), $2);
$$;

-- =====================================================
-- USERS TABLE (extends Supabase Auth)
-- =====================================================
-- Note: Supabase Auth already provides auth.users table
-- We create a public.profiles table for additional user data

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    company_name TEXT,
    phone TEXT,
    address TEXT,
    account_logo_url TEXT,
    logo_settings JSONB DEFAULT NULL,
    avatar_url TEXT,
    avatar_settings JSONB DEFAULT NULL,
    avatar_color TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'standard', 'pro')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- ORGS + MEMBERSHIPS TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orgs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'My Team',
    owner_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.org_memberships (
    org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (org_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_memberships ENABLE ROW LEVEL SECURITY;

-- orgs policies
CREATE POLICY "Org members can view org"
    ON public.orgs FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = orgs.id
              AND m.user_id = auth.uid()
        )
    );

CREATE POLICY "Org owner admin can update name"
    ON public.orgs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = orgs.id
              AND m.user_id = auth.uid()
              AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = orgs.id
              AND m.user_id = auth.uid()
              AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can view own org memberships"
    ON public.org_memberships FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage org memberships"
    ON public.org_memberships FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = org_memberships.org_id
              AND m.user_id = auth.uid()
              AND lower(coalesce(m.role, '')) = 'owner'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.org_memberships m
            WHERE m.org_id = org_memberships.org_id
              AND m.user_id = auth.uid()
              AND lower(coalesce(m.role, '')) = 'owner'
        )
    );

-- =====================================================
-- CASH BOXES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cash_boxes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    color TEXT DEFAULT '#10b981' NOT NULL,
    icon TEXT DEFAULT 'building' NOT NULL,
    id_prefix TEXT DEFAULT 'SN',
    current_balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    
    -- Receipt settings (Standard+)
    receipt_show_logo BOOLEAN DEFAULT true,
    receipt_show_addresses BOOLEAN DEFAULT true,
    receipt_show_tracking BOOLEAN DEFAULT true,
    receipt_show_additional BOOLEAN DEFAULT true,
    receipt_show_note BOOLEAN DEFAULT true,
    receipt_show_signatures BOOLEAN DEFAULT true,
    
    -- Receipt custom text (Pro only)
    receipt_title TEXT,
    receipt_total_label TEXT,
    receipt_from_label TEXT,
    receipt_to_label TEXT,
    receipt_description_label TEXT,
    receipt_amount_label TEXT,
    receipt_notes_label TEXT,
    receipt_issued_by_label TEXT,
    receipt_received_by_label TEXT,
    receipt_footer_note TEXT,
    
    -- Cash box logo (Pro only)
    cash_box_logo_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.cash_boxes ENABLE ROW LEVEL SECURITY;

-- Cash boxes policies
CREATE POLICY "Users can view their own cash boxes" 
    ON public.cash_boxes FOR SELECT 
    USING (
        auth.uid() = user_id
        OR (
            org_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.org_memberships m
                WHERE m.org_id = cash_boxes.org_id
                  AND m.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert their own cash boxes" 
    ON public.cash_boxes FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id
        OR (
            org_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.org_memberships m
                WHERE m.org_id = cash_boxes.org_id
                  AND m.user_id = auth.uid()
                  AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
            )
        )
    );

CREATE POLICY "Users can update their own cash boxes" 
    ON public.cash_boxes FOR UPDATE 
    USING (
        auth.uid() = user_id
        OR (
            org_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.org_memberships m
                WHERE m.org_id = cash_boxes.org_id
                  AND m.user_id = auth.uid()
                  AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
            )
        )
    );

CREATE POLICY "Users can delete their own cash boxes" 
    ON public.cash_boxes FOR DELETE 
    USING (
        auth.uid() = user_id
        OR (
            org_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.org_memberships m
                WHERE m.org_id = cash_boxes.org_id
                  AND m.user_id = auth.uid()
                  AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
            )
        )
    );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_cash_boxes_user_id ON public.cash_boxes(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_boxes_org_id ON public.cash_boxes(org_id);

CREATE TABLE IF NOT EXISTS public.cash_box_memberships (
    cash_box_id UUID REFERENCES public.cash_boxes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (cash_box_id, user_id)
);

-- =====================================================
-- CONTACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Contacts policies
CREATE POLICY "Users can view their own contacts" 
    ON public.contacts FOR SELECT 
    USING (
        auth.uid() = user_id
        OR (
            org_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.org_memberships m
                WHERE m.org_id = contacts.org_id
                  AND m.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert their own contacts" 
    ON public.contacts FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id
        OR (
            org_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.org_memberships m
                WHERE m.org_id = contacts.org_id
                  AND m.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own contacts" 
    ON public.contacts FOR UPDATE 
    USING (
        auth.uid() = user_id
        OR (
            org_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.org_memberships m
                WHERE m.org_id = contacts.org_id
                  AND m.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete their own contacts" 
    ON public.contacts FOR DELETE 
    USING (
        auth.uid() = user_id
        OR (
            org_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.org_memberships m
                WHERE m.org_id = contacts.org_id
                  AND m.user_id = auth.uid()
            )
        )
    );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts(name);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
    cash_box_id UUID REFERENCES public.cash_boxes(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    notes TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_number TEXT,
    
    -- Line items for receipts (JSONB array, max 5 items)
    -- Format: [{"description": "Item 1", "amount": 100.00}, ...]
    -- Stored for receipt reprinting
    line_items JSONB DEFAULT '[]'::jsonb,
    
    -- Contact snapshot (for receipt regeneration)
    contact_name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    contact_address TEXT,
    contact_custom_field_1 TEXT,
    contact_custom_field_2 TEXT,
    
    -- Created by (for team tracking)
    created_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by_user_name TEXT,

    -- Cash box snapshot (immutable context for historical rendering)
    cash_box_name_snapshot TEXT,
    cash_box_currency_snapshot TEXT,
    cash_box_color_snapshot TEXT,
    cash_box_icon_snapshot TEXT,
    cash_box_id_prefix_snapshot TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view their own transactions" 
    ON public.transactions FOR SELECT 
    USING (
        auth.uid() = user_id
        OR (
            org_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.org_memberships m
                WHERE m.org_id = transactions.org_id
                  AND m.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert their own transactions" 
    ON public.transactions FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id
        OR (
            org_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.org_memberships m
                WHERE m.org_id = transactions.org_id
                  AND m.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own transactions" 
    ON public.transactions FOR UPDATE 
    USING (
        auth.uid() = user_id
        OR (
            org_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.org_memberships m
                WHERE m.org_id = transactions.org_id
                  AND m.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete their own transactions" 
    ON public.transactions FOR DELETE 
    USING (
        auth.uid() = user_id
        OR (
            org_id IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.org_memberships m
                WHERE m.org_id = transactions.org_id
                  AND m.user_id = auth.uid()
            )
        )
    );

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org_id ON public.transactions(org_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cash_box_id ON public.transactions(cash_box_id);
CREATE INDEX IF NOT EXISTS idx_transactions_contact_id ON public.transactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- NOTE: Legacy tables `team_members` and `cash_box_access` are intentionally
-- not part of the canonical schema anymore. Org/team access is modeled by
-- `org_memberships` + `cash_box_memberships`.

-- =====================================================
-- AUDIT LOG (AUDIT-H4)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid REFERENCES public.orgs(id) ON DELETE CASCADE,
    actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    target_type text,
    target_id uuid,
    meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_org_id ON public.audit_log(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_org_created ON public.audit_log(org_id, created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Owner-only read
CREATE POLICY "audit_log_owner_select" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.org_memberships m
            WHERE m.org_id = audit_log.org_id
              AND m.user_id = auth.uid()
              AND lower(coalesce(m.role, '')) = 'owner'
        )
    );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_boxes_updated_at BEFORE UPDATE ON public.cash_boxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Prevent immutable cash box identity fields from changing after creation
CREATE OR REPLACE FUNCTION public.lock_cash_box_identity_fields()
RETURNS TRIGGER AS $$
DECLARE
    old_currency TEXT;
    new_currency TEXT;
    old_prefix TEXT;
    new_prefix TEXT;
BEGIN
    old_currency := COALESCE(NULLIF(upper(trim(OLD.currency)), ''), 'USD');
    new_currency := COALESCE(NULLIF(upper(trim(NEW.currency)), ''), 'USD');

    old_prefix := COALESCE(NULLIF(upper(trim(OLD.id_prefix)), ''), 'SN');
    new_prefix := COALESCE(NULLIF(upper(trim(NEW.id_prefix)), ''), 'SN');
    IF old_prefix = 'REC-' THEN old_prefix := 'SN'; END IF;
    IF new_prefix = 'REC-' THEN new_prefix := 'SN'; END IF;

    IF new_currency IS DISTINCT FROM old_currency THEN
        RAISE EXCEPTION 'cash_boxes.currency is immutable after creation';
    END IF;

    IF new_prefix IS DISTINCT FROM old_prefix THEN
        RAISE EXCEPTION 'cash_boxes.id_prefix is immutable after creation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lock_cash_box_identity_fields_trigger
    BEFORE UPDATE ON public.cash_boxes
    FOR EACH ROW EXECUTE FUNCTION public.lock_cash_box_identity_fields();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update cash box balance when transaction is inserted/updated/deleted
CREATE OR REPLACE FUNCTION update_cash_box_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        -- Revert the old transaction
        IF OLD.type = 'income' THEN
            UPDATE public.cash_boxes 
            SET current_balance = current_balance - OLD.amount 
            WHERE id = OLD.cash_box_id;
        ELSE
            UPDATE public.cash_boxes 
            SET current_balance = current_balance + OLD.amount 
            WHERE id = OLD.cash_box_id;
        END IF;
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Revert the old transaction
        IF OLD.type = 'income' THEN
            UPDATE public.cash_boxes 
            SET current_balance = current_balance - OLD.amount 
            WHERE id = OLD.cash_box_id;
        ELSE
            UPDATE public.cash_boxes 
            SET current_balance = current_balance + OLD.amount 
            WHERE id = OLD.cash_box_id;
        END IF;
        -- Apply the new transaction
        IF NEW.type = 'income' THEN
            UPDATE public.cash_boxes 
            SET current_balance = current_balance + NEW.amount 
            WHERE id = NEW.cash_box_id;
        ELSE
            UPDATE public.cash_boxes 
            SET current_balance = current_balance - NEW.amount 
            WHERE id = NEW.cash_box_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        -- Apply the new transaction
        IF NEW.type = 'income' THEN
            UPDATE public.cash_boxes 
            SET current_balance = current_balance + NEW.amount 
            WHERE id = NEW.cash_box_id;
        ELSE
            UPDATE public.cash_boxes 
            SET current_balance = current_balance - NEW.amount 
            WHERE id = NEW.cash_box_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update cash box balance
CREATE TRIGGER update_cash_box_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_cash_box_balance();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
