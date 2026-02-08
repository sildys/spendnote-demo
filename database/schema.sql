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
-- CASH BOXES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cash_boxes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    color TEXT DEFAULT '#10b981' NOT NULL,
    icon TEXT DEFAULT 'building' NOT NULL,
    id_prefix TEXT DEFAULT 'REC-',
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
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.cash_boxes ENABLE ROW LEVEL SECURITY;

-- Cash boxes policies
CREATE POLICY "Users can view their own cash boxes" 
    ON public.cash_boxes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cash boxes" 
    ON public.cash_boxes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cash boxes" 
    ON public.cash_boxes FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cash boxes" 
    ON public.cash_boxes FOR DELETE 
    USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_cash_boxes_user_id ON public.cash_boxes(user_id);

-- =====================================================
-- CONTACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" 
    ON public.contacts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
    ON public.contacts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
    ON public.contacts FOR DELETE 
    USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts(name);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view their own transactions" 
    ON public.transactions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
    ON public.transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
    ON public.transactions FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
    ON public.transactions FOR DELETE 
    USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cash_box_id ON public.transactions(cash_box_id);
CREATE INDEX IF NOT EXISTS idx_transactions_contact_id ON public.transactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- =====================================================
-- TEAM MEMBERS TABLE (Pro only)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
    invited_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(owner_id, member_id)
);

-- =====================================================
-- CASH BOX ACCESS (Pro team feature)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cash_box_access (
    cash_box_id UUID REFERENCES public.cash_boxes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (cash_box_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_box_access ENABLE ROW LEVEL SECURITY;

-- Team members policies
CREATE POLICY "Owners can view their team members" 
    ON public.team_members FOR SELECT 
    USING (auth.uid() = owner_id OR auth.uid() = member_id);

CREATE POLICY "Owners can insert team members" 
    ON public.team_members FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update team members" 
    ON public.team_members FOR UPDATE 
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete team members" 
    ON public.team_members FOR DELETE 
    USING (auth.uid() = owner_id);

-- Cash box access policies
CREATE POLICY "Users can view their cash box access" 
    ON public.cash_box_access FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.cash_boxes 
            WHERE id = cash_box_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can grant cash box access" 
    ON public.cash_box_access FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cash_boxes 
            WHERE id = cash_box_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can revoke cash box access" 
    ON public.cash_box_access FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.cash_boxes 
            WHERE id = cash_box_id AND user_id = auth.uid()
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
