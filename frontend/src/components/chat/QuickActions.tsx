'use client';

import { MapPin, Heart, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    {
      id: 'recommend',
      label: '맛집 추천',
      icon: MapPin,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50/50'
    },
    {
      id: 'course',
      label: '코스 추천',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50/50'
    },
    {
      id: 'reservation',
      label: '내 예약',
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50/50'
    },
    {
      id: 'waiting',
      label: '대기 현황',
      icon: Clock,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50/50'
    },
  ];

  return (
    <div className="px-4 py-3 border-b border-gray-50 bg-white/50 backdrop-blur-sm">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x select-none">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(action.id)}
            className={`flex-none flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white shadow-sm snap-start ${action.bgColor}`}
          >
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${action.color} flex items-center justify-center text-white shadow-sm`}>
              <action.icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-gray-700">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
