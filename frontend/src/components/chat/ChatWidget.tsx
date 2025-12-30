'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatModal from './ChatModal';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg 
          flex items-center justify-center transition-all duration-300 
          ${isOpen 
            ? 'bg-gray-600 hover:bg-gray-700' 
            : 'bg-orange-500 hover:bg-orange-600'
          }`}
        aria-label={isOpen ? '챗봇 닫기' : '챗봇 열기'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* 채팅 모달 */}
      {isOpen && (
        <ChatModal onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
