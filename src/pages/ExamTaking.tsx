
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExam } from '@/contexts/ExamContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ExamTaking = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { examSets, submitExamAttempt } = useExam();
  const { toast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: number}>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStartTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const exam = examSets.find(e => e.id === examId);

  useEffect(() => {
    if (!exam) {
      navigate('/');
      return;
    }

    if (exam.timeLimit) {
      setTimeLeft(exam.timeLimit * 60); // Convert minutes to seconds
    }
  }, [exam, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && exam?.timeLimit) {
      handleSubmitExam();
    }
  }, [timeLeft]);

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };

  const calculateScore = () => {
    if (!exam) return 0;
    
    let score = 0;
    exam.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const handleSubmitExam = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    if (!exam || !user) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่พบข้อมูลข้อสอบหรือผู้ใช้",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    const score = calculateScore();
    const endTime = new Date();
    
    const examAnswers = exam.questions.map(question => ({
      questionId: question.id,
      selectedAnswer: answers[question.id] ?? -1
    }));

    submitExamAttempt({
      studentId: user.id,
      examSetId: exam.id,
      answers: examAnswers,
      score,
      totalQuestions: exam.questions.length,
      startTime: examStartTime,
      endTime,
      isCompleted: true
    });

    toast({
      title: "สำเร็จ!",
      description: `ส่งข้อสอบเรียบร้อยแล้ว คะแนนที่ได้: ${score}/${exam.questions.length}`,
    });

    navigate('/results');
  };

  if (!exam) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">ไม่พบข้อสอบ</h1>
        <Button onClick={() => navigate('/')} className="mt-4">
          กลับหน้าหลัก
        </Button>
      </div>
    );
  }

  if (exam.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">ข้อสอบนี้ยังไม่มีคำถาม</h1>
        <Button onClick={() => navigate('/')} className="mt-4">
          กลับหน้าหลัก
        </Button>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl">{exam.title}</CardTitle>
              <p className="text-gray-600">
                คำถามที่ {currentQuestionIndex + 1} จาก {exam.questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {exam.timeLimit && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className={timeLeft < 300 ? 'text-red-600 font-bold' : ''}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                ตอบแล้ว: {answeredCount}/{exam.questions.length}
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.questionText}
          </CardTitle>
          {currentQuestion.imageUrl && (
            <div className="mt-4">
              <img
                src={currentQuestion.imageUrl}
                alt="Question"
                className="max-w-full h-auto rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id]?.toString() || ''}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              ข้อก่อนหน้า
            </Button>

            <div className="flex gap-2">
              {currentQuestionIndex === exam.questions.length - 1 ? (
                <Button
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อสอบ'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex(Math.min(exam.questions.length - 1, currentQuestionIndex + 1))}
                >
                  ข้อถัดไป
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ข้ามไปยังคำถาม</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {exam.questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestionIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 p-0 ${
                  answers[exam.questions[index].id] !== undefined 
                    ? 'bg-green-100 border-green-300' 
                    : ''
                }`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamTaking;
