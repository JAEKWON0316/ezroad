'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, Loader2, X, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ChatMessages from './ChatMessages';
import QuickActions from './QuickActions';
import { useChat } from '@/context/ChatContext';

interface ChatModalProps {
  onClose: () => void;
}

export default function ChatModal({ onClose }: ChatModalProps) {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, clearHistory } = useChat();
  const [input, setInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enter 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'recommend': sendMessage('맛집 추천해줘'); break;
      case 'course': sendMessage('코스 추천해줘'); break;
      case 'reservation': sendMessage('내 예약 상태 알려줘'); break;
      case 'waiting': sendMessage('내 대기 상태 알려줘'); break;
      default: break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed inset-0 z-[100] md:inset-auto md:bottom-24 md:right-6 md:w-[400px] md:h-[600px] bg-white/95 backdrop-blur-xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20"
    >
      {/* 프리미엄 헤더 */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-4 flex items-center gap-3 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

        <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner relative z-10">
          <Bot className="w-6 h-6 text-white" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm" />
        </div>

        <div className="flex-1 relative z-10">
          <h3 className="font-bold text-lg tracking-tight leading-tight">LinkyBot</h3>
          <p className="text-[11px] font-medium opacity-90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            AI 맛집 비서
          </p>
        </div>

        <div className="flex items-center gap-1 relative z-10">
          <button
            onClick={() => {
              if (confirm('대화 내역을 모두 삭제하시겠습니까?')) {
                clearHistory();
              }
            }}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            title="대화 내역 삭제"
          >
            <Trash2 className="w-5 h-5 opacity-80" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50 custom-scrollbar">
        {user && messages.length <= 1 && (
          <div className="text-center py-4 bg-white/50 rounded-2xl border border-dashed border-gray-200 mb-4 mx-2">
            <p className="text-sm text-gray-500 font-medium whitespace-pre-wrap">
              &quot;{user.nickname || user.name}&quot;님, 안녕하세요! 👋\n오늘 어떤 맛집을 찾으시나요?
            </p>
          </div>
        )}

        <ChatMessages
          messages={messages}
          onQuickAction={handleQuickAction}
        />

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-gray-400"
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            </div>
            <span className="text-xs font-medium italic">LinkyBot이 답변을 생각 중입니다...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 푸터 영역: 퀵 액션 + 입력창 */}
      <div className="bg-white border-t border-gray-100 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-safe">
        <QuickActions onAction={handleQuickAction} />

        <div className="p-4 pt-2">
          <div className="relative group">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="궁금한 점을 물어보세요..."
              className="w-full pl-5 pr-14 py-3.5 bg-gray-100 border-transparent rounded-2xl focus:bg-white focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-medium placeholder:text-gray-400 outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-tr from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-orange-500/20 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-2 text-[10px] text-center text-gray-400">AI는 가끔 부정확한 정보를 제공할 수 있습니다.</p>
        </div>
      </div>
    </motion.div>
  );
}
