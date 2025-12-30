'use client';

import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import ActionButton from './ActionButton';
import Link from 'next/link';

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

// 마크다운 스타일 처리 (Bold + Link)
function formatMessage(content: string): React.ReactNode {
  // 먼저 줄 단위로 분리
  const lines = content.split('\n');
  
  return lines.map((line, lineIndex) => (
    <span key={lineIndex}>
      {lineIndex > 0 && <br />}
      {formatLine(line)}
    </span>
  ));
}

function formatLine(line: string): React.ReactNode {
  // **[텍스트](링크)** 패턴 처리 (Bold Link)
  // [텍스트](링크) 패턴 처리 (Normal Link)
  // **텍스트** 패턴 처리 (Bold)
  
  const elements: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    // Bold Link: **[text](url)**
    const boldLinkMatch = remaining.match(/^\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/);
    if (boldLinkMatch) {
      const [full, text, url] = boldLinkMatch;
      elements.push(
        <Link 
          key={key++} 
          href={url} 
          className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
        >
          {text}
        </Link>
      );
      remaining = remaining.slice(full.length);
      continue;
    }

    // Normal Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const [full, text, url] = linkMatch;
      elements.push(
        <Link 
          key={key++} 
          href={url} 
          className="text-orange-600 hover:text-orange-700 hover:underline"
        >
          {text}
        </Link>
      );
      remaining = remaining.slice(full.length);
      continue;
    }

    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      const [full, text] = boldMatch;
      elements.push(
        <strong key={key++} className="font-semibold">
          {text}
        </strong>
      );
      remaining = remaining.slice(full.length);
      continue;
    }

    // 일반 텍스트 (다음 특수 문자까지)
    const nextSpecial = remaining.search(/\*\*|\[/);
    if (nextSpecial === -1) {
      elements.push(<span key={key++}>{remaining}</span>);
      break;
    } else if (nextSpecial === 0) {
      // 특수 문자로 시작하지만 패턴 매칭 안 됨 - 한 글자씩 진행
      elements.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    } else {
      elements.push(<span key={key++}>{remaining.slice(0, nextSpecial)}</span>);
      remaining = remaining.slice(nextSpecial);
    }
  }

  return elements;
}
