import { createClient } from '@supabase/supabase-js';

// Try to get from environment variables first, then fallback to default values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('You can find these values in your Supabase project dashboard under Settings > API');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// Types for our database
export interface Profile {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'student';
  created_at: string;
  updated_at: string;
}

export interface ExamSet {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  time_limit: number | null;
  questions?: Question[];
}

export interface Question {
  id: string;
  exam_set_id: string;
  question_text: string;
  image_url: string | null;
  options: string[];
  correct_answer: number;
  order_num: number;
  created_at: string;
  updated_at: string;
}

export interface ExamAttempt {
  id: string;
  student_id: string;
  exam_set_id: string;
  answers: { questionId: string; selectedAnswer: number }[];
  score: number;
  total_questions: number;
  start_time: string;
  end_time: string;
  is_completed: boolean;
  created_at: string;
}
