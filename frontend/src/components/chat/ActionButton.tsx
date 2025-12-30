'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ActionButton as ActionType } from '@/types/chat';

interface ActionButtonProps {
  action: ActionType & { icon?: LucideIcon; primary?: boolean };
  onAction: (action: string) => void;
}

export default function ActionButton({ action, onAction }: ActionButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (action.type === 'link' && action.url) {
      router.push(action.url);
    } else {
      onAction(action.action || action.type);
    }
  };

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border ${action.primary || action.variant === 'primary'
        ? 'bg-gradient-to-tr from-orange-500 to-red-500 text-white border-transparent shadow-orange-500/20'
        : 'bg-white text-gray-700 border-gray-100 hover:border-orange-200'
        }`}
    >
      <div className="flex items-center gap-2">
        {action.icon && <action.icon className="w-3.5 h-3.5" />}
        {action.label}
      </div>
    </motion.button>
  );
}
