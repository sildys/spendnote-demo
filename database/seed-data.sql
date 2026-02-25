-- SpendNote Seed Data (Optional - for testing)
-- This file contains sample data for development and testing

-- Note: You need to replace USER_ID_HERE with actual user UUID after signup

-- Sample Cash Boxes
INSERT INTO public.cash_boxes (id, user_id, name, description, initial_balance, current_balance, color) VALUES
('11111111-1111-1111-1111-111111111111', 'USER_ID_HERE', 'Main Office', 'Primary cash box for daily operations', 5000.00, 5000.00, '#10b981'),
('22222222-2222-2222-2222-222222222222', 'USER_ID_HERE', 'Event Fund', 'Special events and activities budget', 2000.00, 2000.00, '#f59e0b'),
('33333333-3333-3333-3333-333333333333', 'USER_ID_HERE', 'Petty Cash', 'Small daily expenses', 500.00, 500.00, '#3b82f6');

-- Sample Contacts
INSERT INTO public.contacts (id, user_id, name, email, phone, address, notes) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'USER_ID_HERE', 'ABC Office Supplies', 'contact@abcoffice.com', '+36 1 234 5678', '1051 Budapest, Nádor utca 12.', 'Preferred supplier for office materials'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'USER_ID_HERE', 'Best Catering Ltd.', 'info@bestcatering.hu', '+36 20 123 4567', '1061 Budapest, Andrássy út 45.', 'Catering services for events'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'USER_ID_HERE', 'City Taxi Service', 'dispatch@citytaxi.hu', '+36 1 987 6543', '1074 Budapest, Dohány utca 20.', 'Corporate taxi account'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'USER_ID_HERE', 'Digital Marketing Pro', 'hello@digitalmarketing.hu', '+36 30 555 1234', '1052 Budapest, Váci utca 33.', 'Monthly marketing services'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'USER_ID_HERE', 'Elite Consulting', 'info@eliteconsulting.com', '+36 1 456 7890', '1054 Budapest, Szabadság tér 7.', 'Business consulting partner');

-- Sample Transactions
INSERT INTO public.transactions (user_id, cash_box_id, contact_id, type, amount, description, transaction_date, receipt_number) VALUES
-- Main Office transactions
('USER_ID_HERE', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'expense', 125.50, 'Office supplies purchase', '2026-01-15', 'INV-2026-001'),
('USER_ID_HERE', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'expense', 450.00, 'Monthly marketing fee', '2026-01-14', 'INV-2026-002'),
('USER_ID_HERE', '11111111-1111-1111-1111-111111111111', NULL, 'income', 1200.00, 'Client payment received', '2026-01-13', 'REC-2026-001'),
('USER_ID_HERE', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'expense', 35.00, 'Taxi to client meeting', '2026-01-12', 'INV-2026-003'),

-- Event Fund transactions
('USER_ID_HERE', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'expense', 850.00, 'Catering for company event', '2026-01-10', 'INV-2026-004'),
('USER_ID_HERE', '22222222-2222-2222-2222-222222222222', NULL, 'income', 500.00, 'Event sponsorship', '2026-01-09', 'REC-2026-002'),

-- Petty Cash transactions
('USER_ID_HERE', '33333333-3333-3333-3333-333333333333', NULL, 'expense', 15.50, 'Coffee and snacks', '2026-01-16', 'REC-2026-003'),
('USER_ID_HERE', '33333333-3333-3333-3333-333333333333', NULL, 'expense', 8.00, 'Parking fee', '2026-01-15', 'REC-2026-004');

-- Sample Cash Box - Contact relationships
INSERT INTO public.cash_box_contacts (cash_box_id, contact_id) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
