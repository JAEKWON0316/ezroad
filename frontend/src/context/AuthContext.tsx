'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import { authApi, memberApi } from '@/lib/api';

// 비활동 타임아웃 시간 (30분)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

interface AuthContextType {
  user: User | null;
  accessToken: string | null;  // 토큰 상태 추가
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);  // 토큰 상태
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isAuthenticated = !!user && !!accessToken;

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      localStorage.removeItem('rememberMe');
      setUser(null);
      setAccessToken(null);  // 토큰 상태 초기화

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    }
  }, []);

  // 비활동 타이머 리셋
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    const isRemembered = typeof window !== 'undefined' && localStorage.getItem('rememberMe') === 'true';
    if (isRemembered) return;

    if (user) {
      inactivityTimerRef.current = setTimeout(() => {
        console.log('비활동으로 인한 자동 로그아웃');
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [user, logout]);

  // 사용자 활동 감지
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetInactivityTimer();

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetInactivityTimer();

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, resetInactivityTimer]);

  // 토큰으로 사용자 정보 가져오기
  const fetchUser = useCallback(async () => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) {
        setUser(null);
        setAccessToken(null);
        return;
      }

      setAccessToken(token);  // 토큰 상태 동기화
      const userData = await memberApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  // 초기 로딩 시 사용자 정보 가져오기
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await fetchUser();
      setIsLoading(false);
    };
    initAuth();
  }, [fetchUser]);

  // 로그인
  const login = async (data: LoginRequest, rememberMe: boolean = false) => {
    const response: AuthResponse = await authApi.login(data);
    const { accessToken: token, refreshToken } = response;

    if (rememberMe) {
      Cookies.set('accessToken', token, { expires: 7 });
      Cookies.set('refreshToken', refreshToken, { expires: 7 });
      localStorage.setItem('rememberMe', 'true');
    } else {
      Cookies.set('accessToken', token);
      Cookies.set('refreshToken', refreshToken);
      localStorage.removeItem('rememberMe');
    }

    setAccessToken(token);  // 토큰 상태 즉시 업데이트
    await fetchUser();
  };

  // 회원가입
  const register = async (data: RegisterRequest) => {
    await authApi.register(data);
    await login({ email: data.email, password: data.password }, false);
  };

  // 사용자 정보 업데이트
  const updateUser = async (data: Partial<User>) => {
    const updatedUser = await memberApi.updateMe(data);
    setUser(updatedUser);
  };

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    await fetchUser();
  };

  // 소셜 로그인용 토큰 직접 설정
  const setTokens = async (token: string, refreshToken: string) => {
    Cookies.set('accessToken', token, { expires: 7 });
    Cookies.set('refreshToken', refreshToken, { expires: 7 });
    setAccessToken(token);  // 토큰 상태 즉시 업데이트
    await fetchUser();
  };

  const value = {
    user,
    accessToken,  // 토큰 노출
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    setTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
