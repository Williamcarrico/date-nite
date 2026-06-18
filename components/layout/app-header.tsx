'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Sparkles, Clock, Star, User, LogOut, Menu, BarChart3, Gamepad2, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from './shared/logo'
import { ThemeToggle } from './shared/theme-toggle'
import { NotificationBell } from './shared/notification-bell'
import { signOut } from '@/lib/actions/auth'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app', label: 'Dashboard', icon: Sparkles },
  { href: '/app/play', label: 'Play Together', icon: Gamepad2 },
  { href: '/app/randomize', label: 'Get Ideas', icon: Heart },
  { href: '/app/history', label: 'History', icon: Clock },
  { href: '/app/insights', label: 'Insights', icon: BarChart3 },
  { href: '/app/favorites', label: 'Favorites', icon: Star },
]

export function AppHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo href="/app" size="md" showText />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'gap-2 rounded-xl transition-all',
                      isActive && 'gradient-primary text-white shadow-playful'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Right Section */}
          <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <ThemeToggle />
              </TooltipTrigger>
              <TooltipContent>Toggle theme</TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl" aria-label="User menu">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="gradient-primary text-white text-xs font-bold">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Account</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem asChild>
                  <Link href="/app/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-xl"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-75">
                <SheetHeader className="border-b border-border pb-4 mb-4">
                  <SheetTitle className="flex items-center">
                    <Logo href="/app" size="md" showText />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className={cn(
                            'w-full justify-start gap-3 rounded-xl',
                            isActive && 'gradient-primary text-white shadow-playful'
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Button>
                      </Link>
                    )
                  })}
                </nav>
                <div className="mt-6 pt-6 border-t border-border">
                  <Link href="/app/notifications" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 rounded-xl"
                    >
                      <Bell className="w-5 h-5" />
                      Notifications
                    </Button>
                  </Link>
                  <Link href="/app/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 rounded-xl mt-2"
                    >
                      <User className="w-5 h-5" />
                      Profile Settings
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-xl text-destructive hover:text-destructive mt-2"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          </TooltipProvider>
        </div>
      </div>
    </header>
  )
}
