import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('fitpulse_token');
    if (!saved || saved === 'undefined' || saved === 'null' || saved.startsWith('demo_jwt_token_')) {
      return null;
    }
    return saved.trim();
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fitpulse_token');
      localStorage.removeItem('fitpulse_demo_role');
    }
    setToken(null);
    setUser(null);
    showToast('You have been safely signed out.', 'info');
  }, [showToast]);

  // 1. Listen for global 401 Unauthorized Interceptor events
  useEffect(() => {
    const handleUnauthorized = (event: any) => {
      console.warn('[AuthContext] 401 Unauthorized Interceptor triggered.');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fitpulse_token');
        localStorage.removeItem('fitpulse_demo_role');
      }
      setToken(null);
      setUser(null);
      const msg = event?.detail?.message || 'Your session has expired. Please sign in again.';
      showToast(msg, 'error');
    };

    window.addEventListener('fitpulse_auth_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('fitpulse_auth_unauthorized', handleUnauthorized);
    };
  }, [showToast]);

  // 2. Validate token on initial mount via /api/auth/me
  useEffect(() => {
    let isMounted = true;
    const savedToken = localStorage.getItem('fitpulse_token');

    // Clean up malformed or legacy mock tokens immediately
    if (
      !savedToken ||
      savedToken === 'undefined' ||
      savedToken === 'null' ||
      savedToken.startsWith('demo_jwt_token_')
    ) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fitpulse_token');
        localStorage.removeItem('fitpulse_demo_role');
      }
      if (isMounted) {
        setToken(null);
        setUser(null);
        setIsLoading(false);
      }
      return;
    }

    // Verify cryptographic validity with backend
    api.getMe()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setUser(res.data);
          setToken(savedToken.trim());
          localStorage.setItem('fitpulse_demo_role', res.data.role);
        }
      })
      .catch((err) => {
        console.warn('[AuthContext] Initial token validation failed. Purging stale session.', err);
        if (isMounted) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('fitpulse_token');
            localStorage.removeItem('fitpulse_demo_role');
          }
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Authenticate with real backend credentials
  const login = async (email: string, password = 'User123!') => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success && res.data?.token) {
        const cleanToken = res.data.token.trim();
        localStorage.setItem('fitpulse_token', cleanToken);
        localStorage.setItem('fitpulse_demo_role', res.data.user.role);
        setToken(cleanToken);
        setUser(res.data.user);
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        return;
      }
      throw new Error(res.message || 'Authentication failed.');
    } catch (err: any) {
      console.error('[AuthContext] Login error:', err);
      showToast(err.message || 'Invalid credentials. Please verify email and password.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Register new athlete in database
  const register = async (name: string, email: string, password = 'User123!', role: Role = 'USER') => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password, role });
      if (res.success && res.data?.token) {
        const cleanToken = res.data.token.trim();
        localStorage.setItem('fitpulse_token', cleanToken);
        localStorage.setItem('fitpulse_demo_role', res.data.user.role || role);
        setToken(cleanToken);
        setUser(res.data.user);
        showToast(`Account created! Welcome, ${res.data.user.name}.`, 'success');
        return;
      }
      throw new Error(res.message || 'Registration failed.');
    } catch (err: any) {
      console.error('[AuthContext] Registration error:', err);
      showToast(err.message || 'Could not register account.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  // 5. Seamlessly switch between authenticated demo personas using valid backend credentials
  const switchDemoUser = async (targetRole: Role) => {
    setIsLoading(true);
    try {
      const email = targetRole === 'ADMIN' ? 'admin@fitpulse.com' : 'sarah@fitpulse.com';
      const password = targetRole === 'ADMIN' ? 'Admin123!' : 'User123!';

      const res = await api.login({ email, password });
      if (res.success && res.data?.token) {
        const cleanToken = res.data.token.trim();
        localStorage.setItem('fitpulse_token', cleanToken);
        localStorage.setItem('fitpulse_demo_role', targetRole);
        setToken(cleanToken);
        setUser(res.data.user);
        showToast(`Switched to ${res.data.user.name} (${targetRole})`, 'success');
        return;
      }
      throw new Error('Failed to obtain authenticated token for demo persona.');
    } catch (err: any) {
      console.error('[AuthContext] switchDemoUser error:', err);
      showToast('Could not switch demo user: ' + (err.message || ''), 'error');
    } finally {
      setIsLoading(false);
    }
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
