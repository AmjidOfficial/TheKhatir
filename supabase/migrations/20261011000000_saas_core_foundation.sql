-- TheKhatir SaaS core foundation
-- This migration is a reviewed starting point, not permission to apply it to an unconfirmed project.
-- Confirm the dedicated Khatir Supabase project and test RLS in staging before production.

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  avatar_url text,
  platform_role text not null default 'user'
    check (platform_role in ('user', 'platform_admin', 'super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  business_type text not null default 'agency'
    check (business_type in ('agency', 'developer', 'builder', 'individual', 'property_owner', 'investor')),
  logo_url text,
  website_url text,
  contact_email text,
  contact_phone text,
  country_code text not null default 'PK',
  city text not null default 'Peshawar',
  status text not null default 'pending'
    check (status in ('pending', 'active', 'suspended', 'closed')),
  is_public boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null
    check (role in ('owner', 'tenant_admin', 'branch_manager', 'sales_manager', 'agent', 'listing_editor', 'marketer', 'developer_manager', 'builder_manager', 'finance_manager', 'support')),
  status text not null default 'active'
    check (status in ('invited', 'active', 'suspended', 'removed')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid()
      and p.platform_role in ('platform_admin', 'super_admin')
  );
$$;

create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tenant_memberships m
    where m.tenant_id = p_tenant_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.can_manage_tenant(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin() or exists (
    select 1 from public.tenant_memberships m
    where m.tenant_id = p_tenant_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('owner', 'tenant_admin', 'branch_manager')
  );
$$;

create or replace function public.can_manage_listings(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin() or exists (
    select 1 from public.tenant_memberships m
    where m.tenant_id = p_tenant_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role in ('owner', 'tenant_admin', 'branch_manager', 'sales_manager', 'agent', 'listing_editor', 'marketer', 'developer_manager', 'builder_manager')
  );
$$;

create or replace function public.prevent_tenant_id_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $
begin
  if auth.uid() is not null
     and not public.is_platform_admin()
     and new.tenant_id is distinct from old.tenant_id then
    raise exception 'Records cannot be moved between tenants';
  end if;
  return new;
end;
$;

create or replace function public.guard_tenant_moderation_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $
begin
  if auth.uid() is null or public.is_platform_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if tg_table_name = 'properties'
       and (new.verification_status <> 'unverified' or new.verified_by is not null
         or new.verified_at is not null or new.publication_status = 'published') then
      raise exception 'New properties must enter the verification workflow as drafts';
    elsif tg_table_name = 'projects'
       and (new.approval_status <> 'not_verified' or new.publication_status = 'published') then
      raise exception 'New projects must enter the approval workflow as drafts';
    elsif tg_table_name = 'ad_campaigns'
       and (new.moderation_status <> 'pending_review' or new.status = 'active') then
      raise exception 'New advertising campaigns require review before activation';
    elsif tg_table_name = 'events' and new.publication_status = 'published' then
      raise exception 'New events require platform review before publication';
    elsif tg_table_name = 'content_pages' and new.publication_status = 'published' then
      raise exception 'New content requires platform review before publication';
    end if;
    return new;
  end if;

  if tg_table_name = 'tenants' then
    if new.status is distinct from old.status or new.is_public is distinct from old.is_public then
      raise exception 'Only platform administrators may activate, suspend, or publish a business';
    end if;
  elsif tg_table_name = 'properties' then
    if new.verification_status is distinct from old.verification_status
       or new.verified_by is distinct from old.verified_by
       or new.verified_at is distinct from old.verified_at then
      raise exception 'Only platform administrators may change property verification';
    end if;
    if new.publication_status = 'published'
       and (new.verification_status <> 'verified'
         or not exists (select 1 from public.tenants t where t.id = new.tenant_id and t.status = 'active')) then
      raise exception 'A property must be verified and its business active before publication';
    end if;
  elsif tg_table_name = 'projects' then
    if new.approval_status is distinct from old.approval_status
       or new.approval_reference is distinct from old.approval_reference
       or new.approval_checked_at is distinct from old.approval_checked_at then
      raise exception 'Only platform administrators may change project approval records';
    end if;
    if new.publication_status = 'published'
       and (new.approval_status <> 'verified'
         or not exists (select 1 from public.tenants t where t.id = new.tenant_id and t.status = 'active')) then
      raise exception 'A project must have verified approval status and an active business before publication';
    end if;
  elsif tg_table_name = 'ad_campaigns' then
    if new.moderation_status is distinct from old.moderation_status
       or new.approved_by is distinct from old.approved_by
       or new.approved_at is distinct from old.approved_at then
      raise exception 'Only platform administrators may approve or reject advertising campaigns';
    end if;
    if new.status = 'active'
       and (new.moderation_status <> 'approved'
         or not exists (select 1 from public.tenants t where t.id = new.tenant_id and t.status = 'active')) then
      raise exception 'A campaign must be approved and its business active before activation';
    end if;
  elsif tg_table_name = 'events' then
    if new.publication_status = 'published' and old.publication_status is distinct from 'published' then
      raise exception 'Events require platform review before publication';
    end if;
  elsif tg_table_name = 'content_pages' then
    if new.publication_status = 'published' and old.publication_status is distinct from 'published' then
      raise exception 'Content requires platform review before publication';
    end if;
  end if;

  return new;
end;
$;

create or replace function public.prevent_self_platform_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and new.platform_role is distinct from old.platform_role
     and not public.is_platform_admin() then
    raise exception 'Only a platform administrator may change platform roles';
  end if;
  return new;
end;
$$;

create or replace function public.bootstrap_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, display_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.bootstrap_profile();

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  reference_code text not null,
  created_by uuid references auth.users(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null check (length(trim(title)) between 5 and 220),
  slug text not null,
  description text not null default '',
  listing_type text not null
    check (listing_type in ('house', 'plot', 'apartment', 'commercial', 'shop', 'office', 'warehouse', 'land', 'room', 'other')),
  intent text not null check (intent in ('sale', 'rent', 'lease', 'project')),
  price numeric(16,2) check (price is null or price >= 0),
  currency text not null default 'PKR' check (currency ~ '^[A-Z]{3}$'),
  price_period text check (price_period is null or price_period in ('day', 'week', 'month', 'year', 'one_time')),
  area_value numeric(14,3) check (area_value is null or area_value >= 0),
  area_unit text check (area_unit is null or area_unit in ('sq_ft', 'sq_yd', 'marla', 'kanal', 'acre')),
  bedrooms integer check (bedrooms is null or bedrooms >= 0),
  bathrooms integer check (bathrooms is null or bathrooms >= 0),
  country_code text not null default 'PK',
  province text not null default 'Khyber Pakhtunkhwa',
  city text not null default 'Peshawar',
  locality text,
  society text,
  block_sector text,
  address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  amenities jsonb not null default '[]'::jsonb check (jsonb_typeof(amenities) = 'array'),
  media jsonb not null default '[]'::jsonb check (jsonb_typeof(media) = 'array'),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected', 'expired')),
  verification_note text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  availability_confirmed_at timestamptz,
  expires_at timestamptz,
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'pending_review', 'published', 'rejected', 'paused', 'sold', 'rented', 'archived')),
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, reference_code),
  unique (tenant_id, slug)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  title text not null check (length(trim(title)) between 3 and 220),
  slug text not null,
  project_type text not null default 'residential'
    check (project_type in ('residential', 'commercial', 'mixed_use', 'industrial', 'infrastructure', 'other')),
  summary text not null default '',
  description text not null default '',
  country_code text not null default 'PK',
  province text not null default 'Khyber Pakhtunkhwa',
  city text not null default 'Peshawar',
  locality text,
  address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  amenities jsonb not null default '[]'::jsonb check (jsonb_typeof(amenities) = 'array'),
  media jsonb not null default '[]'::jsonb check (jsonb_typeof(media) = 'array'),
  brochure_url text,
  payment_plan_url text,
  approval_status text not null default 'not_verified'
    check (approval_status in ('not_verified', 'under_review', 'verified', 'rejected', 'not_applicable')),
  approval_reference text,
  approval_checked_at timestamptz,
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'pending_review', 'published', 'paused', 'completed', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  full_name text not null check (length(trim(full_name)) between 2 and 160),
  email text,
  phone text,
  preferred_contact text not null default 'phone'
    check (preferred_contact in ('phone', 'email', 'whatsapp')),
  source text not null default 'website'
    check (source in ('website', 'phone', 'whatsapp', 'event', 'advertisement', 'referral', 'manual', 'other')),
  campaign_id uuid,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'visit_planned', 'visited', 'negotiation', 'won', 'lost', 'unreachable')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  message text not null default '',
  consent_recorded_at timestamptz,
  next_follow_up_at timestamptz,
  last_contacted_at timestamptz,
  outcome_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  activity_type text not null
    check (activity_type in ('note', 'call', 'message', 'email', 'meeting', 'site_visit', 'status_change', 'assignment', 'system')),
  body text not null default '',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  title text not null check (length(trim(title)) between 2 and 220),
  description text not null default '',
  due_at timestamptz,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  title text not null check (length(trim(title)) between 3 and 220),
  slug text not null,
  event_type text not null default 'open_house'
    check (event_type in ('open_house', 'launch', 'expo', 'site_visit', 'investor_meeting', 'webinar', 'construction_showcase', 'other')),
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'Asia/Karachi',
  venue text,
  online_url text,
  cover_image_url text,
  capacity integer check (capacity is null or capacity > 0),
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'pending_review', 'published', 'cancelled', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug),
  check (ends_at > starts_at)
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null check (length(trim(full_name)) between 2 and 160),
  email text,
  phone text,
  status text not null default 'registered'
    check (status in ('registered', 'confirmed', 'cancelled', 'attended', 'no_show')),
  consent_recorded_at timestamptz,
  created_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);

create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  name text not null check (length(trim(name)) between 3 and 180),
  product_type text not null
    check (product_type in ('featured_property', 'promoted_project', 'promoted_business', 'sponsored_search', 'homepage_placement', 'area_placement', 'sponsored_content', 'event_promotion')),
  property_id uuid references public.properties(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  destination_url text,
  creative jsonb not null default '{}'::jsonb check (jsonb_typeof(creative) = 'object'),
  target_locations text[] not null default '{}',
  budget numeric(16,2) check (budget is null or budget >= 0),
  currency text not null default 'PKR' check (currency ~ '^[A-Z]{3}$'),
  starts_at timestamptz,
  ends_at timestamptz,
  moderation_status text not null default 'pending_review'
    check (moderation_status in ('pending_review', 'approved', 'rejected', 'paused')),
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  title text not null check (length(trim(title)) between 3 and 220),
  slug text not null,
  content_type text not null default 'page'
    check (content_type in ('page', 'article', 'area_guide', 'faq', 'project_page', 'developer_page')),
  excerpt text not null default '',
  body text not null default '',
  meta_title text,
  meta_description text,
  canonical_url text,
  social_image_url text,
  robots_directive text not null default 'index,follow'
    check (robots_directive in ('index,follow', 'noindex,follow', 'noindex,nofollow')),
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'pending_review', 'published', 'scheduled', 'archived')),
  published_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  tenant_id uuid references public.tenants(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  reason text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create unique index if not exists idx_content_global_slug on public.content_pages(slug) where tenant_id is null;

alter table public.leads
  add constraint leads_campaign_id_fkey
  foreign key (campaign_id) references public.ad_campaigns(id) on delete set null;

create or replace function public.validate_tenant_relationships()
returns trigger
language plpgsql
set search_path = public
as $
begin
  if tg_table_name = 'leads' then
    if new.property_id is not null and not exists (
      select 1 from public.properties p where p.id = new.property_id and p.tenant_id = new.tenant_id
    ) then raise exception 'Lead property must belong to the same tenant'; end if;
    if new.project_id is not null and not exists (
      select 1 from public.projects p where p.id = new.project_id and p.tenant_id = new.tenant_id
    ) then raise exception 'Lead project must belong to the same tenant'; end if;
  elsif tg_table_name = 'tasks' then
    if new.lead_id is not null and not exists (
      select 1 from public.leads l where l.id = new.lead_id and l.tenant_id = new.tenant_id
    ) then raise exception 'Task lead must belong to the same tenant'; end if;
    if new.property_id is not null and not exists (
      select 1 from public.properties p where p.id = new.property_id and p.tenant_id = new.tenant_id
    ) then raise exception 'Task property must belong to the same tenant'; end if;
    if new.project_id is not null and not exists (
      select 1 from public.projects p where p.id = new.project_id and p.tenant_id = new.tenant_id
    ) then raise exception 'Task project must belong to the same tenant'; end if;
  elsif tg_table_name = 'lead_activities' then
    if not exists (
      select 1 from public.leads l where l.id = new.lead_id and l.tenant_id = new.tenant_id
    ) then raise exception 'Activity lead must belong to the same tenant'; end if;
  elsif tg_table_name = 'event_registrations' then
    if not exists (
      select 1 from public.events e where e.id = new.event_id and e.tenant_id = new.tenant_id
    ) then raise exception 'Registration event must belong to the same tenant'; end if;
    if tg_op = 'INSERT' and new.status <> 'registered' then
      raise exception 'New registrations must start in registered status';
    end if;
    if tg_op = 'UPDATE' and new.user_id = auth.uid()
       and not public.can_manage_tenant(new.tenant_id)
       and new.status <> 'cancelled' then
      raise exception 'Customers may only cancel their own event registration';
    end if;
    if tg_op = 'UPDATE' and new.user_id = auth.uid()
       and (new.event_id is distinct from old.event_id or new.user_id is distinct from old.user_id) then
      raise exception 'Event registration identity cannot be changed';
    end if;
  elsif tg_table_name = 'ad_campaigns' then
    if new.property_id is not null and not exists (
      select 1 from public.properties p where p.id = new.property_id and p.tenant_id = new.tenant_id
    ) then raise exception 'Campaign property must belong to the same tenant'; end if;
    if new.project_id is not null and not exists (
      select 1 from public.projects p where p.id = new.project_id and p.tenant_id = new.tenant_id
    ) then raise exception 'Campaign project must belong to the same tenant'; end if;
    if new.event_id is not null and not exists (
      select 1 from public.events e where e.id = new.event_id and e.tenant_id = new.tenant_id
    ) then raise exception 'Campaign event must belong to the same tenant'; end if;
  end if;
  return new;
end;
$;

drop trigger if exists validate_lead_tenant_relations on public.leads;
create trigger validate_lead_tenant_relations before insert or update on public.leads
for each row execute procedure public.validate_tenant_relationships();
drop trigger if exists validate_task_tenant_relations on public.tasks;
create trigger validate_task_tenant_relations before insert or update on public.tasks
for each row execute procedure public.validate_tenant_relationships();
drop trigger if exists validate_activity_tenant_relations on public.lead_activities;
create trigger validate_activity_tenant_relations before insert or update on public.lead_activities
for each row execute procedure public.validate_tenant_relationships();
drop trigger if exists validate_registration_tenant_relations on public.event_registrations;
create trigger validate_registration_tenant_relations before insert or update on public.event_registrations
for each row execute procedure public.validate_tenant_relationships();
drop trigger if exists validate_campaign_tenant_relations on public.ad_campaigns;
create trigger validate_campaign_tenant_relations before insert or update on public.ad_campaigns
for each row execute procedure public.validate_tenant_relationships();

create index if not exists idx_memberships_user_status on public.tenant_memberships(user_id, status);
create index if not exists idx_properties_public_search on public.properties(publication_status, city, listing_type, intent, price);
create index if not exists idx_properties_tenant_updated on public.properties(tenant_id, updated_at desc);
create index if not exists idx_projects_tenant_status on public.projects(tenant_id, publication_status);
create index if not exists idx_leads_tenant_status_created on public.leads(tenant_id, status, created_at desc);
create index if not exists idx_leads_assignee_followup on public.leads(assigned_to, next_follow_up_at);
create index if not exists idx_lead_activities_lead_time on public.lead_activities(lead_id, occurred_at desc);
create index if not exists idx_tasks_tenant_due on public.tasks(tenant_id, status, due_at);
create index if not exists idx_events_public_start on public.events(publication_status, starts_at);
create index if not exists idx_campaigns_tenant_status on public.ad_campaigns(tenant_id, status, starts_at);
create index if not exists idx_content_public_slug on public.content_pages(publication_status, slug);
create index if not exists idx_audit_tenant_time on public.audit_logs(tenant_id, created_at desc);

create or replace function public.bootstrap_tenant_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is not null then
    insert into public.tenant_memberships (tenant_id, user_id, role, status)
    values (new.id, new.created_by, 'owner', 'active')
    on conflict (tenant_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_tenant_created_add_owner on public.tenants;
create trigger on_tenant_created_add_owner
after insert on public.tenants
for each row execute procedure public.bootstrap_tenant_owner();

create or replace function public.prevent_membership_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $
begin
  if auth.uid() is null or public.is_platform_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- The tenant-creation trigger may create the first owner membership.
    if new.user_id = auth.uid() and new.role = 'owner' then
      return new;
    end if;
    if not public.can_manage_tenant(new.tenant_id) then
      raise exception 'Only tenant managers may invite team members';
    end if;
    if new.role = 'owner' then
      raise exception 'Only platform administrators may assign an additional owner';
    end if;
  elsif tg_op = 'UPDATE' then
    if new.tenant_id is distinct from old.tenant_id or new.user_id is distinct from old.user_id then
      raise exception 'Memberships cannot be moved to another tenant or user';
    end if;
    if new.role is distinct from old.role then
      if not public.can_manage_tenant(old.tenant_id) or new.role = 'owner' then
        raise exception 'Insufficient permission to change this membership role';
      end if;
    end if;
  end if;

  return new;
end;
$;

drop trigger if exists prevent_membership_privilege_escalation on public.tenant_memberships;
create trigger prevent_membership_privilege_escalation
before insert or update on public.tenant_memberships
for each row execute procedure public.prevent_membership_privilege_escalation();

create or replace function public.audit_sensitive_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_entity_id text;
  v_action text;
begin
  if tg_op = 'DELETE' then
    v_tenant_id := old.tenant_id;
    v_entity_id := old.id::text;
    v_action := lower(tg_op);
  else
    v_tenant_id := new.tenant_id;
    v_entity_id := new.id::text;
    v_action := lower(tg_op);
  end if;

  insert into public.audit_logs (tenant_id, actor_id, action, entity_type, entity_id)
  values (v_tenant_id, auth.uid(), v_action, tg_table_name, v_entity_id);

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function public.guard_audit_log_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Audit logs are append-only';
end;
$$;

drop trigger if exists guard_audit_log_update_delete on public.audit_logs;
create trigger guard_audit_log_update_delete
before update or delete on public.audit_logs
for each row execute procedure public.guard_audit_log_mutation();

do $$
declare
  t text;
begin
  foreach t in array array[
    'user_profiles','tenants','tenant_memberships','properties','projects','leads',
    'tasks','events','ad_campaigns','content_pages'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute procedure public.set_updated_at()', t);
  end loop;
end;
$$;

drop trigger if exists guard_tenant_status on public.tenants;
create trigger guard_tenant_status
before update on public.tenants
for each row execute procedure public.guard_tenant_moderation_fields();

drop trigger if exists guard_property_moderation on public.properties;
create trigger guard_property_moderation
before insert or update on public.properties
for each row execute procedure public.guard_tenant_moderation_fields();

drop trigger if exists guard_project_moderation on public.projects;
create trigger guard_project_moderation
before insert or update on public.projects
for each row execute procedure public.guard_tenant_moderation_fields();

drop trigger if exists guard_campaign_moderation on public.ad_campaigns;
create trigger guard_campaign_moderation
before insert or update on public.ad_campaigns
for each row execute procedure public.guard_tenant_moderation_fields();

drop trigger if exists guard_event_moderation on public.events;
create trigger guard_event_moderation
before insert or update on public.events
for each row execute procedure public.guard_tenant_moderation_fields();

drop trigger if exists guard_content_moderation on public.content_pages;
create trigger guard_content_moderation
before insert or update on public.content_pages
for each row execute procedure public.guard_tenant_moderation_fields();

do $
declare
  t text;
begin
  foreach t in array array[
    'tenant_memberships','properties','projects','leads','lead_activities','tasks',
    'events','event_registrations','ad_campaigns','content_pages'
  ] loop
    execute format('drop trigger if exists prevent_tenant_id_change on public.%I', t);
    execute format('create trigger prevent_tenant_id_change before update on public.%I for each row execute procedure public.prevent_tenant_id_change()', t);
  end loop;
end;
$;

drop trigger if exists prevent_profile_role_change on public.user_profiles;
create trigger prevent_profile_role_change
before update on public.user_profiles
for each row execute procedure public.prevent_self_platform_role_change();

drop trigger if exists audit_properties on public.properties;
create trigger audit_properties after insert or update or delete on public.properties
for each row execute procedure public.audit_sensitive_changes();

drop trigger if exists audit_projects on public.projects;
create trigger audit_projects after insert or update or delete on public.projects
for each row execute procedure public.audit_sensitive_changes();

drop trigger if exists audit_leads on public.leads;
create trigger audit_leads after insert or update or delete on public.leads
for each row execute procedure public.audit_sensitive_changes();

drop trigger if exists audit_tasks on public.tasks;
create trigger audit_tasks after insert or update or delete on public.tasks
for each row execute procedure public.audit_sensitive_changes();

drop trigger if exists audit_events on public.events;
create trigger audit_events after insert or update or delete on public.events
for each row execute procedure public.audit_sensitive_changes();

drop trigger if exists audit_campaigns on public.ad_campaigns;
create trigger audit_campaigns after insert or update or delete on public.ad_campaigns
for each row execute procedure public.audit_sensitive_changes();

drop trigger if exists audit_content_pages on public.content_pages;
create trigger audit_content_pages after insert or update or delete on public.content_pages
for each row execute procedure public.audit_sensitive_changes();

drop trigger if exists audit_tenant_memberships on public.tenant_memberships;
create trigger audit_tenant_memberships after insert or update or delete on public.tenant_memberships
for each row execute procedure public.audit_sensitive_changes();

alter table public.user_profiles enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.properties enable row level security;
alter table public.projects enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.ad_campaigns enable row level security;
alter table public.content_pages enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profiles_read_self_or_platform_admin" on public.user_profiles;
create policy "profiles_read_self_or_platform_admin" on public.user_profiles
for select to authenticated
using (id = auth.uid() or public.is_platform_admin());

drop policy if exists "profiles_update_self" on public.user_profiles;
create policy "profiles_update_self" on public.user_profiles
for update to authenticated
using (id = auth.uid() or public.is_platform_admin())
with check (id = auth.uid() or public.is_platform_admin());

drop policy if exists "tenants_read_public_or_member" on public.tenants;
create policy "tenants_read_public_or_member" on public.tenants
for select
using ((status = 'active' and is_public = true) or public.is_tenant_member(id) or public.is_platform_admin());

drop policy if exists "tenants_create_authenticated" on public.tenants;
create policy "tenants_create_authenticated" on public.tenants
for insert to authenticated
with check (created_by = auth.uid() and status = 'pending' and is_public = false);

drop policy if exists "tenants_manage_by_owner" on public.tenants;
create policy "tenants_manage_by_owner" on public.tenants
for update to authenticated
using (public.can_manage_tenant(id))
with check (public.can_manage_tenant(id));

drop policy if exists "tenants_delete_platform_only" on public.tenants;
create policy "tenants_delete_platform_only" on public.tenants
for delete to authenticated
using (public.is_platform_admin());

drop policy if exists "memberships_read_self_or_manager" on public.tenant_memberships;
create policy "memberships_read_self_or_manager" on public.tenant_memberships
for select to authenticated
using (user_id = auth.uid() or public.can_manage_tenant(tenant_id) or public.is_platform_admin());

drop policy if exists "memberships_create_owner_self_or_manager" on public.tenant_memberships;
create policy "memberships_create_owner_self_or_manager" on public.tenant_memberships
for insert to authenticated
with check (
  public.is_platform_admin()
  or public.can_manage_tenant(tenant_id)
  or (user_id = auth.uid() and role = 'owner' and status = 'active')
);

drop policy if exists "memberships_update_manager" on public.tenant_memberships;
create policy "memberships_update_manager" on public.tenant_memberships
for update to authenticated
using (public.can_manage_tenant(tenant_id) or public.is_platform_admin())
with check (public.can_manage_tenant(tenant_id) or public.is_platform_admin());

drop policy if exists "memberships_delete_manager" on public.tenant_memberships;
create policy "memberships_delete_manager" on public.tenant_memberships
for delete to authenticated
using (public.can_manage_tenant(tenant_id) or public.is_platform_admin());

drop policy if exists "properties_read_published_or_tenant" on public.properties;
create policy "properties_read_published_or_tenant" on public.properties
for select
using (
  (publication_status = 'published' and verification_status = 'verified'
    and (expires_at is null or expires_at > now())
    and exists (select 1 from public.tenants t where t.id = tenant_id and t.status = 'active'))
  or public.is_tenant_member(tenant_id)
  or public.is_platform_admin()
);

drop policy if exists "properties_create_authorised" on public.properties;
create policy "properties_create_authorised" on public.properties
for insert to authenticated
with check (public.can_manage_listings(tenant_id) and created_by = auth.uid());

drop policy if exists "properties_update_authorised" on public.properties;
create policy "properties_update_authorised" on public.properties
for update to authenticated
using (public.can_manage_listings(tenant_id))
with check (public.can_manage_listings(tenant_id));

drop policy if exists "properties_delete_manager" on public.properties;
create policy "properties_delete_manager" on public.properties
for delete to authenticated
using (public.can_manage_tenant(tenant_id) or public.is_platform_admin());

drop policy if exists "projects_read_published_or_tenant" on public.projects;
create policy "projects_read_published_or_tenant" on public.projects
for select
using (
  (publication_status = 'published' and approval_status = 'verified'
    and exists (select 1 from public.tenants t where t.id = tenant_id and t.status = 'active'))
  or public.is_tenant_member(tenant_id)
  or public.is_platform_admin()
);

drop policy if exists "projects_create_authorised" on public.projects;
create policy "projects_create_authorised" on public.projects
for insert to authenticated
with check (public.can_manage_listings(tenant_id) and created_by = auth.uid());

drop policy if exists "projects_update_authorised" on public.projects;
create policy "projects_update_authorised" on public.projects
for update to authenticated
using (public.can_manage_listings(tenant_id))
with check (public.can_manage_listings(tenant_id));

drop policy if exists "projects_delete_manager" on public.projects;
create policy "projects_delete_manager" on public.projects
for delete to authenticated
using (public.can_manage_tenant(tenant_id) or public.is_platform_admin());

-- Public lead and registration creation must go through a server-side endpoint with rate limiting,
-- spam controls, consent handling, and strict field validation. No anonymous insert policy is added.
drop policy if exists "leads_read_assigned_or_manager" on public.leads;
create policy "leads_read_assigned_or_manager" on public.leads
for select to authenticated
using (
  assigned_to = auth.uid()
  or public.can_manage_tenant(tenant_id)
  or public.is_platform_admin()
);

drop policy if exists "leads_create_staff_only" on public.leads;
create policy "leads_create_staff_only" on public.leads
for insert to authenticated
with check (
  public.is_tenant_member(tenant_id)
  and (created_by = auth.uid() or public.can_manage_tenant(tenant_id))
);

drop policy if exists "leads_update_assigned_or_manager" on public.leads;
create policy "leads_update_assigned_or_manager" on public.leads
for update to authenticated
using (
  assigned_to = auth.uid()
  or public.can_manage_tenant(tenant_id)
  or public.is_platform_admin()
)
with check (
  assigned_to = auth.uid()
  or public.can_manage_tenant(tenant_id)
  or public.is_platform_admin()
);

drop policy if exists "leads_delete_manager_only" on public.leads;
create policy "leads_delete_manager_only" on public.leads
for delete to authenticated
using (public.can_manage_tenant(tenant_id) or public.is_platform_admin());

drop policy if exists "lead_activities_read_lead_access" on public.lead_activities;
create policy "lead_activities_read_lead_access" on public.lead_activities
for select to authenticated
using (
  exists (
    select 1 from public.leads l
    where l.id = lead_id
      and (l.assigned_to = auth.uid() or public.can_manage_tenant(l.tenant_id) or public.is_platform_admin())
  )
);

drop policy if exists "lead_activities_create_lead_access" on public.lead_activities;
create policy "lead_activities_create_lead_access" on public.lead_activities
for insert to authenticated
with check (
  actor_id = auth.uid()
  and exists (
    select 1 from public.leads l
    where l.id = lead_id
      and (l.assigned_to = auth.uid() or public.can_manage_tenant(l.tenant_id) or public.is_platform_admin())
  )
);

drop policy if exists "tasks_read_assigned_or_manager" on public.tasks;
create policy "tasks_read_assigned_or_manager" on public.tasks
for select to authenticated
using (
  assigned_to = auth.uid()
  or public.can_manage_tenant(tenant_id)
  or public.is_platform_admin()
);

drop policy if exists "tasks_create_member" on public.tasks;
create policy "tasks_create_member" on public.tasks
for insert to authenticated
with check (public.is_tenant_member(tenant_id) and created_by = auth.uid());

drop policy if exists "tasks_update_assigned_or_manager" on public.tasks;
create policy "tasks_update_assigned_or_manager" on public.tasks
for update to authenticated
using (assigned_to = auth.uid() or public.can_manage_tenant(tenant_id) or public.is_platform_admin())
with check (assigned_to = auth.uid() or public.can_manage_tenant(tenant_id) or public.is_platform_admin());

drop policy if exists "tasks_delete_manager" on public.tasks;
create policy "tasks_delete_manager" on public.tasks
for delete to authenticated
using (public.can_manage_tenant(tenant_id) or public.is_platform_admin());

drop policy if exists "events_read_public_or_tenant" on public.events;
create policy "events_read_public_or_tenant" on public.events
for select
using (
  (publication_status = 'published' and exists (select 1 from public.tenants t where t.id = tenant_id and t.status = 'active'))
  or public.is_tenant_member(tenant_id)
  or public.is_platform_admin()
);

drop policy if exists "events_create_editor" on public.events;
create policy "events_create_editor" on public.events
for insert to authenticated
with check (public.can_manage_listings(tenant_id) and created_by = auth.uid());

drop policy if exists "events_update_editor" on public.events;
create policy "events_update_editor" on public.events
for update to authenticated
using (public.can_manage_listings(tenant_id) or public.is_platform_admin())
with check (public.can_manage_listings(tenant_id) or public.is_platform_admin());

drop policy if exists "events_delete_manager" on public.events;
create policy "events_delete_manager" on public.events
for delete to authenticated
using (public.can_manage_tenant(tenant_id) or public.is_platform_admin());

drop policy if exists "event_registrations_read_organiser" on public.event_registrations;
create policy "event_registrations_read_organiser" on public.event_registrations
for select to authenticated
using (public.can_manage_tenant(tenant_id) or public.is_platform_admin());

drop policy if exists "event_registrations_create_signed_in" on public.event_registrations;
create policy "event_registrations_create_signed_in" on public.event_registrations
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.events e
    where e.id = event_id
      and e.tenant_id = event_registrations.tenant_id
      and e.publication_status = 'published'
  )
);

drop policy if exists "event_registrations_update_organiser_or_self" on public.event_registrations;
create policy "event_registrations_update_organiser_or_self" on public.event_registrations
for update to authenticated
using (user_id = auth.uid() or public.can_manage_tenant(tenant_id) or public.is_platform_admin())
with check (user_id = auth.uid() or public.can_manage_tenant(tenant_id) or public.is_platform_admin());

drop policy if exists "campaigns_read_owner_or_public_active" on public.ad_campaigns;
create policy "campaigns_read_owner_or_public_active" on public.ad_campaigns
for select
using (
  (status = 'active' and moderation_status = 'approved' and starts_at <= now() and (ends_at is null or ends_at > now()))
  or public.is_tenant_member(tenant_id)
  or public.is_platform_admin()
);

drop policy if exists "campaigns_create_manager" on public.ad_campaigns;
create policy "campaigns_create_manager" on public.ad_campaigns
for insert to authenticated
with check (public.can_manage_tenant(tenant_id) and created_by = auth.uid());

drop policy if exists "campaigns_update_manager" on public.ad_campaigns;
create policy "campaigns_update_manager" on public.ad_campaigns
for update to authenticated
using (public.can_manage_tenant(tenant_id) or public.is_platform_admin())
with check (public.can_manage_tenant(tenant_id) or public.is_platform_admin());

drop policy if exists "campaigns_delete_manager" on public.ad_campaigns;
create policy "campaigns_delete_manager" on public.ad_campaigns
for delete to authenticated
using (public.can_manage_tenant(tenant_id) or public.is_platform_admin());

drop policy if exists "content_read_published" on public.content_pages;
create policy "content_read_published" on public.content_pages
for select
using (
  (publication_status = 'published' and (tenant_id is null or exists (
    select 1 from public.tenants t where t.id = tenant_id and t.status = 'active'
  )))
  or (tenant_id is not null and public.can_manage_listings(tenant_id))
  or public.is_platform_admin()
);

drop policy if exists "content_create_editor" on public.content_pages;
create policy "content_create_editor" on public.content_pages
for insert to authenticated
with check (
  created_by = auth.uid()
  and ((tenant_id is not null and public.can_manage_listings(tenant_id)) or public.is_platform_admin())
);

drop policy if exists "content_update_editor" on public.content_pages;
create policy "content_update_editor" on public.content_pages
for update to authenticated
using (
  (tenant_id is not null and public.can_manage_listings(tenant_id))
  or public.is_platform_admin()
)
with check (
  (tenant_id is not null and public.can_manage_listings(tenant_id))
  or public.is_platform_admin()
);

drop policy if exists "content_delete_manager" on public.content_pages;
create policy "content_delete_manager" on public.content_pages
for delete to authenticated
using ((tenant_id is not null and public.can_manage_tenant(tenant_id)) or public.is_platform_admin());

drop policy if exists "audit_read_platform_or_tenant_manager" on public.audit_logs;
create policy "audit_read_platform_or_tenant_manager" on public.audit_logs
for select to authenticated
using (public.is_platform_admin() or (tenant_id is not null and public.can_manage_tenant(tenant_id)));

grant usage on schema public to anon, authenticated;
grant select on public.tenants, public.properties, public.projects, public.events, public.ad_campaigns, public.content_pages to authenticated;

-- Public clients use allow-listed views, not base tables with internal workflow fields.
create or replace view public.marketplace_businesses with (security_barrier = true) as
select id, name, slug, business_type, logo_url, website_url, contact_email, contact_phone, country_code, city
from public.tenants
where status = 'active' and is_public = true;

create or replace view public.marketplace_properties with (security_barrier = true) as
select p.id, p.reference_code, p.title, p.slug, p.description, p.listing_type, p.intent,
       p.price, p.currency, p.price_period, p.area_value, p.area_unit, p.bedrooms, p.bathrooms,
       p.province, p.city, p.locality, p.society, p.block_sector, p.amenities, p.media,
       p.verified_at, p.availability_confirmed_at, p.published_at, p.updated_at
from public.properties p
join public.tenants t on t.id = p.tenant_id
where p.publication_status = 'published'
  and p.verification_status = 'verified'
  and (p.expires_at is null or p.expires_at > now())
  and t.status = 'active';

create or replace view public.marketplace_projects with (security_barrier = true) as
select p.id, p.title, p.slug, p.project_type, p.summary, p.description,
       p.province, p.city, p.locality, p.amenities, p.media, p.brochure_url,
       p.payment_plan_url, p.approval_status, p.approval_reference, p.approval_checked_at, p.published_at
from public.projects p
join public.tenants t on t.id = p.tenant_id
where p.publication_status = 'published' and p.approval_status = 'verified' and t.status = 'active';

create or replace view public.marketplace_events with (security_barrier = true) as
select e.id, e.title, e.slug, e.event_type, e.description, e.starts_at, e.ends_at,
       e.timezone, e.venue, e.online_url, e.cover_image_url, e.capacity
from public.events e
join public.tenants t on t.id = e.tenant_id
where e.publication_status = 'published' and t.status = 'active';

create or replace view public.marketplace_content with (security_barrier = true) as
select c.id, c.title, c.slug, c.content_type, c.excerpt, c.body, c.meta_title,
       c.meta_description, c.canonical_url, c.social_image_url, c.robots_directive, c.published_at
from public.content_pages c
where c.publication_status = 'published'
  and (c.tenant_id is null or exists (
    select 1 from public.tenants t where t.id = c.tenant_id and t.status = 'active'
  ));

create or replace view public.marketplace_ad_placements with (security_barrier = true) as
select c.id, c.product_type, c.property_id, c.project_id, c.event_id,
       c.destination_url, c.creative, c.target_locations, c.starts_at, c.ends_at
from public.ad_campaigns c
join public.tenants t on t.id = c.tenant_id
where c.status = 'active' and c.moderation_status = 'approved'
  and c.starts_at <= now() and (c.ends_at is null or c.ends_at > now())
  and t.status = 'active';

revoke all on public.tenants, public.properties, public.projects, public.events,
  public.ad_campaigns, public.content_pages from anon;
grant select on public.marketplace_businesses, public.marketplace_properties,
  public.marketplace_projects, public.marketplace_events, public.marketplace_content,
  public.marketplace_ad_placements to anon, authenticated;
grant select, update on public.user_profiles to authenticated;
grant select, insert, update, delete on public.tenant_memberships to authenticated;
grant insert, update, delete on public.tenants to authenticated;
grant insert, update, delete on public.properties, public.projects, public.tasks, public.events, public.ad_campaigns, public.content_pages to authenticated;
grant select, insert, update, delete on public.leads, public.lead_activities, public.event_registrations to authenticated;
grant select on public.audit_logs to authenticated;

commit;
