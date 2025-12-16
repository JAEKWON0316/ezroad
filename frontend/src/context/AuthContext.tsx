'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import { authApi, memberApi } from '@/lib/api';

// 비활동 타임아웃 시간 (30분)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

interface AuthContextType {
  user: User | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isAuthenticated = !!user;

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      localStorage.removeItem('rememberMe'); // 상태 초기화
      setUser(null);

      // 타이머 정리
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

    // 로그인 유지 상태 확인
    const isRemembered = typeof window !== 'undefined' && localStorage.getItem('rememberMe') === 'true';
    if (isRemembered) return; // 로그인 유지 시 타이머 동작 안 함

    // 로그인된 상태에서만 타이머 설정
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

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // 이벤트 리스너 등록
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // 초기 타이머 설정
    resetInactivityTimer();

    return () => {
      // 이벤트 리스너 정리
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
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        setUser(null);
        return;
      }

      const userData = await memberApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // 토큰이 유효하지 않으면 삭제
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      setUser(null);
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

    if (rememberMe) {
      // "로그인 유지" 체크 시: 7일간 유지 및 localStorage에 상태 저장
      Cookies.set('accessToken', response.accessToken, { expires: 7 });
      Cookies.set('refreshToken', response.refreshToken, { expires: 7 });
      localStorage.setItem('rememberMe', 'true');
    } else {
      // 기본: 세션 쿠키 (브라우저 닫으면 삭제)
      Cookies.set('accessToken', response.accessToken);
      Cookies.set('refreshToken', response.refreshToken);
      localStorage.removeItem('rememberMe');
    }

    // 사용자 정보 가져오기
    await fetchUser();
  };

  // 회원가입
  const register = async (data: RegisterRequest) => {
    await authApi.register(data);
    // 회원가입 후 자동 로그인 (세션 쿠키로)
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
  const setTokens = async (accessToken: string, refreshToken: string) => {
    // 7일간 유지
    Cookies.set('accessToken', accessToken, { expires: 7 });
    Cookies.set('refreshToken', refreshToken, { expires: 7 });

    // 사용자 정보 가져오기
    await fetchUser();
  };

  const value = {
    user,
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
