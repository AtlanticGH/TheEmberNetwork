-- Application decisions (approve/reject) support
-- Run after supabase/platform.sql

alter table public.applications
  add column if not exists rejection_reason text;

alter table public.applications
  add column if not exists decision_email_sent_at timestamptz;

alter table public.applications
  add column if not exists decision_email_type text check (decision_email_type in ('approved', 'rejected'));

