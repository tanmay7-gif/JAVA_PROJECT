import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const DEMO_ATHLETE_USER: User = {
  id: '54429127-f8e3-495b-87e7-da9b5b584546',
  name: 'Sarah Connor',
  email: 'sarah@fitpulse.com',
  role: 'USER',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_ADMIN_USER: User = {
  id: '88124930-a9e1-419b-81d2-[#9841893]',
  name: 'Marcus Vance',
  email: 'admin@fitpulse.com',
  role: 'ADMIN',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string, role?: Role) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  switchDemoUser: (targetRole: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedRole = localStorage.getItem('fitpulse_demo_role');
    const savedToken = localStorage.getItem('fitpulse_token');
    if (savedToken) {
      return savedRole === 'ADMIN' ? DEMO_ADMIN_USER : DEMO_ATHLETE_USER;
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fitpulse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    const savedToken = localStorage.getItem('fitpulse_token');
    const savedRole = localStorage.getItem('fitpulse_demo_role');
    if (savedToken && !user) {
      setUser(savedRole === 'ADMIN' ? DEMO_ADMIN_USER : DEMO_ATHLETE_USER);
    }
  }, []);

  const login = async (email: string, password = 'User123!') => {
    setIsLoading(true);
    try {
      // Try backend first; fallback to demo instant login seamlessly
      try {
        const res = await api.login({ email, password });
        if (res.success && res.data) {
          localStorage.setItem('fitpulse_token', res.data.token);
          localStorage.setItem('fitpulse_demo_role', res.data.user.role);
          setToken(res.data.token);
          setUser(res.data.user);
          showToast(`Welcome back, ${res.data.user.name}!`, 'success');
          return;
        }
      } catch {
        // Backend not reachable or error -> fallback to mock demo user
      }

      const targetUser = email.toLowerCase().includes('admin') ? DEMO_ADMIN_USER : DEMO_ATHLETE_USER;
      const fakeToken = `demo_jwt_token_${Date.now()}`;
      localStorage.setItem('fitpulse_token', fakeToken);
      localStorage.setItem('fitpulse_demo_role', targetUser.role);
      setToken(fakeToken);
      setUser(targetUser);
      showToast(`Welcome to Portal, ${targetUser.name}!`, 'success');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password = 'User123!', role: Role = 'USER') => {
    setIsLoading(true);
    try {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: name || 'Sarah Connor',
        email,
        role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const fakeToken = `demo_jwt_token_${Date.now()}`;
      localStorage.setItem('fitpulse_token', fakeToken);
      localStorage.setItem('fitpulse_demo_role', role);
      setToken(fakeToken);
      setUser(newUser);
      showToast(`Account created! Welcome, ${newUser.name}.`, 'success');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fitpulse_token');
    localStorage.removeItem('fitpulse_demo_role');
    setToken(null);
    setUser(null);
    showToast('You have been safely signed out.', 'info');
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const switchDemoUser = async (targetRole: Role) => {
    const targetUser = targetRole === 'ADMIN' ? DEMO_ADMIN_USER : DEMO_ATHLETE_USER;
    const fakeToken = `demo_jwt_token_${Date.now()}`;
    localStorage.setItem('fitpulse_token', fakeToken);
    localStorage.setItem('fitpulse_demo_role', targetRole);
    setToken(fakeToken);
    setUser(targetUser);
    showToast(`Switched to ${targetUser.name} (${targetRole})`, 'success');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: (user?.role as Role) || null,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
