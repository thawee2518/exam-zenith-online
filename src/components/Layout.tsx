
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, BookOpen, Users, BarChart3, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = user?.role === 'admin' ? [
    { path: '/', icon: BarChart3, label: 'Dashboard', labelTh: 'แดชบอร์ด' },
    { path: '/exams', icon: BookOpen, label: 'Manage Exams', labelTh: 'จัดการข้อสอบ' },
    { path: '/users', icon: Users, label: 'Users', labelTh: 'ผู้ใช้งาน' },
  ] : [
    { path: '/', icon: BookOpen, label: 'My Exams', labelTh: 'ข้อสอบของฉัน' },
    { path: '/results', icon: BarChart3, label: 'Results', labelTh: 'ผลการสอบ' },
  ];

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                ระบบข้อสอบออนไลน์
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.labelTh}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักเรียน'}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-blue-100">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "default" : "ghost"}
              onClick={() => navigate(item.path)}
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <item.icon className="h-4 w-4" />
              <span className="text-xs">{item.labelTh}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
