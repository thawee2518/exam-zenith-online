
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Students can view own attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Students can create own attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Students can update own attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Allow viewing active exam sets" ON public.exam_sets;
DROP POLICY IF EXISTS "Admins can manage exam sets" ON public.exam_sets;
DROP POLICY IF EXISTS "Allow viewing questions from active exams" ON public.questions;
DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for exam_attempts table
CREATE POLICY "Students can view own attempts" ON public.exam_attempts
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create own attempts" ON public.exam_attempts
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own attempts" ON public.exam_attempts
  FOR UPDATE USING (auth.uid() = student_id);

-- Create policies for exam_sets table
CREATE POLICY "Allow viewing active exam sets" ON public.exam_sets
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage exam sets" ON public.exam_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create policies for questions table
CREATE POLICY "Allow viewing questions from active exams" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.exam_sets 
      WHERE exam_sets.id = questions.exam_set_id 
      AND exam_sets.is_active = true
    )
  );

CREATE POLICY "Admins can manage questions" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
