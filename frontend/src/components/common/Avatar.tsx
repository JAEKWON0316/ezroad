'use client';

import Image from 'next/image';
import { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-24 h-24 md:w-32 md:h-32',
};

const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-12 w-12',
};

const imageSizes = {
  xs: '24px',
  sm: '32px',
  md: '40px',
  lg: '48px',
  xl: '128px',
};

export default function Avatar({ 
  src, 
  alt = '프로필', 
  size = 'md',
  className = ''
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  
  // src가 유효한지 체크 (null, undefined, 빈 문자열 제외)
  const hasValidSrc = src && src.trim() !== '' && !hasError;

  return (
    <div 
      className={`
        relative rounded-full bg-orange-100 
        flex items-center justify-center overflow-hidden
        ${sizeClasses[size]} ${className}
      `}
    >
      {hasValidSrc ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={imageSizes[size]}
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <User className={`${iconSizes[size]} text-orange-500`} />
      )}
    </div>
  );
}
