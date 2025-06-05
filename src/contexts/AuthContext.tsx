
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/exam';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: { email: string; password: string; username: string; name: string; role: 'admin' | 'student' }) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to convert Supabase profile to our User type
const convertProfileToUser = (profile: any, email?: string): User => ({
  id: profile.id,
  username: profile.username,
  email: email,
  role: profile.role,
  name: profile.name,
  createdAt: new Date(profile.created_at)
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleSessionChange(session);
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      await handleSessionChange(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSessionChange = async (session: Session | null) => {
    if (session?.user) {
      // Get user profile from our profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile && !error) {
        setUser(convertProfileToUser(profile, session.user.email));
      } else {
        console.error('Error fetching profile:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }

    // The session change will be handled by the auth state listener
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const register = async (userData: { 
    email: string; 
    password: string; 
    username: string; 
    name: string; 
    role: 'admin' | 'student' 
  }): Promise<boolean> => {
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          name: userData.name,
          role: userData.role
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }

    // The profile will be created automatically via the trigger
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
