import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

const IS_DEMO_AUTH = (import.meta.env.VITE_AUTH_MODE || 'demo') === 'demo';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isSubAdmin: boolean;
  isEmployee: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  switchRoleDemo: (target: 'SUPER_ADMIN' | 'SUB_ADMIN_1' | 'SUB_ADMIN_2' | 'EMPLOYEE') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_SUPER_ADMIN: User = {
  id: 'usr_super_1',
  email: 'superadmin@enterprise.com',
  name: 'Alexander Wright',
  phone: '+1 (555) 019-2831',
  role: 'SUPER_ADMIN',
  status: 'ACTIVE',
  createdAt: '2026-01-10T08:00:00Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback below
      }
    }
    if (IS_DEMO_AUTH && !sessionStorage.getItem('demo_logged_out')) {
      localStorage.setItem('auth_user', JSON.stringify(DEFAULT_SUPER_ADMIN));
      return DEFAULT_SUPER_ADMIN;
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('auth_token');
    if (stored) return stored;
    if (IS_DEMO_AUTH && !sessionStorage.getItem('demo_logged_out')) {
      const defaultToken = 'demo_session_usr_super_1_SUPER_ADMIN';
      localStorage.setItem('auth_token', defaultToken);
      return defaultToken;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await authApi.getCurrentUser();
        if (profile) {
          setUser(profile);
          localStorage.setItem('auth_user', JSON.stringify(profile));
        }
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await authApi.login(email, password);
    sessionStorage.removeItem('demo_logged_out');
    localStorage.setItem('auth_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      sessionStorage.setItem('demo_logged_out', 'true');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      setUser(null);
      setToken(null);
    }
  };

  const switchRoleDemo = async (
    target: 'SUPER_ADMIN' | 'SUB_ADMIN_1' | 'SUB_ADMIN_2' | 'EMPLOYEE'
  ) => {
    let email = 'superadmin@enterprise.com';
    if (target === 'SUB_ADMIN_1') email = 'subadmin.north@enterprise.com';
    if (target === 'SUB_ADMIN_2') email = 'subadmin.south@enterprise.com';
    if (target === 'EMPLOYEE') email = 'employee@enterprise.com';

    await login(email, 'password123');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isSubAdmin = user?.role === 'SUB_ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isSuperAdmin,
        isSubAdmin,
        isEmployee,
        login,
        logout,
        switchRoleDemo,
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
