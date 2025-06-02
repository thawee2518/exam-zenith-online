
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useExam } from '@/contexts/ExamContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, TrendingUp, Award, Plus, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { examSets, userAttempts, getExamStats } = useExam();
  const navigate = useNavigate();

  if (user?.role === 'admin') {
    const totalExams = examSets.length;
    const totalQuestions = examSets.reduce((sum, exam) => sum + exam.questions.length, 0);
    const totalAttempts = userAttempts.length;
    const activeExams = examSets.filter(exam => exam.isActive).length;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ดผู้ดูแลระบบ</h1>
            <p className="text-gray-600">ภาพรวมการจัดการข้อสอบ</p>
          </div>
          <Button 
            onClick={() => navigate('/exams')}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            สร้างข้อสอบใหม่
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ชุดข้อสอบทั้งหมด</CardTitle>
              <BookOpen className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExams}</div>
              <p className="text-xs opacity-75">ชุดข้อสอบในระบบ</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คำถามทั้งหมด</CardTitle>
              <Award className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <p className="text-xs opacity-75">คำถามในระบบ</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การทำข้อสอบ</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttempts}</div>
              <p className="text-xs opacity-75">ครั้งทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ข้อสอบที่เปิดใช้</CardTitle>
              <Users className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeExams}</div>
              <p className="text-xs opacity-75">ชุดข้อสอบ</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Exams */}
        <Card>
          <CardHeader>
            <CardTitle>ชุดข้อสอบล่าสุด</CardTitle>
            <CardDescription>ข้อสอบที่สร้างล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            {examSets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>ยังไม่มีชุดข้อสอบในระบบ</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/exams')}
                >
                  สร้างข้อสอบแรก
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {examSets.slice(0, 5).map((exam) => {
                  const stats = getExamStats(exam.id);
                  return (
                    <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{exam.title}</h3>
                        <p className="text-sm text-gray-600">{exam.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{exam.questions.length} คำถาม</span>
                          <span>{stats.totalAttempts} การทำข้อสอบ</span>
                          <span className={exam.isActive ? 'text-green-600' : 'text-red-600'}>
                            {exam.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/exams/${exam.id}`)}
                      >
                        จัดการ
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Student Dashboard
  const availableExams = examSets.filter(exam => exam.isActive);
  const myAttempts = userAttempts.filter(attempt => attempt.studentId === user?.id);
  const completedExams = new Set(myAttempts.map(attempt => attempt.examSetId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ข้อสอบของฉัน</h1>
        <p className="text-gray-600">เลือกข้อสอบที่ต้องการทำ</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ข้อสอบที่มี</CardTitle>
            <BookOpen className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableExams.length}</div>
            <p className="text-xs opacity-75">ชุดข้อสอบ</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ทำแล้ว</CardTitle>
            <Award className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedExams.size}</div>
            <p className="text-xs opacity-75">ชุดข้อสอบ</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การทำข้อสอบ</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myAttempts.length}</div>
            <p className="text-xs opacity-75">ครั้งทั้งหมด</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Exams */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อสอบที่สามารถทำได้</CardTitle>
          <CardDescription>เลือกข้อสอบที่ต้องการทำ</CardDescription>
        </CardHeader>
        <CardContent>
          {availableExams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีข้อสอบที่เปิดให้ทำ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableExams.map((exam) => {
                const hasAttempted = completedExams.has(exam.id);
                const latestAttempt = myAttempts
                  .filter(attempt => attempt.examSetId === exam.id)
                  .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())[0];
                
                return (
                  <Card key={exam.id} className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <CardDescription>{exam.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{exam.questions.length} คำถาม</span>
                        {exam.timeLimit && <span>{exam.timeLimit} นาที</span>}
                      </div>
                      
                      {hasAttempted && latestAttempt && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700 font-medium">
                            คะแนนล่าสุด: {latestAttempt.score}/{latestAttempt.totalQuestions} 
                            ({Math.round((latestAttempt.score / latestAttempt.totalQuestions) * 100)}%)
                          </p>
                        </div>
                      )}
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                        onClick={() => navigate(`/exam/${exam.id}`)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {hasAttempted ? 'ทำอีกครั้ง' : 'เริ่มทำข้อสอบ'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
