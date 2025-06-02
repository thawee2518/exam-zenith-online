
import React, { useState } from 'react';
import { useExam } from '@/contexts/ExamContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FileText, Clock, Users } from 'lucide-react';
import CreateQuestionForm from '@/components/CreateQuestionForm';
import { useToast } from '@/hooks/use-toast';

const ExamManagement = () => {
  const { user } = useAuth();
  const { examSets, createExamSet, updateExamSet, deleteExamSet, getExamStats } = useExam();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    isActive: true
  });

  const handleCreateExam = () => {
    if (!formData.title.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณากรอกชื่อข้อสอบ",
        variant: "destructive"
      });
      return;
    }

    const examId = createExamSet({
      title: formData.title,
      description: formData.description,
      createdBy: user?.id || '',
      isActive: formData.isActive,
      timeLimit: formData.timeLimit
    });

    toast({
      title: "สำเร็จ!",
      description: "สร้างชุดข้อสอบใหม่เรียบร้อยแล้ว"
    });

    setFormData({ title: '', description: '', timeLimit: 30, isActive: true });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateExam = (examId, updates) => {
    updateExamSet(examId, updates);
    toast({
      title: "สำเร็จ!",
      description: "อัปเดตข้อมูลข้อสอบเรียบร้อยแล้ว"
    });
    setEditingExam(null);
  };

  const handleDeleteExam = (examId) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อสอบนี้?')) {
      deleteExamSet(examId);
      toast({
        title: "สำเร็จ!",
        description: "ลบข้อสอบเรียบร้อยแล้ว"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการข้อสอบ</h1>
          <p className="text-gray-600">สร้างและจัดการชุดข้อสอบ</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              <Plus className="h-4 w-4 mr-2" />
              สร้างข้อสอบใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>สร้างชุดข้อสอบใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">ชื่อข้อสอบ</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="กรอกชื่อข้อสอบ"
                />
              </div>
              <div>
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="กรอกคำอธิบายข้อสอบ"
                />
              </div>
              <div>
                <Label htmlFor="timeLimit">เวลาทำข้อสอบ (นาที)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
                <Label htmlFor="isActive">เปิดใช้งาน</Label>
              </div>
              <Button onClick={handleCreateExam} className="w-full">
                สร้างข้อสอบ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exam Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examSets.map((exam) => {
          const stats = getExamStats(exam.id);
          return (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <CardDescription className="mt-1">{exam.description}</CardDescription>
                  </div>
                  <Badge variant={exam.isActive ? "default" : "secondary"}>
                    {exam.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <FileText className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                    <div className="font-medium">{exam.questions.length}</div>
                    <div className="text-gray-500">คำถาม</div>
                  </div>
                  <div className="text-center">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-green-600" />
                    <div className="font-medium">{exam.timeLimit}</div>
                    <div className="text-gray-500">นาที</div>
                  </div>
                  <div className="text-center">
                    <Users className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                    <div className="font-medium">{stats.totalAttempts}</div>
                    <div className="text-gray-500">ครั้ง</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuestionForm(exam.id)}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    เพิ่มคำถาม
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingExam(exam)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteExam(exam.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {examSets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีข้อสอบ</h3>
            <p className="text-gray-600 mb-4">เริ่มต้นสร้างข้อสอบแรกของคุณ</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              สร้างข้อสอบใหม่
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Question Form Dialog */}
      {showQuestionForm && (
        <CreateQuestionForm
          examSetId={showQuestionForm}
          onClose={() => setShowQuestionForm(null)}
        />
      )}
    </div>
  );
};

export default ExamManagement;
