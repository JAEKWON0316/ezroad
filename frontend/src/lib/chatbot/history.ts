import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Supabase 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 타입 정의
export interface ChatMessage {
  id?: number;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface ChatSession {
  id?: number;
  member_id?: number | null;
  session_id: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
}

// 세션 ID 생성 (브라우저용)
export function generateSessionId(): string {
  return uuidv4();
}

// 세션 생성 또는 조회
export async function getOrCreateSession(
  sessionId: string,
  memberId?: number | null
): Promise<ChatSession | null> {
  try {
    // 기존 세션 조회
    const { data: existingSession, error: fetchError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (existingSession) {
      return existingSession;
    }

    // 없으면 새로 생성
    const { data: newSession, error: createError } = await supabase
      .from('chat_sessions')
      .insert({
        session_id: sessionId,
        member_id: memberId || null,
        title: '새 대화',
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create session:', createError);
      return null;
    }

    return newSession;
  } catch (error) {
    console.error('Error in getOrCreateSession:', error);
    return null;
  }
}

// 세션 제목 업데이트 (첫 메시지 기반)
export async function updateSessionTitle(
  sessionId: string,
  title: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ 
        title: title.slice(0, 50) + (title.length > 50 ? '...' : ''),
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId);

    return !error;
  } catch (error) {
    console.error('Error in updateSessionTitle:', error);
    return false;
  }
}

// 메시지 저장
export async function saveMessage(message: ChatMessage): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_history')
      .insert({
        session_id: message.session_id,
        role: message.role,
        content: message.content,
        metadata: message.metadata || null,
      });

    if (error) {
      console.error('Failed to save message:', error);
      return false;
    }

    // 세션 updated_at 갱신
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('session_id', message.session_id);

    return true;
  } catch (error) {
    console.error('Error in saveMessage:', error);
    return false;
  }
}

// 대화 히스토리 조회
export async function getMessages(
  sessionId: string,
  limit: number = 50
): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
}

// 최근 N개 메시지 조회 (컨텍스트용)
export async function getRecentMessages(
  sessionId: string,
  count: number = 10
): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(count);

    if (error) {
      console.error('Failed to fetch recent messages:', error);
      return [];
    }

    // 시간순으로 다시 정렬
    return (data || []).reverse();
  } catch (error) {
    console.error('Error in getRecentMessages:', error);
    return [];
  }
}

// 사용자의 모든 세션 조회
export async function getUserSessions(
  memberId: number,
  limit: number = 20
): Promise<ChatSession[]> {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('member_id', memberId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch user sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserSessions:', error);
    return [];
  }
}

// 세션 삭제
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    // 먼저 관련 메시지 삭제
    await supabase
      .from('chat_history')
      .delete()
      .eq('session_id', sessionId);

    // 세션 삭제
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('session_id', sessionId);

    return !error;
  } catch (error) {
    console.error('Error in deleteSession:', error);
    return false;
  }
}

export default {
  generateSessionId,
  getOrCreateSession,
  updateSessionTitle,
  saveMessage,
  getMessages,
  getRecentMessages,
  getUserSessions,
  deleteSession,
};
