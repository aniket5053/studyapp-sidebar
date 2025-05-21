-- Create classes table first
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  color text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  unique(name, user_id)
);

-- Create tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  type text not null,
  status text not null default 'not-started' check (status in ('not-started', 'in-progress', 'to-submit', 'done')),
  date timestamp with time zone not null,
  class_id uuid references public.classes(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Create task_types table
create table public.task_types (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  color text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  unique(name, user_id)
);

-- Set up Row Level Security (RLS)
alter table public.classes enable row level security;
alter table public.tasks enable row level security;
alter table public.task_types enable row level security;

-- Create policies for classes
create policy "Users can view their own classes"
  on public.classes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own classes"
  on public.classes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own classes"
  on public.classes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own classes"
  on public.classes for delete
  using (auth.uid() = user_id);

-- Create policies for tasks
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Create policies for task types
create policy "Users can view their own task types"
  on public.task_types for select
  using (auth.uid() = user_id);

create policy "Users can insert their own task types"
  on public.task_types for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own task types"
  on public.task_types for update
  using (auth.uid() = user_id);

create policy "Users can delete their own task types"
  on public.task_types for delete
  using (auth.uid() = user_id);

-- Create indexes
create index classes_user_id_idx on public.classes(user_id);
create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_date_idx on public.tasks(date);
create index task_types_user_id_idx on public.task_types(user_id); 