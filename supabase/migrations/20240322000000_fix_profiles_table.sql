-- Drop existing trigger and function if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop existing policies
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;

-- Drop and recreate the profiles table
drop table if exists public.profiles;

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  university text,
  major text,
  year text
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies with more permissive rules for authenticated users
create policy "Enable read access for authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Enable insert for authenticated users"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Enable update for users based on id"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create a trigger function to automatically update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for updated_at
create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

-- Create a trigger function to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, university, major, year)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'university',
    new.raw_user_meta_data->>'major',
    new.raw_user_meta_data->>'year'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger if it does not exist
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.profiles to authenticated; 