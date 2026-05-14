'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { User, BusinessSector } from '@/lib/types';
import { apiClient } from '@/lib/apiClient';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  onboarded: boolean;
  isInitializing: boolean;
  signup: (userData: User & { password?: string }) => Promise<boolean>;
  login: (email: string, pass: string) => Promise<boolean>;
  completeOnboarding: (sector: BusinessSector, inventoryEnabled: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedUser = localStorage.getItem('ai-bk-user');
    const savedOnboard = localStorage.getItem('ai-bk-onboarded');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedOnboard) setOnboarded(true);

    const loggedIn = localStorage.getItem('ai-bk-is-logged');
    const remembered = localStorage.getItem('ai-bk-device-remembered');
    const isPublic = ['/signup', '/login', '/onboarding'].includes(pathname);

    if (!loggedIn && !isPublic) {
      if (remembered) {
        router.push('/login');
      } else {
        router.push('/signup');
      }
    } else if (loggedIn && (pathname === '/signup' || pathname === '/login')) {
      router.push(savedOnboard ? '/' : '/onboarding');
    }

    // Ensure splash screen shows for at least 2 seconds
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathname, router]);

  const signup = async (userData: User & { password?: string }) => {
    try {
      const response = await apiClient('/auth/register', {
        data: {
          name: userData.ownerName || userData.businessName || 'User',
          email: userData.email,
          password: userData.password
        }
      });
      
      if (response.userId) {
        // Save the extra business data locally since backend doesn't support it yet
        const localUser = { ...userData, id: response.userId };
        setUser(localUser);
        localStorage.setItem('ai-bk-user', JSON.stringify(localUser));
        router.push('/login');
        return true;
      }
      return false;
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.message || "Failed to register");
      return false;
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const response = await apiClient('/auth/login', {
        data: { email, password: pass }
      });

      const token = response.token || response.data?.token;
      const responseUser = response.user || response.data?.user;

      if (token && responseUser) {
        localStorage.setItem('ai-bk-token', token);
        localStorage.setItem('ai-bk-is-logged', 'true');
        localStorage.setItem('ai-bk-device-remembered', 'true');
        
        // Merge backend user with our local user data (business fields)
        const savedUser = localStorage.getItem('ai-bk-user');
        let localUser = savedUser ? JSON.parse(savedUser) : {};
        
        const mergedUser = { ...localUser, ...responseUser };
        setUser(mergedUser);
        localStorage.setItem('ai-bk-user', JSON.stringify(mergedUser));

        if (!onboarded) {
          router.push('/onboarding');
        } else {
          router.push('/');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const completeOnboarding = (sector: BusinessSector, inventoryEnabled: boolean) => {
    if (user) {
      const updatedUser = { ...user, businessSector: sector, inventoryEnabled };
      setUser(updatedUser);
      localStorage.setItem('ai-bk-user', JSON.stringify(updatedUser));
    }
    setOnboarded(true);
    localStorage.setItem('ai-bk-onboarded', 'true');
    router.push('/');
  };

  const logout = () => {
    setUser(null);
    setOnboarded(false);
    localStorage.removeItem('ai-bk-user');
    localStorage.removeItem('ai-bk-onboarded');
    localStorage.removeItem('ai-bk-is-logged');
    localStorage.removeItem('ai-bk-token');
    router.push('/signup');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      onboarded, 
      isInitializing,
      signup, 
      login, 
      completeOnboarding, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
