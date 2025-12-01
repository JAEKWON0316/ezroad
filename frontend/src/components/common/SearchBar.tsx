'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  showClearButton?: boolean;
}

export default function SearchBar({
  onSearch,
  placeholder = '검색어를 입력하세요',
  defaultValue = '',
  value: controlledValue,
  onChange,
  className,
  showClearButton = true,
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

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-12 pr-12 py-3 text-base rounded-full border border-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
            'placeholder-gray-400 transition-shadow bg-white'
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
            'hover:bg-orange-600 transition-colors'
          )}
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
