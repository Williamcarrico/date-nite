'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  href?: string
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-10 h-10',
}

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

const textSizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}

export function Logo({
  size = 'md',
  showText = true,
  href = '/',
  className,
}: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-xl gradient-primary flex items-center justify-center shadow-playful transition-transform hover:scale-105',
          sizeClasses[size]
        )}
      >
        <Heart className={cn('text-white', iconSizes[size])} />
      </div>
      {showText && (
        <span
          className={cn(
            'font-bold text-gradient-primary hidden sm:block',
            textSizes[size]
          )}
        >
          Date Nite
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl">
        {content}
      </Link>
    )
  }

  return content
}
