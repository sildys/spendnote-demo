-- Greenfield Studio demo seed for support@spendnote.app
-- Purpose: realistic screenshot data for SEO pages
-- Safe to re-run: uses fixed IDs and cleans only this demo org's seeded records.

DO $$
DECLARE
    v_owner_id uuid;
    v_emma_id uuid;
    v_alex_id uuid;
    v_org_id uuid;

    v_office_cash_box_id constant uuid := '4f8c1df6-6b8f-4fdb-97ef-78bd2f38f301';
    v_event_cash_box_id  constant uuid := 'd8e6bb85-d9ac-4b5c-9271-371866a18f02';
    v_coffee_cash_box_id constant uuid := '601f8f4e-424d-4201-a182-8cadf4de5b03';

    v_contact_staples_id         constant uuid := '3336f2b5-ebed-4a03-8251-753f47afec01';
    v_contact_parking_id         constant uuid := 'fdb4be89-b8bb-4d90-b7fd-e4fd474d8602';
    v_contact_snacks_id          constant uuid := '2f6f6cc5-c5bb-4c0f-b7d8-0af2e2ac6403';
    v_contact_alex_id            constant uuid := 'cd01f0c2-8190-43ff-a8e4-c2e1e4e5ec04';
    v_contact_owner_id           constant uuid := '2b9d285e-c5f2-4c50-a856-c8fa4bc28005';
    v_contact_cleaning_id        constant uuid := 'e1152a89-2f4a-4e7f-a4a5-3d589516f406';
    v_contact_taxi_id            constant uuid := '2f777892-b972-48fd-a7dd-966ef0015607';
    v_contact_client_refund_id   constant uuid := '8b38b412-aed8-4845-9ae2-4d8fcb498408';
    v_contact_event_booth_id     constant uuid := '3af23011-6d4a-4fd7-bf05-7fa80f8f7809';
    v_contact_temp_staff_id      constant uuid := 'f2ba8169-bd5d-48eb-bdb3-486503264e10';
    v_contact_event_sales_id     constant uuid := 'f6642c77-dd07-420b-a69f-06f35f472211';
    v_contact_event_catering_id  constant uuid := '82687d9c-e03a-4f4f-b344-d51347e22512';
    v_contact_event_return_id    constant uuid := 'ff855adc-036d-4f6e-a504-dff8bd44f013';
    v_contact_beans_id           constant uuid := '7c5e267e-95d8-4cd6-9cd4-a8c5b0ff8f14';
    v_contact_milk_id            constant uuid := '1060bcb2-cf0f-49f7-b35b-adf5b77da215';
    v_contact_coffee_team_id     constant uuid := '5d6cc1f8-c8b6-4f3f-baf0-c1baec3bc016';
    v_contact_coffee_repair_id   constant uuid := '9588efd8-7d00-4f5f-b000-79fe68f6d317';

    v_wrong_tx_id uuid;
    v_void_tx_id uuid;

    v_has_status boolean;
    v_has_is_system boolean;
    v_has_voided_at boolean;
    v_has_voided_by_user_id boolean;
    v_has_voided_by_user_name boolean;
    v_has_void_tx_id boolean;
    v_has_void_reason boolean;
    v_has_original_tx_id boolean;
    v_has_original_transaction_id boolean;
BEGIN
    -- 1) Resolve owner
    SELECT p.id
    INTO v_owner_id
    FROM public.profiles p
    WHERE lower(p.email) = 'support@spendnote.app'
    LIMIT 1;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'support@spendnote.app profile not found. Create/login this account first.';
    END IF;

    -- 2) Set demo owner/company identity for screenshots
    UPDATE public.profiles
    SET
        full_name = 'Daniel Reed',
        company_name = 'Greenfield Studio',
        address = '214 West 5th Street, Austin, TX 78701',
        phone = coalesce(phone, '+1 512-555-0184')
    WHERE id = v_owner_id;

    -- 3) Create/reuse org
    SELECT o.id
    INTO v_org_id
    FROM public.orgs o
    WHERE o.owner_user_id = v_owner_id
      AND o.name = 'Greenfield Studio'
    LIMIT 1;

    IF v_org_id IS NULL THEN
        INSERT INTO public.orgs (name, owner_user_id)
        VALUES ('Greenfield Studio', v_owner_id)
        RETURNING id INTO v_org_id;
    END IF;

    INSERT INTO public.org_memberships (org_id, user_id, role)
    VALUES (v_org_id, v_owner_id, 'owner')
    ON CONFLICT (org_id, user_id) DO UPDATE
    SET role = excluded.role;

    -- 4) Optional existing teammates (if these accounts already exist)
    SELECT p.id INTO v_emma_id
    FROM public.profiles p
    WHERE lower(p.email) IN ('emma.collins@greenfieldstudio.app', 'emma.collins@spendnote.app')
    LIMIT 1;

    SELECT p.id INTO v_alex_id
    FROM public.profiles p
    WHERE lower(p.email) IN ('alex.turner@greenfieldstudio.app', 'alex.turner@spendnote.app')
    LIMIT 1;

    IF v_emma_id IS NOT NULL THEN
        INSERT INTO public.org_memberships (org_id, user_id, role)
        VALUES (v_org_id, v_emma_id, 'admin')
        ON CONFLICT (org_id, user_id) DO UPDATE
        SET role = excluded.role;
    END IF;

    IF v_alex_id IS NOT NULL THEN
        INSERT INTO public.org_memberships (org_id, user_id, role)
        VALUES (v_org_id, v_alex_id, 'user')
        ON CONFLICT (org_id, user_id) DO UPDATE
        SET role = excluded.role;
    END IF;

    -- NOTE: Invite schema differs across environments (some require token_hash not null).
    -- Skip invite seeding here to keep this screenshot seed script portable.

    -- 5) Clean and recreate demo cash boxes (rerunnable)
    DELETE FROM public.cash_boxes WHERE id IN (v_office_cash_box_id, v_event_cash_box_id, v_coffee_cash_box_id);

    INSERT INTO public.cash_boxes (id, user_id, org_id, name, currency, color, icon, id_prefix, current_balance)
    VALUES
        (v_office_cash_box_id, v_owner_id, v_org_id, 'Office Petty Cash', 'USD', '#10b981', 'briefcase', 'SN', 500.00),
        (v_event_cash_box_id,  v_owner_id, v_org_id, 'Event Float', 'USD', '#f59e0b', 'calendar', 'SN', 1000.00),
        (v_coffee_cash_box_id, v_owner_id, v_org_id, 'Coffee Fund', 'USD', '#3b82f6', 'coffee', 'SN', 200.00);

    -- Access model: owner/admin all, Alex only Office Petty Cash
    INSERT INTO public.cash_box_memberships (cash_box_id, user_id)
    VALUES
        (v_office_cash_box_id, v_owner_id),
        (v_event_cash_box_id, v_owner_id),
        (v_coffee_cash_box_id, v_owner_id)
    ON CONFLICT (cash_box_id, user_id) DO NOTHING;

    IF v_emma_id IS NOT NULL THEN
        INSERT INTO public.cash_box_memberships (cash_box_id, user_id)
        VALUES
            (v_office_cash_box_id, v_emma_id),
            (v_event_cash_box_id, v_emma_id),
            (v_coffee_cash_box_id, v_emma_id)
        ON CONFLICT (cash_box_id, user_id) DO NOTHING;
    END IF;

    IF v_alex_id IS NOT NULL THEN
        INSERT INTO public.cash_box_memberships (cash_box_id, user_id)
        VALUES (v_office_cash_box_id, v_alex_id)
        ON CONFLICT (cash_box_id, user_id) DO NOTHING;
    END IF;

    -- 6) Contacts used by demo receipts/transactions
    DELETE FROM public.contacts
    WHERE id IN (
        v_contact_staples_id, v_contact_parking_id, v_contact_snacks_id, v_contact_alex_id,
        v_contact_owner_id, v_contact_cleaning_id, v_contact_taxi_id, v_contact_client_refund_id,
        v_contact_event_booth_id, v_contact_temp_staff_id, v_contact_event_sales_id,
        v_contact_event_catering_id, v_contact_event_return_id, v_contact_beans_id,
        v_contact_milk_id, v_contact_coffee_team_id, v_contact_coffee_repair_id
    );

    INSERT INTO public.contacts (id, user_id, org_id, name, email, address, notes)
    VALUES
        (v_contact_staples_id,       v_owner_id, v_org_id, 'Staples (Austin)', NULL, 'Austin, TX', 'Office supplies'),
        (v_contact_parking_id,       v_owner_id, v_org_id, 'Downtown Parking', NULL, 'Austin, TX', 'Client parking reimbursement'),
        (v_contact_snacks_id,        v_owner_id, v_org_id, 'Office Snack Shop', NULL, 'Austin, TX', 'Weekly snacks'),
        (v_contact_alex_id,          v_owner_id, v_org_id, 'Alex Turner', NULL, 'Austin, TX', 'Team member'),
        (v_contact_owner_id,         v_owner_id, v_org_id, 'Daniel Reed', 'support@spendnote.app', '214 West 5th Street, Austin, TX 78701', 'Owner deposit'),
        (v_contact_cleaning_id,      v_owner_id, v_org_id, 'BrightClean Supplies', NULL, 'Austin, TX', 'Cleaning products'),
        (v_contact_taxi_id,          v_owner_id, v_org_id, 'ATX Client Taxi', NULL, 'Austin, TX', 'Client meeting taxi'),
        (v_contact_client_refund_id, v_owner_id, v_org_id, 'Client Refund Desk', NULL, 'Austin, TX', 'Unused client cash returned'),
        (v_contact_event_booth_id,   v_owner_id, v_org_id, 'Booth Setup Supplies', NULL, 'Austin, TX', 'Event setup items'),
        (v_contact_temp_staff_id,    v_owner_id, v_org_id, 'Temp Staff Pool', NULL, 'Austin, TX', 'Temporary staff advance'),
        (v_contact_event_sales_id,   v_owner_id, v_org_id, 'Event Cash Sales', NULL, 'Austin, TX', 'Cash collected at event'),
        (v_contact_event_catering_id,v_owner_id, v_org_id, 'Event Catering Co', NULL, 'Austin, TX', 'Catering deposit'),
        (v_contact_event_return_id,  v_owner_id, v_org_id, 'Event Float Return', NULL, 'Austin, TX', 'Unused float returned'),
        (v_contact_beans_id,         v_owner_id, v_org_id, 'Roastery Beans', NULL, 'Austin, TX', 'Coffee beans'),
        (v_contact_milk_id,          v_owner_id, v_org_id, 'Milk & Supplies Store', NULL, 'Austin, TX', 'Coffee supplies'),
        (v_contact_coffee_team_id,   v_owner_id, v_org_id, 'Greenfield Team', NULL, 'Austin, TX', 'Monthly coffee contribution'),
        (v_contact_coffee_repair_id, v_owner_id, v_org_id, 'CoffeeFix Repair', NULL, 'Austin, TX', 'Coffee machine repair');

    -- 7) Detect optional transaction columns (schema compatibility)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'status'
    ) INTO v_has_status;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'is_system'
    ) INTO v_has_is_system;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'voided_at'
    ) INTO v_has_voided_at;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'voided_by_user_id'
    ) INTO v_has_voided_by_user_id;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'voided_by_user_name'
    ) INTO v_has_voided_by_user_name;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'void_tx_id'
    ) INTO v_has_void_tx_id;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'void_reason'
    ) INTO v_has_void_reason;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'original_tx_id'
    ) INTO v_has_original_tx_id;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'original_transaction_id'
    ) INTO v_has_original_transaction_id;

    -- 8) Office Petty Cash transactions
    INSERT INTO public.transactions (user_id, org_id, cash_box_id, contact_id, type, amount, description, notes, transaction_date, contact_name, created_by_user_id, created_by_user_name)
    VALUES
        (v_owner_id, v_org_id, v_office_cash_box_id, v_contact_staples_id,       'expense', 42.80, 'Printer Ink (Staples)', NULL, '2026-02-03', 'Staples (Austin)', v_owner_id, 'Daniel Reed'),
        (v_owner_id, v_org_id, v_office_cash_box_id, v_contact_parking_id,       'expense', 18.00, 'Client Parking Reimbursement', NULL, '2026-02-04', 'Downtown Parking', v_owner_id, 'Emma Collins'),
        (v_owner_id, v_org_id, v_office_cash_box_id, v_contact_snacks_id,        'expense', 36.40, 'Office Snacks', NULL, '2026-02-05', 'Office Snack Shop', v_owner_id, 'Alex Turner'),
        (v_owner_id, v_org_id, v_office_cash_box_id, v_contact_alex_id,          'expense', 68.50, 'Team Lunch Reimbursement (Alex)', 'Lunch receipt reimbursed', '2026-02-06', 'Alex Turner', v_owner_id, 'Emma Collins'),
        (v_owner_id, v_org_id, v_office_cash_box_id, v_contact_owner_id,         'income', 200.00, 'Cash Top-Up (Owner Deposit)', 'Purpose: Refill petty cash balance', '2026-02-07', 'Daniel Reed', v_owner_id, 'Daniel Reed'),
        (v_owner_id, v_org_id, v_office_cash_box_id, v_contact_alex_id,          'income', 45.20, 'Reimbursement Return (Overpaid Advance)', 'Purpose: Returned unused advance', '2026-02-08', 'Alex Turner', v_owner_id, 'Alex Turner'),
        (v_owner_id, v_org_id, v_office_cash_box_id, v_contact_client_refund_id, 'income', 83.75, 'Client Cash Refund', 'Purpose: Returned unused client cash', '2026-02-09', 'Client Refund Desk', v_owner_id, 'Emma Collins'),
        (v_owner_id, v_org_id, v_office_cash_box_id, v_contact_cleaning_id,      'expense', 27.60, 'Cleaning Supplies', NULL, '2026-02-10', 'BrightClean Supplies', v_owner_id, 'Alex Turner'),
        (v_owner_id, v_org_id, v_office_cash_box_id, v_contact_taxi_id,          'expense', 34.20, 'Taxi to Client Meeting', NULL, '2026-02-11', 'ATX Client Taxi', v_owner_id, 'Emma Collins');

    -- Wrong entry to be voided (no separate visible minus in normal transaction view)
    INSERT INTO public.transactions (user_id, org_id, cash_box_id, contact_id, type, amount, description, notes, transaction_date, contact_name, created_by_user_id, created_by_user_name)
    VALUES (v_owner_id, v_org_id, v_office_cash_box_id, v_contact_snacks_id, 'expense', 15.00, 'Office Supplies (Wrong Entry)', 'Will be voided and corrected', '2026-02-12', 'Office Snack Shop', v_owner_id, 'Emma Collins')
    RETURNING id INTO v_wrong_tx_id;

    INSERT INTO public.transactions (user_id, org_id, cash_box_id, contact_id, type, amount, description, notes, transaction_date, contact_name, created_by_user_id, created_by_user_name)
    VALUES (v_owner_id, v_org_id, v_office_cash_box_id, v_contact_snacks_id, 'income', 15.00, 'VOID AUTO REVERSAL', 'System reversal for wrong entry', '2026-02-12', 'Office Snack Shop', v_owner_id, 'Emma Collins')
    RETURNING id INTO v_void_tx_id;

    IF v_has_is_system THEN
        UPDATE public.transactions
        SET is_system = true
        WHERE id = v_void_tx_id;
    END IF;

    IF v_has_original_tx_id THEN
        UPDATE public.transactions
        SET original_tx_id = v_wrong_tx_id
        WHERE id = v_void_tx_id;
    END IF;

    IF v_has_original_transaction_id THEN
        EXECUTE 'UPDATE public.transactions SET original_transaction_id = $1 WHERE id = $2'
        USING v_wrong_tx_id, v_void_tx_id;
    END IF;

    IF v_has_status THEN
        UPDATE public.transactions
        SET status = 'voided'
        WHERE id = v_wrong_tx_id;
    END IF;

    IF v_has_voided_at THEN
        UPDATE public.transactions
        SET voided_at = now()
        WHERE id = v_wrong_tx_id;
    END IF;

    IF v_has_voided_by_user_id THEN
        UPDATE public.transactions
        SET voided_by_user_id = v_owner_id
        WHERE id = v_wrong_tx_id;
    END IF;

    IF v_has_voided_by_user_name THEN
        UPDATE public.transactions
        SET voided_by_user_name = 'Emma Collins'
        WHERE id = v_wrong_tx_id;
    END IF;

    IF v_has_void_tx_id THEN
        UPDATE public.transactions
        SET void_tx_id = v_void_tx_id
        WHERE id = v_wrong_tx_id;
    END IF;

    IF v_has_void_reason THEN
        UPDATE public.transactions
        SET void_reason = 'Entered under wrong category'
        WHERE id = v_wrong_tx_id;
    END IF;

    -- Corrected replacement entry
    INSERT INTO public.transactions (user_id, org_id, cash_box_id, contact_id, type, amount, description, notes, transaction_date, contact_name, created_by_user_id, created_by_user_name)
    VALUES (v_owner_id, v_org_id, v_office_cash_box_id, v_contact_staples_id, 'expense', 15.00, 'Corrected Entry – Office Supplies', NULL, '2026-02-12', 'Staples (Austin)', v_owner_id, 'Emma Collins');

    -- 9) Event Float transactions
    INSERT INTO public.transactions (user_id, org_id, cash_box_id, contact_id, type, amount, description, notes, transaction_date, contact_name, created_by_user_id, created_by_user_name)
    VALUES
        (v_owner_id, v_org_id, v_event_cash_box_id, v_contact_event_booth_id,    'expense', 120.00, 'Booth Setup Supplies', NULL, '2026-02-04', 'Booth Setup Supplies', v_owner_id, 'Emma Collins'),
        (v_owner_id, v_org_id, v_event_cash_box_id, v_contact_temp_staff_id,     'expense', 150.00, 'Temporary Staff Cash Advance', NULL, '2026-02-05', 'Temp Staff Pool', v_owner_id, 'Emma Collins'),
        (v_owner_id, v_org_id, v_event_cash_box_id, v_contact_event_sales_id,    'income',  480.00, 'Cash Sales Collected', 'Purpose: Event Cash Sales', '2026-02-06', 'Event Cash Sales', v_owner_id, 'Daniel Reed'),
        (v_owner_id, v_org_id, v_event_cash_box_id, v_contact_event_catering_id, 'expense', 200.00, 'Catering Deposit', NULL, '2026-02-06', 'Event Catering Co', v_owner_id, 'Daniel Reed'),
        (v_owner_id, v_org_id, v_event_cash_box_id, v_contact_event_return_id,   'income',  100.00, 'Returned Unused Cash', 'Purpose: Remaining float after event', '2026-02-07', 'Event Float Return', v_owner_id, 'Emma Collins');

    -- 10) Coffee Fund transactions
    INSERT INTO public.transactions (user_id, org_id, cash_box_id, contact_id, type, amount, description, notes, transaction_date, contact_name, created_by_user_id, created_by_user_name)
    VALUES
        (v_owner_id, v_org_id, v_coffee_cash_box_id, v_contact_beans_id,         'expense', 45.00, 'Weekly Coffee Beans', NULL, '2026-02-03', 'Roastery Beans', v_owner_id, 'Alex Turner'),
        (v_owner_id, v_org_id, v_coffee_cash_box_id, v_contact_milk_id,          'expense', 28.00, 'Milk & Supplies', NULL, '2026-02-04', 'Milk & Supplies Store', v_owner_id, 'Alex Turner'),
        (v_owner_id, v_org_id, v_coffee_cash_box_id, v_contact_coffee_team_id,   'income',  60.00, 'Team Contribution', 'Description: Monthly Coffee Contribution', '2026-02-05', 'Greenfield Team', v_owner_id, 'Daniel Reed'),
        (v_owner_id, v_org_id, v_coffee_cash_box_id, v_contact_coffee_repair_id, 'expense', 35.00, 'Extra Coffee Machine Repair', NULL, '2026-02-06', 'CoffeeFix Repair', v_owner_id, 'Emma Collins');

    RAISE NOTICE 'Greenfield demo data created for org % (owner %).', v_org_id, v_owner_id;
    RAISE NOTICE 'Expected balances -> Office: 586.45, Event: 1110.00, Coffee: 152.00';
END;
$$;
