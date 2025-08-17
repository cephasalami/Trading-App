-- Profiles/Business Cards table (supports multiple cards per user)
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id bigint references public.users(id) on delete cascade,
  name varchar(255) not null,
  headline varchar(500),
  bio text,
  avatar varchar(500),
  cover_image varchar(500),
  card_color varchar(7) default '#4A6FFF',
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Contact Information table (linked to profiles)
create table public.contact_info (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  email varchar(255),
  phone varchar(50),
  address text,
  company varchar(255),
  position varchar(255),
  website varchar(500),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Social Links table (updated structure for profiles)
create table public.social_links (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  platform varchar(50) not null, -- 'linkedin', 'twitter', 'instagram', etc.
  url varchar(1000) not null,
  username varchar(255),
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Contacts table (for storing scanned/added contacts)
create table public.contacts (
  id uuid default gen_random_uuid() primary key,
  user_id bigint references public.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  notes text,
  tags text[], -- Array of tags
  meeting_context varchar(500),
  last_interaction timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profile Stats table (for analytics)
create table public.profile_stats (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  views integer default 0,
  saves integer default 0,
  last_viewed timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NFC Devices table (for managing tapping devices)
create table public.nfc_devices (
  id uuid default gen_random_uuid() primary key,
  user_id bigint references public.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  device_id varchar(255) unique not null,
  device_name varchar(255),
  is_active boolean default true,
  last_used timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions table (for premium features)
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id bigint references public.users(id) on delete cascade,
  plan_type varchar(50) not null, -- 'monthly', 'yearly'
  status varchar(50) not null, -- 'active', 'cancelled', 'expired'
  started_at timestamp with time zone not null,
  expires_at timestamp with time zone not null,
  stripe_subscription_id varchar(255),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- App Settings table (for user preferences)
create table public.app_settings (
  id uuid default gen_random_uuid() primary key,
  user_id bigint references public.users(id) on delete cascade,
  follow_up_email boolean default false,
  lockscreen_widget boolean default false,
  direct_link boolean default false,
  share_offline boolean default false,
  remove_branding boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Scan History table (for tracking scans)
create table public.scan_history (
  id uuid default gen_random_uuid() primary key,
  user_id bigint references public.users(id) on delete cascade,
  scanned_profile_id uuid references public.profiles(id) on delete set null,
  scan_type varchar(50) not null, -- 'qr', 'nfc', 'paper', 'badge'
  scan_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_profiles_user_id on public.profiles(user_id);
create index idx_profiles_is_active on public.profiles(is_active);
create index idx_contact_info_profile_id on public.contact_info(profile_id);
create index idx_social_links_profile_id on public.social_links(profile_id);
create index idx_contacts_user_id on public.contacts(user_id);
create index idx_contacts_profile_id on public.contacts(profile_id);
create index idx_profile_stats_profile_id on public.profile_stats(profile_id);
create index idx_nfc_devices_user_id on public.nfc_devices(user_id);
create index idx_nfc_devices_device_id on public.nfc_devices(device_id);
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_app_settings_user_id on public.app_settings(user_id);
create index idx_scan_history_user_id on public.scan_history(user_id);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.contact_info enable row level security;
alter table public.social_links enable row level security;
alter table public.contacts enable row level security;
alter table public.profile_stats enable row level security;
alter table public.nfc_devices enable row level security;
alter table public.subscriptions enable row level security;
alter table public.app_settings enable row level security;
alter table public.scan_history enable row level security;

-- Create RLS policies (users can only access their own data)
create policy "Users can view their own profiles" on public.profiles
  for select using (auth.uid()::text = user_id::text);

create policy "Users can insert their own profiles" on public.profiles
  for insert with check (auth.uid()::text = user_id::text);

create policy "Users can update their own profiles" on public.profiles
  for update using (auth.uid()::text = user_id::text);

create policy "Users can delete their own profiles" on public.profiles
  for delete using (auth.uid()::text = user_id::text);

-- Similar policies for other tables
create policy "Users can manage their contact info" on public.contact_info
  for all using (profile_id in (select id from public.profiles where user_id::text = auth.uid()::text));

create policy "Users can manage their social links" on public.social_links
  for all using (profile_id in (select id from public.profiles where user_id::text = auth.uid()::text));

create policy "Users can manage their contacts" on public.contacts
  for all using (auth.uid()::text = user_id::text);

create policy "Users can view their profile stats" on public.profile_stats
  for all using (profile_id in (select id from public.profiles where user_id::text = auth.uid()::text));

create policy "Users can manage their devices" on public.nfc_devices
  for all using (auth.uid()::text = user_id::text);

create policy "Users can view their subscriptions" on public.subscriptions
  for all using (auth.uid()::text = user_id::text);

create policy "Users can manage their settings" on public.app_settings
  for all using (auth.uid()::text = user_id::text);

create policy "Users can view their scan history" on public.scan_history
  for all using (auth.uid()::text = user_id::text);

-- Create functions for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.contact_info
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.social_links
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.contacts
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.profile_stats
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.nfc_devices
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.app_settings
  for each row execute procedure public.handle_updated_at();