'use client';

import { MapPin, Calendar, Clock, Sparkles } from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    { 
      id: 'recommend', 
      label: '맛집 추천', 
      icon: MapPin,
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
    },
    { 
      id: 'theme', 
      label: '테마 추천', 
      icon: Sparkles,
      color: 'bg-pink-50 text-pink-600 hover:bg-pink-100' 
    },
    { 
      id: 'reservation', 
      label: '내 예약', 
      icon: Calendar,
      color: 'bg-green-50 text-green-600 hover:bg-green-100' 
    },
    { 
      id: 'waiting', 
      label: '대기 현황', 
      icon: Clock,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' 
    },
  ];

  return (
    <div className="px-4 py-3 border-t bg-white">
      <p className="text-xs text-gray-500 mb-2">빠른 질문</p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${action.color}`}
          >
            <action.icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
