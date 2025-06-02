
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ExamProvider } from "@/contexts/ExamContext";
import Layout from "./components/Layout";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./pages/Dashboard";
import ExamManagement from "./pages/ExamManagement";
import ExamTaking from "./pages/ExamTaking";
import ExamResults from "./pages/ExamResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/" replace /> : <AuthPage />} 
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ExamProvider>
                <Layout>
                  <Dashboard />
                </Layout>
              </ExamProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <ExamProvider>
                  <Layout>
                    <ExamManagement />
                  </Layout>
                </ExamProvider>
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/:examId"
          element={
            <ProtectedRoute>
              <ExamProvider>
                <Layout>
                  <ExamTaking />
                </Layout>
              </ExamProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <ExamProvider>
                <Layout>
                  <ExamResults />
                </Layout>
              </ExamProvider>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
