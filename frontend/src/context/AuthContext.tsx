import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isLoading: boolean;
  isTrialAccount: boolean;
  setTrialMode: (isTrial: boolean) => void;
  login: (email: string, password?: string, isTrial?: boolean) => Promise<void>;
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
  const [isTrialAccount, setIsTrialAccount] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('fitpulse_is_trial');
    if (stored !== null) return stored === 'true';
    return true; // Default trial/demo for initial inspection
  });
  const { showToast } = useToast();

  const setTrialMode = useCallback((isTrial: boolean) => {
    setIsTrialAccount(isTrial);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fitpulse_is_trial', isTrial ? 'true' : 'false');
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fitpulse_token');
      localStorage.removeItem('fitpulse_demo_role');
      localStorage.removeItem('fitpulse_is_trial');
    }
    setToken(null);
    setUser(null);
    setIsTrialAccount(true);
    showToast('You have been safely signed out.', 'info');
  }, [showToast]);

  // 1. Listen for global 401 Unauthorized Interceptor events
  useEffect(() => {
    const handleUnauthorized = (event: any) => {
      console.warn('[AuthContext] 401 Unauthorized Interceptor triggered.');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fitpulse_token');
        localStorage.removeItem('fitpulse_demo_role');
        localStorage.removeItem('fitpulse_is_trial');
      }
      setToken(null);
      setUser(null);
      setIsTrialAccount(true);
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
          const storedTrial = localStorage.getItem('fitpulse_is_trial');
          const isTrial = storedTrial !== null
            ? storedTrial === 'true'
            : res.data.email === 'sarah@fitpulse.com' ||
              res.data.email === 'admin@fitpulse.com' ||
              res.data.email.includes('trial') ||
              res.data.email.includes('demo');

          setIsTrialAccount(isTrial);
          localStorage.setItem('fitpulse_is_trial', isTrial ? 'true' : 'false');
          setUser({ ...res.data, isTrialAccount: isTrial });
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
            localStorage.removeItem('fitpulse_is_trial');
          }
          setToken(null);
          setUser(null);
          setIsTrialAccount(true);
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
  const login = async (email: string, password = 'User123!', isTrialExplicit?: boolean) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success && res.data?.token) {
        const cleanToken = res.data.token.trim();
        const isTrial =
          isTrialExplicit !== undefined
            ? isTrialExplicit
            : email === 'sarah@fitpulse.com' ||
              email === 'admin@fitpulse.com' ||
              email.includes('demo') ||
              email.includes('trial');

        localStorage.setItem('fitpulse_token', cleanToken);
        localStorage.setItem('fitpulse_demo_role', res.data.user.role);
        localStorage.setItem('fitpulse_is_trial', isTrial ? 'true' : 'false');
        setToken(cleanToken);
        setIsTrialAccount(isTrial);
        setUser({ ...res.data.user, isTrialAccount: isTrial });
        showToast(
          `Welcome back, ${res.data.user.name}! ${isTrial ? '(Trial Demo Mode Active)' : '(Live User Account)'}`,
          'success'
        );
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

  // 4. Register new athlete in database - ALWAYS sets isTrialAccount = false (0 baseline)
  const register = async (name: string, email: string, password = 'User123!', role: Role = 'USER') => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password, role });
      if (res.success && res.data?.token) {
        const cleanToken = res.data.token.trim();
        localStorage.setItem('fitpulse_token', cleanToken);
        localStorage.setItem('fitpulse_demo_role', res.data.user.role || role);
        localStorage.setItem('fitpulse_is_trial', 'false');
        setToken(cleanToken);
        setIsTrialAccount(false); // Strict Real Account
        setUser({ ...res.data.user, isTrialAccount: false });
        showToast(`Account created! Welcome, ${res.data.user.name}. Initialized to strict zero-baseline.`, 'success');
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

  // 5. Seamlessly switch between authenticated demo personas - sets isTrialAccount = true
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
        localStorage.setItem('fitpulse_is_trial', 'true');
        setToken(cleanToken);
        setIsTrialAccount(true); // Demo mode is trial
        setUser({ ...res.data.user, isTrialAccount: true });
        showToast(`Switched to ${res.data.user.name} (${targetRole} Trial Demo)`, 'success');
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
        isTrialAccount,
        setTrialMode,
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
