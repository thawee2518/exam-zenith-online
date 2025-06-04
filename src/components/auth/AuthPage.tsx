
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, User, Lock, Mail, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'student'>('student');
  
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let success = false;
      
      if (isLogin) {
        success = await login(email, password);
      } else {
        if (!username || !name) {
          toast({
            title: "ข้อผิดพลาด",
            description: "กรุณากรอกข้อมูลให้ครบถ้วน",
            variant: "destructive"
          });
          return;
        }
        success = await register({ email, password, username, name, role });
      }
      
      if (success) {
        toast({
          title: "สำเร็จ",
          description: isLogin ? "เข้าสู่ระบบสำเร็จ" : "ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
        });
        if (isLogin) {
          navigate('/');
        }
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: isLogin ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : "การลงทะเบียนล้มเหลว",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "ข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในระบบ",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            ระบบข้อสอบออนไลน์
          </h1>
          <p className="text-gray-600 mt-2">Online Examination System</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin ? 'กรุณาเข้าสู่ระบบเพื่อใช้งาน' : 'สร้างบัญชีใหม่'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">อีเมล</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="ใส่อีเมล"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="ใส่ชื่อผู้ใช้"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">ชื่อจริง</label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="ใส่ชื่อจริง"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">ประเภทผู้ใช้</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'admin' | 'student')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="student">นักเรียน</option>
                      <option value="admin">ผู้ดูแลระบบ</option>
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">รหัสผ่าน</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="ใส่รหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'กำลังดำเนินการ...' : isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700"
              >
                {isLogin ? 'ยังไม่มีบัญชี? ลงทะเบียน' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
              </Button>
            </div>

            {isLogin && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                <p className="font-medium">สำหรับทดสอบ:</p>
                <p>สร้างบัญชีใหม่หรือใช้บัญชีที่มีอยู่แล้ว</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
