'use client';

import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import ActionButton from './ActionButton';

interface ChatMessagesProps {
  messages: ChatMessage[];
  onQuickAction: (action: string) => void;
}

export default function ChatMessages({ messages, onQuickAction }: ChatMessagesProps) {
  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          {/* 아바타 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {message.role === 'user' ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>

          {/* 메시지 내용 */}
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              message.role === 'user'
                ? 'bg-orange-500 text-white rounded-tr-sm'
                : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
            }`}
          >
            {/* 텍스트 (마크다운 스타일 처리) */}
            <div className="text-sm whitespace-pre-wrap">
              {formatMessage(message.content)}
            </div>

            {/* 액션 버튼들 */}
            {message.data?.actions && message.data.actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.data.actions.map((action, index) => (
                  <ActionButton
                    key={index}
                    action={action}
                    onAction={onQuickAction}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

// 간단한 마크다운 스타일 처리
function formatMessage(content: string): React.ReactNode {
  // **bold** 처리
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
