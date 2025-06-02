
import React, { useState } from 'react';
import { useExam } from '@/contexts/ExamContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateQuestionFormProps {
  examSetId: string;
  onClose: () => void;
}

const CreateQuestionForm: React.FC<CreateQuestionFormProps> = ({ examSetId, onClose }) => {
  const { addQuestion, examSets } = useExam();
  const { toast } = useToast();
  
  const [questionData, setQuestionData] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    imageUrl: ''
  });

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionData.options];
    newOptions[index] = value;
    setQuestionData({...questionData, options: newOptions});
  };

  const addOption = () => {
    if (questionData.options.length < 6) {
      setQuestionData({
        ...questionData,
        options: [...questionData.options, '']
      });
    }
  };

  const removeOption = (index: number) => {
    if (questionData.options.length > 2) {
      const newOptions = questionData.options.filter((_, i) => i !== index);
      setQuestionData({
        ...questionData,
        options: newOptions,
        correctAnswer: questionData.correctAnswer >= newOptions.length ? 0 : questionData.correctAnswer
      });
    }
  };

  const handleSubmit = () => {
    if (!questionData.questionText.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณากรอกคำถาม",
        variant: "destructive"
      });
      return;
    }

    const validOptions = questionData.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก",
        variant: "destructive"
      });
      return;
    }

    if (!validOptions[questionData.correctAnswer]?.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาเลือกคำตอบที่ถูกต้อง",
        variant: "destructive"
      });
      return;
    }

    const currentExam = examSets.find(exam => exam.id === examSetId);
    const nextOrder = currentExam ? currentExam.questions.length + 1 : 1;

    addQuestion(examSetId, {
      questionText: questionData.questionText,
      options: validOptions,
      correctAnswer: questionData.correctAnswer,
      order: nextOrder,
      imageUrl: questionData.imageUrl || undefined
    });

    toast({
      title: "สำเร็จ!",
      description: "เพิ่มคำถามใหม่เรียบร้อยแล้ว"
    });

    setQuestionData({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      imageUrl: ''
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เพิ่มคำถามใหม่</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="question">คำถาม</Label>
            <Textarea
              id="question"
              value={questionData.questionText}
              onChange={(e) => setQuestionData({...questionData, questionText: e.target.value})}
              placeholder="กรอกคำถาม"
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">URL รูปภาพ (ไม่บังคับ)</Label>
            <Input
              id="imageUrl"
              value={questionData.imageUrl}
              onChange={(e) => setQuestionData({...questionData, imageUrl: e.target.value})}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label>ตัวเลือก</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={questionData.options.length >= 6}
              >
                <Plus className="h-4 w-4 mr-1" />
                เพิ่มตัวเลือก
              </Button>
            </div>
            
            <RadioGroup
              value={questionData.correctAnswer.toString()}
              onValueChange={(value) => setQuestionData({...questionData, correctAnswer: parseInt(value)})}
            >
              {questionData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`ตัวเลือกที่ ${index + 1}`}
                    className="flex-1"
                  />
                  {questionData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
            <p className="text-sm text-gray-600 mt-2">
              เลือกตัวเลือกที่ถูกต้องโดยคลิกที่วงกลมด้านหน้า
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} className="flex-1">
              เพิ่มคำถาม
            </Button>
            <Button variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuestionForm;
