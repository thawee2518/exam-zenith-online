
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
  name: string;
  createdAt: Date;
}

export interface ExamSet {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  questions: Question[];
  isActive: boolean;
  timeLimit?: number; // in minutes
}

export interface Question {
  id: string;
  examSetId: string;
  questionText: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: number; // index of correct option (0-3)
  order: number;
}

export interface ExamAttempt {
  id: string;
  studentId: string;
  examSetId: string;
  answers: { questionId: string; selectedAnswer: number }[];
  score: number;
  totalQuestions: number;
  startTime: Date;
  endTime: Date;
  isCompleted: boolean;
}

export interface ExamStats {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
}
