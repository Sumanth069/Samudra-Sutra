'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Settings, User, Radio, RefreshCw, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

interface HeaderProps {
  alertCount: number
  onRefresh: () => void
}

export function DashboardHeader({ alertCount, onRefresh }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLive, setIsLive] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Waves className="h-6 w-6 text-primary" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                isLive ? "bg-accent" : "bg-muted"
              )} />
              <span className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                isLive ? "bg-accent" : "bg-muted"
              )} />
            </span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Samudra Sutra
            </h1>
            <p className="text-xs text-muted-foreground">BlueTrace Intelligence System</p>
          </div>
        </Link>

        {/* Live Status */}
        <div className="ml-4 flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <Radio className={cn(
            "h-3.5 w-3.5",
            isLive ? "text-accent animate-pulse" : "text-muted-foreground"
          )} />
          <span className="text-xs font-medium text-secondary-foreground">
            {isLive ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Current Time */}
        <div className="hidden text-right md:block">
          <p className="text-sm font-mono text-foreground min-w-[80px]">
            {mounted ? currentTime.toLocaleTimeString('en-US', { hour12: false }) : '--:--:--'}
          </p>
          <p className="text-xs text-muted-foreground">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        {/* Theme Toggler */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {alertCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {alertCount > 9 ? '9+' : alertCount}
            </Badge>
          )}
        </Button>

        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsLive(!isLive)}>
              {isLive ? 'Pause Live Updates' : 'Resume Live Updates'}
            </DropdownMenuItem>
            <DropdownMenuItem>Configure Alerts</DropdownMenuItem>
            <DropdownMenuItem>Map Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>System Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Control Center</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/profile" className="w-full cursor-pointer">View Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/team" className="w-full cursor-pointer">Team Management</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/audit" className="w-full cursor-pointer">Audit Log</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={() => {
                document.cookie = 'dummy-admin=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                window.location.href = '/'
              }}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
