'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Action {
  type: string;
  label: string;
  icon?: LucideIcon;
  primary?: boolean;
}

interface ActionButtonProps {
  action: Action;
  onAction: (action: string) => void;
}

export default function ActionButton({ action, onAction }: ActionButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onAction(action.type)}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border ${action.primary
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
