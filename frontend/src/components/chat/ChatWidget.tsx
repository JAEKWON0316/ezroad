'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import ChatModal from './ChatModal';
import { useChat } from '@/context/ChatContext';

export default function ChatWidget() {
  const { isChatOpen, toggleChat } = useChat();

  return (
    <>
      {/* 플로팅 버튼 */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => toggleChat()}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl 
          flex items-center justify-center transition-colors duration-300 group
          ${isChatOpen
            ? 'bg-gray-800 text-white'
            : 'bg-gradient-to-tr from-orange-500 to-red-500 text-white'
          }`}
        aria-label={isChatOpen ? '챗봇 닫기' : '챗봇 열기'}
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        {isChatOpen ? (
          <motion.div
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
          >
            <X className="w-7 h-7" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            className="relative"
          >
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
          </motion.div>
        )}
      </motion.button>

      {/* 채팅 모달 */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatModal onClose={() => toggleChat(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
