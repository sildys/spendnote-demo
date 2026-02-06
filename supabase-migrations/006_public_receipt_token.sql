-- Add a public token to allow external (non-authenticated) receipt access via a server-side Edge Function

alter table public.transactions
add column if not exists public_receipt_token text;

create unique index if not exists transactions_public_receipt_token_unique
on public.transactions (public_receipt_token)
where public_receipt_token is not null;
