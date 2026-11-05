import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isSubAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  switchRoleDemo: (target: 'SUPER_ADMIN' | 'SUB_ADMIN_1' | 'SUB_ADMIN_2') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          const profile = await authApi.getCurrentUser();
          setUser(profile);
          localStorage.setItem('auth_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Session verification failed, logging out', err);
          setUser(null);
          setToken(null);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth_user');
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await authApi.login(email, password);
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
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      setUser(null);
      setToken(null);
    }
  };

  const switchRoleDemo = async (target: 'SUPER_ADMIN' | 'SUB_ADMIN_1' | 'SUB_ADMIN_2') => {
    let email = 'superadmin@enterprise.com';
    if (target === 'SUB_ADMIN_1') email = 'subadmin.north@enterprise.com';
    if (target === 'SUB_ADMIN_2') email = 'subadmin.south@enterprise.com';

    await login(email, 'password123');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isSubAdmin = user?.role === 'SUB_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isSuperAdmin,
        isSubAdmin,
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
