
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExamSet, Question, ExamAttempt, ExamStats } from '@/types/exam';

interface ExamContextType {
  examSets: ExamSet[];
  currentExam: ExamSet | null;
  userAttempts: ExamAttempt[];
  createExamSet: (examSet: Omit<ExamSet, 'id' | 'createdAt' | 'questions'>) => string;
  updateExamSet: (id: string, updates: Partial<ExamSet>) => void;
  deleteExamSet: (id: string) => void;
  addQuestion: (examSetId: string, question: Omit<Question, 'id' | 'examSetId'>) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (questionId: string) => void;
  setCurrentExam: (examSet: ExamSet | null) => void;
  submitExamAttempt: (attempt: Omit<ExamAttempt, 'id'>) => void;
  getExamStats: (examSetId: string) => ExamStats;
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
  const [userAttempts, setUserAttempts] = useState<ExamAttempt[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const storedExamSets = localStorage.getItem('examSets');
    const storedAttempts = localStorage.getItem('examAttempts');
    
    if (storedExamSets) {
      setExamSets(JSON.parse(storedExamSets));
    } else {
      // Create demo exam set
      const demoExamSet: ExamSet = {
        id: 'demo-1',
        title: 'ทดสอบความรู้พื้นฐาน',
        description: 'ข้อสอบตัวอย่างสำหรับทดสอบระบบ',
        createdBy: '1',
        createdAt: new Date(),
        isActive: true,
        timeLimit: 30,
        questions: [
          {
            id: 'q1',
            examSetId: 'demo-1',
            questionText: 'ข้อใดเป็นเมืองหลวงของประเทศไทย?',
            options: ['เชียงใหม่', 'กรุงเทพมหานคร', 'ขอนแก่น', 'หาดใหญ่'],
            correctAnswer: 1,
            order: 1
          },
          {
            id: 'q2',
            examSetId: 'demo-1',
            questionText: '2 + 2 = ?',
            options: ['3', '4', '5', '6'],
            correctAnswer: 1,
            order: 2
          }
        ]
      };
      setExamSets([demoExamSet]);
      localStorage.setItem('examSets', JSON.stringify([demoExamSet]));
    }
    
    if (storedAttempts) {
      setUserAttempts(JSON.parse(storedAttempts));
    }
  }, []);

  const createExamSet = (examSetData: Omit<ExamSet, 'id' | 'createdAt' | 'questions'>): string => {
    const newExamSet: ExamSet = {
      ...examSetData,
      id: Date.now().toString(),
      createdAt: new Date(),
      questions: []
    };
    
    const updatedExamSets = [...examSets, newExamSet];
    setExamSets(updatedExamSets);
    localStorage.setItem('examSets', JSON.stringify(updatedExamSets));
    
    return newExamSet.id;
  };

  const updateExamSet = (id: string, updates: Partial<ExamSet>) => {
    const updatedExamSets = examSets.map(exam => 
      exam.id === id ? { ...exam, ...updates } : exam
    );
    setExamSets(updatedExamSets);
    localStorage.setItem('examSets', JSON.stringify(updatedExamSets));
  };

  const deleteExamSet = (id: string) => {
    const updatedExamSets = examSets.filter(exam => exam.id !== id);
    setExamSets(updatedExamSets);
    localStorage.setItem('examSets', JSON.stringify(updatedExamSets));
  };

  const addQuestion = (examSetId: string, questionData: Omit<Question, 'id' | 'examSetId'>) => {
    const newQuestion: Question = {
      ...questionData,
      id: Date.now().toString(),
      examSetId
    };
    
    const updatedExamSets = examSets.map(exam => {
      if (exam.id === examSetId) {
        return {
          ...exam,
          questions: [...exam.questions, newQuestion]
        };
      }
      return exam;
    });
    
    setExamSets(updatedExamSets);
    localStorage.setItem('examSets', JSON.stringify(updatedExamSets));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    const updatedExamSets = examSets.map(exam => ({
      ...exam,
      questions: exam.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
    
    setExamSets(updatedExamSets);
    localStorage.setItem('examSets', JSON.stringify(updatedExamSets));
  };

  const deleteQuestion = (questionId: string) => {
    const updatedExamSets = examSets.map(exam => ({
      ...exam,
      questions: exam.questions.filter(q => q.id !== questionId)
    }));
    
    setExamSets(updatedExamSets);
    localStorage.setItem('examSets', JSON.stringify(updatedExamSets));
  };

  const submitExamAttempt = (attemptData: Omit<ExamAttempt, 'id'>) => {
    const newAttempt: ExamAttempt = {
      ...attemptData,
      id: Date.now().toString()
    };
    
    const updatedAttempts = [...userAttempts, newAttempt];
    setUserAttempts(updatedAttempts);
    localStorage.setItem('examAttempts', JSON.stringify(updatedAttempts));
  };

  const getExamStats = (examSetId: string): ExamStats => {
    const attempts = userAttempts.filter(attempt => attempt.examSetId === examSetId);
    
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0
      };
    }
    
    const scores = attempts.map(attempt => (attempt.score / attempt.totalQuestions) * 100);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passRate = (scores.filter(score => score >= 60).length / scores.length) * 100;
    
    return {
      totalAttempts: attempts.length,
      averageScore,
      highestScore,
      lowestScore,
      passRate
    };
  };

  return (
    <ExamContext.Provider value={{
      examSets,
      currentExam,
      userAttempts,
      createExamSet,
      updateExamSet,
      deleteExamSet,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      setCurrentExam,
      submitExamAttempt,
      getExamStats
    }}>
      {children}
    </ExamContext.Provider>
  );
};
