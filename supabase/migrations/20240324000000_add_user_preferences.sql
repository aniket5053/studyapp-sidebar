-- Create user_preferences table
create table if not exists public.user_preferences (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  archive_delay_days integer not null default 2,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Enable Row Level Security
alter table public.user_preferences enable row level security;

-- Create policies
create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

-- Create a trigger function to automatically update the updated_at timestamp
create or replace function public.handle_preferences_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for updated_at
create trigger handle_preferences_updated_at
  before update on public.user_preferences
  for each row
  execute procedure public.handle_preferences_updated_at();

-- Create a trigger function to automatically create preferences when a new user signs up
create or replace function public.handle_new_user_preferences()
returns trigger as $$
begin
  insert into public.user_preferences (id, user_id, archive_delay_days)
  values (new.id, new.id, 2); -- Default to 2 days
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger if it does not exist
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created_preferences') then
    create trigger on_auth_user_created_preferences
      after insert on auth.users
      for each row execute procedure public.handle_new_user_preferences();
  end if;
end $$;

-- Insert default preferences for existing users
insert into public.user_preferences (id, user_id, archive_delay_days)
select id, id, 2
from auth.users
where id not in (select id from public.user_preferences)
on conflict (id) do nothing; 