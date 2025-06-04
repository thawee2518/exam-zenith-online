
-- Enable RLS (Row Level Security)
alter table if exists public.profiles disable row level security;
alter table if exists public.exam_sets disable row level security;
alter table if exists public.questions disable row level security;
alter table if exists public.exam_attempts disable row level security;

-- Drop existing tables if they exist
drop table if exists public.exam_attempts;
drop table if exists public.questions;
drop table if exists public.exam_sets;
drop table if exists public.profiles;

-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  name text not null,
  role text not null check (role in ('admin', 'student')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create exam_sets table
create table public.exam_sets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true,
  time_limit integer -- in minutes
);

-- Create questions table
create table public.questions (
  id uuid default gen_random_uuid() primary key,
  exam_set_id uuid references public.exam_sets(id) on delete cascade not null,
  question_text text not null,
  image_url text,
  options jsonb not null, -- array of strings
  correct_answer integer not null,
  order_num integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create exam_attempts table
create table public.exam_attempts (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  exam_set_id uuid references public.exam_sets(id) on delete cascade not null,
  answers jsonb not null, -- array of {questionId, selectedAnswer}
  score integer not null,
  total_questions integer not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.exam_sets enable row level security;
alter table public.questions enable row level security;
alter table public.exam_attempts enable row level security;

-- Create RLS policies

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Exam sets policies
create policy "Exam sets are viewable by everyone" on public.exam_sets
  for select using (true);

create policy "Admins can manage exam sets" on public.exam_sets
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Questions policies
create policy "Questions are viewable by everyone" on public.questions
  for select using (true);

create policy "Admins can manage questions" on public.questions
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Exam attempts policies
create policy "Students can view their own attempts" on public.exam_attempts
  for select using (auth.uid() = student_id);

create policy "Students can create their own attempts" on public.exam_attempts
  for insert with check (auth.uid() = student_id);

create policy "Admins can view all attempts" on public.exam_attempts
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
create index profiles_username_idx on public.profiles(username);
create index exam_sets_created_by_idx on public.exam_sets(created_by);
create index questions_exam_set_id_idx on public.questions(exam_set_id);
create index questions_order_idx on public.questions(exam_set_id, order_num);
create index exam_attempts_student_id_idx on public.exam_attempts(student_id);
create index exam_attempts_exam_set_id_idx on public.exam_attempts(exam_set_id);

-- Create function to handle profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', new.email),
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for automatic profile creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert demo data
insert into public.profiles (id, username, name, role) values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'ผู้ดูแลระบบ', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'student', 'นักเรียน', 'student');

-- Insert demo exam set
insert into public.exam_sets (id, title, description, created_by, is_active, time_limit) values
  ('demo-exam-001', 'ทดสอบความรู้พื้นฐาน', 'ข้อสอบตัวอย่างสำหรับทดสอบระบบ', '00000000-0000-0000-0000-000000000001', true, 30);

-- Insert demo questions
insert into public.questions (exam_set_id, question_text, options, correct_answer, order_num) values
  ('demo-exam-001', 'ข้อใดเป็นเมืองหลวงของประเทศไทย?', '["เชียงใหม่", "กรุงเทพมหานคร", "ขอนแก่น", "หาดใหญ่"]', 1, 1),
  ('demo-exam-001', '2 + 2 = ?', '["3", "4", "5", "6"]', 1, 2);
