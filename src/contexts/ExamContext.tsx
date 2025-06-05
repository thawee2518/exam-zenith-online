
import React, { createContext, useContext, useState } from 'react';
import { ExamSet, Question, ExamAttempt } from '@/types/exam';
import { supabase } from '@/integrations/supabase/client';

interface ExamContextType {
  examSets: ExamSet[];
  currentExam: ExamSet | null;
  currentAttempt: ExamAttempt | null;
  loading: boolean;
  
  // Exam management
  fetchExamSets: () => Promise<void>;
  createExamSet: (examSet: Omit<ExamSet, 'id' | 'createdAt' | 'questions'>) => Promise<string | null>;
  updateExamSet: (id: string, updates: Partial<ExamSet>) => Promise<boolean>;
  deleteExamSet: (id: string) => Promise<boolean>;
  
  // Question management
  addQuestion: (examSetId: string, question: Omit<Question, 'id' | 'examSetId'>) => Promise<boolean>;
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<boolean>;
  deleteQuestion: (id: string) => Promise<boolean>;
  
  // Exam taking
  startExam: (examSetId: string) => Promise<boolean>;
  submitAnswer: (questionId: string, selectedAnswer: number) => void;
  submitExam: () => Promise<boolean>;
  
  // Results
  fetchExamAttempts: (studentId?: string) => Promise<ExamAttempt[]>;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const useExam = () => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [currentExam, setCurrentExam] = useState<ExamSet | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchExamSets = async () => {
    setLoading(true);
    try {
      const { data: examSetsData, error: examSetsError } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('is_active', true);

      if (examSetsError) throw examSetsError;

      const examSetsWithQuestions = await Promise.all(
        examSetsData.map(async (examSet) => {
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_set_id', examSet.id)
            .order('order_num');

          if (questionsError) throw questionsError;

          return {
            id: examSet.id,
            title: examSet.title,
            description: examSet.description || '',
            createdBy: examSet.created_by,
            createdAt: new Date(examSet.created_at),
            isActive: examSet.is_active,
            timeLimit: examSet.time_limit,
            questions: questions.map(q => ({
              id: q.id,
              examSetId: q.exam_set_id,
              questionText: q.question_text,
              imageUrl: q.image_url,
              options: q.options as string[],
              correctAnswer: q.correct_answer,
              order: q.order_num
            }))
          } as ExamSet;
        })
      );

      setExamSets(examSetsWithQuestions);
    } catch (error) {
      console.error('Error fetching exam sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createExamSet = async (examSetData: Omit<ExamSet, 'id' | 'createdAt' | 'questions'>): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .insert({
          title: examSetData.title,
          description: examSetData.description,
          created_by: examSetData.createdBy,
          is_active: examSetData.isActive,
          time_limit: examSetData.timeLimit
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchExamSets(); // Refresh the list
      return data.id;
    } catch (error) {
      console.error('Error creating exam set:', error);
      return null;
    }
  };

  const updateExamSet = async (id: string, updates: Partial<ExamSet>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('exam_sets')
        .update({
          title: updates.title,
          description: updates.description,
          is_active: updates.isActive,
          time_limit: updates.timeLimit
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchExamSets(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error updating exam set:', error);
      return false;
    }
  };

  const deleteExamSet = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('exam_sets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchExamSets(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting exam set:', error);
      return false;
    }
  };

  const addQuestion = async (examSetId: string, questionData: Omit<Question, 'id' | 'examSetId'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          exam_set_id: examSetId,
          question_text: questionData.questionText,
          image_url: questionData.imageUrl,
          options: questionData.options,
          correct_answer: questionData.correctAnswer,
          order_num: questionData.order
        });

      if (error) throw error;
      
      await fetchExamSets(); // Refresh to get updated questions
      return true;
    } catch (error) {
      console.error('Error adding question:', error);
      return false;
    }
  };

  const updateQuestion = async (id: string, updates: Partial<Question>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          question_text: updates.questionText,
          image_url: updates.imageUrl,
          options: updates.options,
          correct_answer: updates.correctAnswer,
          order_num: updates.order
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchExamSets(); // Refresh to get updated questions
      return true;
    } catch (error) {
      console.error('Error updating question:', error);
      return false;
    }
  };

  const deleteQuestion = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchExamSets(); // Refresh to get updated questions
      return true;
    } catch (error) {
      console.error('Error deleting question:', error);
      return false;
    }
  };

  const startExam = async (examSetId: string): Promise<boolean> => {
    const examSet = examSets.find(e => e.id === examSetId);
    if (!examSet) return false;

    const attempt: ExamAttempt = {
      id: crypto.randomUUID(),
      studentId: '', // Will be set when submitting
      examSetId,
      answers: [],
      score: 0,
      totalQuestions: examSet.questions.length,
      startTime: new Date(),
      endTime: new Date(),
      isCompleted: false
    };

    setCurrentExam(examSet);
    setCurrentAttempt(attempt);
    return true;
  };

  const submitAnswer = (questionId: string, selectedAnswer: number) => {
    if (!currentAttempt) return;

    const updatedAnswers = [...currentAttempt.answers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex].selectedAnswer = selectedAnswer;
    } else {
      updatedAnswers.push({ questionId, selectedAnswer });
    }

    setCurrentAttempt({
      ...currentAttempt,
      answers: updatedAnswers
    });
  };

  const submitExam = async (): Promise<boolean> => {
    if (!currentAttempt || !currentExam) return false;

    try {
      // Calculate score
      let score = 0;
      currentAttempt.answers.forEach(answer => {
        const question = currentExam.questions.find(q => q.id === answer.questionId);
        if (question && question.correctAnswer === answer.selectedAnswer) {
          score++;
        }
      });

      const endTime = new Date();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('exam_attempts')
        .insert({
          student_id: user.id,
          exam_set_id: currentAttempt.examSetId,
          answers: currentAttempt.answers,
          score,
          total_questions: currentAttempt.totalQuestions,
          start_time: currentAttempt.startTime.toISOString(),
          end_time: endTime.toISOString(),
          is_completed: true
        });

      if (error) throw error;

      setCurrentAttempt({
        ...currentAttempt,
        score,
        endTime,
        isCompleted: true
      });

      return true;
    } catch (error) {
      console.error('Error submitting exam:', error);
      return false;
    }
  };

  const fetchExamAttempts = async (studentId?: string): Promise<ExamAttempt[]> => {
    try {
      let query = supabase
        .from('exam_attempts')
        .select(`
          *,
          exam_sets!inner(title)
        `);

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(attempt => ({
        id: attempt.id,
        studentId: attempt.student_id,
        examSetId: attempt.exam_set_id,
        answers: attempt.answers as { questionId: string; selectedAnswer: number }[],
        score: attempt.score,
        totalQuestions: attempt.total_questions,
        startTime: new Date(attempt.start_time),
        endTime: new Date(attempt.end_time),
        isCompleted: attempt.is_completed
      }));
    } catch (error) {
      console.error('Error fetching exam attempts:', error);
      return [];
    }
  };

  return (
    <ExamContext.Provider value={{
      examSets,
      currentExam,
      currentAttempt,
      loading,
      fetchExamSets,
      createExamSet,
      updateExamSet,
      deleteExamSet,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      startExam,
      submitAnswer,
      submitExam,
      fetchExamAttempts
    }}>
      {children}
    </ExamContext.Provider>
  );
};
