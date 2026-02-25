# SpendNote Database Setup Guide

## Supabase Configuration

**Project URL:** `https://zrnnharudlgxuvewqryj.supabase.co`

## Setup Instructions

### 1. Run Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/zrnnharudlgxuvewqryj
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the schema

This will create:
- `profiles` table (extends Supabase Auth users with subscription info)
- `orgs` table (team/workspace container)
- `org_memberships` table (user role per org)
- `cash_boxes` table (with receipt customization settings)
- `cash_box_memberships` table (per-user cash box access)
- `contacts` table
- `transactions` table (with contact snapshots and team tracking)
- All necessary indexes, triggers, and Row Level Security policies

### 2. Optional: Add Sample Data

If you want to test with sample data:

1. First, sign up a test user through the app
2. Get the user's UUID from **Authentication** → **Users** in Supabase Dashboard
3. Open `seed-data.sql`
4. Replace all instances of `USER_ID_HERE` with your actual user UUID
5. Run the modified SQL in the SQL Editor

### 3. Verify Setup

Check that all tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- profiles
- orgs
- org_memberships
- cash_boxes
- cash_box_memberships
- contacts
- transactions
- audit_log

## Row Level Security (RLS)

All tables have RLS enabled to ensure users can only access their own data:
- Users can only view/edit their own profiles
- Users can only access org-scoped data where they have membership
- Owner/Admin can manage org-scoped cash boxes
- Team access is controlled by `org_memberships` + `cash_box_memberships`

## Automatic Features

### Auto-updating Timestamps
All tables automatically update their `updated_at` field when records are modified.

### Auto-updating Cash Box Balance
When transactions are created, updated, or deleted, the associated cash box balance is automatically recalculated.

### Auto-creating Profile
When a new user signs up through Supabase Auth, a profile is automatically created in the `profiles` table.

## Next Steps

After running the schema:
1. Test user signup/login on the frontend
2. Verify profile is created automatically
3. Create a cash box and test transactions
4. Upload a receipt to test storage

## Troubleshooting

**Error: "relation already exists"**
- Tables already exist. You can drop them first or skip this error.

**Error: "permission denied"**
- Make sure you're logged in as the project owner in Supabase Dashboard.

**RLS blocking queries**
- Ensure you're authenticated when making requests from the frontend.
- Check that `auth.uid()` matches the `user_id` in the table.
