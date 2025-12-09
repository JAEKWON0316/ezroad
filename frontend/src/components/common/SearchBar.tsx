'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string; // Restore className
  inputClassName?: string;
  showClearButton?: boolean; // Restore showClearButton
  variant?: 'default' | 'glass' | 'minimal';
}

export default function SearchBar({
  onSearch,
  placeholder = '검색어를 입력하세요',
  defaultValue = '',
  value: controlledValue,
  onChange,
  className,
  inputClassName,
  showClearButton = true,
  variant = 'default',
}: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState(defaultValue);

  // Use controlled value if provided, otherwise use internal state
  const query = controlledValue !== undefined ? controlledValue : internalQuery;
  const setQuery = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalQuery(newValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const variantStyles = {
    default: 'border border-gray-300 bg-white focus:ring-2 focus:ring-orange-500',
    glass: 'bg-white/20 border border-white/30 backdrop-blur-md text-white placeholder-white/70 focus:bg-white/30',
    minimal: 'bg-transparent border-none shadow-none focus:ring-0',
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5", variant === 'glass' ? 'text-white/70' : 'text-gray-400')} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-12 pr-12 py-3 text-base rounded-full transition-all duration-300',
            variantStyles[variant],
            'focus:outline-none',
            inputClassName
          )}
        />
        {showClearButton && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'bg-orange-500 text-white p-2 rounded-full',
            'hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
          )}
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
