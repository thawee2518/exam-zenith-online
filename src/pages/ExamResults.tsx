
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useExam } from '@/contexts/ExamContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Target, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const ExamResults = () => {
  const { user } = useAuth();
  const { userAttempts, examSets } = useExam();

  const myAttempts = userAttempts.filter(attempt => attempt.studentId === user?.id);
  
  // Group attempts by exam
  const attemptsByExam = myAttempts.reduce((acc, attempt) => {
    if (!acc[attempt.examSetId]) {
      acc[attempt.examSetId] = [];
    }
    acc[attempt.examSetId].push(attempt);
    return acc;
  }, {} as {[key: string]: typeof myAttempts});

  // Sort attempts by date (newest first)
  Object.keys(attemptsByExam).forEach(examId => {
    attemptsByExam[examId].sort((a, b) => 
      new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
    );
  });

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  // Calculate overall stats
  const totalAttempts = myAttempts.length;
  const averageScore = totalAttempts > 0 
    ? myAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions) * 100, 0) / totalAttempts
    : 0;
  const bestScore = totalAttempts > 0 
    ? Math.max(...myAttempts.map(attempt => (attempt.score / attempt.totalQuestions) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ผลการสอบ</h1>
        <p className="text-gray-600">ประวัติการทำข้อสอบและผลคะแนน</p>
      </div>

      {/* Overall Stats */}
      {totalAttempts > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จำนวนครั้งที่สอบ</CardTitle>
              <Target className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttempts}</div>
              <p className="text-xs opacity-75">ครั้งทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คะแนนเฉลี่ย</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
              <p className="text-xs opacity-75">เฉลี่ยทุกครั้ง</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คะแนนสูงสุด</CardTitle>
              <Trophy className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bestScore.toFixed(1)}%</div>
              <p className="text-xs opacity-75">คะแนนที่ดีที่สุด</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results by Exam */}
      {Object.keys(attemptsByExam).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(attemptsByExam).map(([examId, attempts]) => {
            const exam = examSets.find(e => e.id === examId);
            if (!exam) return null;

            const latestAttempt = attempts[0];
            const bestAttemptScore = Math.max(...attempts.map(a => (a.score / a.totalQuestions) * 100));

            return (
              <Card key={examId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{exam.title}</CardTitle>
                      <CardDescription>{exam.description}</CardDescription>
                    </div>
                    <Badge variant={getScoreBadge(bestAttemptScore)}>
                      สูงสุด {bestAttemptScore.toFixed(1)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attempts.map((attempt, index) => {
                      const percentage = (attempt.score / attempt.totalQuestions) * 100;
                      const duration = new Date(attempt.endTime).getTime() - new Date(attempt.startTime).getTime();
                      const durationMinutes = Math.round(duration / (1000 * 60));

                      return (
                        <div key={attempt.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium">
                                  ครั้งที่ {attempts.length - index}
                                  {index === 0 && <span className="text-blue-600 ml-2">(ล่าสุด)</span>}
                                </h4>
                                <Badge variant={getScoreBadge(percentage)}>
                                  {percentage.toFixed(1)}%
                                </Badge>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Target className="h-4 w-4" />
                                  <span>{attempt.score}/{attempt.totalQuestions} คะแนน</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{durationMinutes} นาที</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {format(new Date(attempt.endTime), 'dd MMM yyyy HH:mm', { locale: th })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีผลการสอบ</h3>
            <p className="text-gray-600 mb-4">เริ่มทำข้อสอบเพื่อดูผลคะแนน</p>
            <Button onClick={() => window.location.href = '/'}>
              ไปทำข้อสอบ
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamResults;
