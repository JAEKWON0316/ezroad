'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ChatMessage, ChatMessageData, RestaurantRecommendation } from '@/types/chat';
import ChatMessages from './ChatMessages';
import QuickActions from './QuickActions';

interface ChatModalProps {
  onClose: () => void;
}

export default function ChatModal({ onClose }: ChatModalProps) {
  const { user, accessToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `안녕하세요! 🙌 EzBot이에요.\n\n무엇을 도와드릴까요?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRecommendedRestaurants, setLastRecommendedRestaurants] = useState<RestaurantRecommendation[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          token: accessToken,
          lastRecommendedRestaurants,
        }),
      });

      const data = await response.json();

      // 추천된 식당 저장 (나중에 예약 연결용)
      if (data.data?.restaurants) {
        setLastRecommendedRestaurants(data.data.restaurants);
      }
      if (data.data?.course?.spots) {
        setLastRecommendedRestaurants(
          data.data.course.spots.map((s: { restaurant: RestaurantRecommendation }) => s.restaurant)
        );
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || '죄송해요, 응답을 생성하지 못했어요.',
        timestamp: new Date(),
        data: data.data as ChatMessageData,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송해요, 오류가 발생했어요. 잠시 후 다시 시도해주세요! 😅',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // 퀵 액션 처리
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'recommend':
        sendMessage('맛집 추천해줘');
        break;
      case 'course':
        sendMessage('코스 추천해줘');
        break;
      case 'reservation':
        sendMessage('내 예약 상태 알려줘');
        break;
      case 'waiting':
        sendMessage('내 대기 상태 알려줘');
        break;
      default:
        break;
    }
  };

  // Enter 키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* 헤더 */}
      <div className="bg-orange-500 text-white px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">EzBot</h3>
          <p className="text-xs text-orange-100">
            {user ? `${user.name}님, 무엇을 도와드릴까요?` : '맛집 추천 AI'}
          </p>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <ChatMessages 
          messages={messages} 
          onQuickAction={handleQuickAction}
        />
        
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">답변 생성 중...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 퀵 액션 */}
      <QuickActions onAction={handleQuickAction} />

      {/* 입력 영역 */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-orange-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
