'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { ActionButton as ActionButtonType } from '@/types/chat';

interface ActionButtonProps {
  action: ActionButtonType;
  onAction?: (action: string) => void;
}

export default function ActionButton({ action, onAction }: ActionButtonProps) {
  const baseStyles = 'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors';
  
  const variantStyles = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    link: 'text-orange-500 hover:text-orange-600 underline',
  };

  const style = `${baseStyles} ${variantStyles[action.variant || 'secondary']}`;

  // 링크 타입
  if (action.type === 'link' && action.url) {
    return (
      <Link href={action.url} className={style}>
        {action.label}
        {action.variant === 'primary' && <ExternalLink className="w-3 h-3" />}
      </Link>
    );
  }

  // 액션 타입
  if (action.type === 'action' && action.action && onAction) {
    return (
      <button
        onClick={() => onAction(action.action!)}
        className={style}
      >
        {action.label}
      </button>
    );
  }

  // 기본 버튼
  return (
    <button className={style}>
      {action.label}
    </button>
  );
}
