'use client';

import React from 'react';
import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import ActionButton from './ActionButton';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ChatMessagesProps {
  messages: ChatMessage[];
  onQuickAction: (action: string) => void;
}

export default function ChatMessages({ messages, onQuickAction }: ChatMessagesProps) {
  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, delay: index === messages.length - 1 ? 0 : 0 }}
          className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          {/* 아바타 */}
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-105 ${message.role === 'user'
                ? 'bg-gradient-to-tr from-orange-500 to-red-500 text-white'
                : 'bg-white text-gray-600 border border-gray-100'
              }`}
          >
            {message.role === 'user' ? (
              <User className="w-5 h-5" />
            ) : (
              <Bot className="w-5 h-5" />
            )}
          </div>

          {/* 메시지 내용 */}
          <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
            <div
              className={`rounded-2xl px-5 py-3 shadow-sm ${message.role === 'user'
                  ? 'bg-gradient-to-tr from-orange-500 to-red-500 text-white rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}
            >
              <div className="text-[14px] leading-relaxed whitespace-pre-wrap">
                {formatMessage(message.content)}
              </div>
            </div>

            <span className="text-[10px] text-gray-400 mt-1.5 px-1 font-medium">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>

            {/* 액션 버튼들 */}
            {message.data?.actions && message.data.actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 flex flex-wrap gap-2"
              >
                {message.data.actions.map((action, index) => (
                  <ActionButton
                    key={index}
                    action={action}
                    onAction={onQuickAction}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// 마크다운 스타일 처리 (Bold + Link)
function formatMessage(content: string): React.ReactNode {
  const lines = content.split('\n');

  return lines.map((line, lineIndex) => (
    <span key={lineIndex}>
      {lineIndex > 0 && <br />}
      {formatLine(line)}
    </span>
  ));
}

function formatLine(line: string): React.ReactNode {
  const elements: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    const boldLinkMatch = remaining.match(/^\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/);
    if (boldLinkMatch) {
      const [full, text, url] = boldLinkMatch;
      elements.push(
        <Link
          key={key++}
          href={url}
          className="font-bold text-orange-600 hover:text-orange-700 underline decoration-2 underline-offset-4 decoration-orange-200"
        >
          {text}
        </Link>
      );
      remaining = remaining.slice(full.length);
      continue;
    }

    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const [full, text, url] = linkMatch;
      elements.push(
        <Link
          key={key++}
          href={url}
          className="text-orange-600 hover:text-orange-700 underline underline-offset-4 decoration-gray-200"
        >
          {text}
        </Link>
      );
      remaining = remaining.slice(full.length);
      continue;
    }

    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      const [full, text] = boldMatch;
      elements.push(
        <strong key={key++} className="font-extrabold text-gray-900 bg-orange-50 px-0.5 rounded">
          {text}
        </strong>
      );
      remaining = remaining.slice(full.length);
      continue;
    }

    const nextSpecial = remaining.search(/\*\*|\[/);
    if (nextSpecial === -1) {
      elements.push(<span key={key++}>{remaining}</span>);
      break;
    } else if (nextSpecial === 0) {
      elements.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    } else {
      elements.push(<span key={key++}>{remaining.slice(0, nextSpecial)}</span>);
      remaining = remaining.slice(nextSpecial);
    }
  }

  return elements;
}
