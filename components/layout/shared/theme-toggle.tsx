'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isRotating, setIsRotating] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setIsRotating(true)
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    setTimeout(() => setIsRotating(false), 400)
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn('rounded-xl', className)}
        disabled
      >
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('rounded-xl', className)}
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Moon
          className={cn(
            'h-5 w-5 transition-transform',
            isRotating && 'animate-theme-rotate'
          )}
        />
      ) : (
        <Sun
          className={cn(
            'h-5 w-5 transition-transform',
            isRotating && 'animate-theme-rotate'
          )}
        />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
