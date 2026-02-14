-- Migration 018: Auto-create default USD Cash Box for new users
-- This updates the handle_new_user() trigger function to automatically create
-- a default "Main Cash Box" with USD currency when a new user signs up.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_org_id uuid;
    v_cash_box_id uuid;
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

    -- Create organization
    INSERT INTO public.organizations (owner_user_id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Organization'))
    RETURNING id INTO v_org_id;

    -- Add user to organization as owner
    INSERT INTO public.org_memberships (org_id, user_id, role)
    VALUES (v_org_id, NEW.id, 'owner');

    -- Create default USD Cash Box
    INSERT INTO public.cash_boxes (
        user_id,
        org_id,
        name,
        currency,
        color,
        icon,
        current_balance,
        sequence_number
    )
    VALUES (
        NEW.id,
        v_org_id,
        'Main Cash Box',
        'USD',
        '#059669',
        'building',
        0,
        1
    )
    RETURNING id INTO v_cash_box_id;

    -- Grant user access to the cash box
    INSERT INTO public.cash_box_memberships (cash_box_id, user_id)
    VALUES (v_cash_box_id, NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
