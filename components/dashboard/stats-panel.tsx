'use client'

import { 
  AlertTriangle, 
  FileText, 
  Trash2, 
  Users, 
  Wifi, 
  TrendingUp,
  TrendingDown,
  Minus 
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { SystemStats } from '@/lib/types'

interface StatsPanelProps {
  stats: SystemStats
  onOpenGallery?: () => void
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'default' | 'warning' | 'critical' | 'success'
  onClick?: () => void
}

function StatCard({ title, value, subtitle, icon, trend, trendValue, variant = 'default', onClick }: StatCardProps) {
  const variantStyles = {
    default: 'border-border',
    warning: 'border-warning/50 bg-warning/5',
    critical: 'border-destructive/50 bg-destructive/5',
    success: 'border-success/50 bg-success/5'
  }

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    warning: 'bg-warning/10 text-warning',
    critical: 'bg-destructive/10 text-destructive',
    success: 'bg-success/10 text-success'
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <Card 
      className={cn('transition-all hover:shadow-md', variantStyles[variant], onClick ? 'cursor-pointer hover:border-primary/50' : '')}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && trendValue && (
              <div className={cn(
                'mt-2 flex items-center gap-1 text-xs font-medium',
                trend === 'up' && variant === 'critical' ? 'text-destructive' : '',
                trend === 'down' && variant === 'success' ? 'text-success' : '',
                trend === 'neutral' ? 'text-muted-foreground' : ''
              )}>
                <TrendIcon className="h-3 w-3" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={cn('rounded-lg p-2.5', iconStyles[variant])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsPanel({ stats, onOpenGallery }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <StatCard
        title="Active Alerts"
        value={stats.activeAlerts}
        subtitle="Pending response"
        icon={<AlertTriangle className="h-5 w-5" />}
        trend="up"
        trendValue="+2 from yesterday"
        variant={stats.activeAlerts > 3 ? 'critical' : stats.activeAlerts > 1 ? 'warning' : 'default'}
      />
      <StatCard
        title="Reports Today"
        value={stats.reportsToday}
        subtitle="Pollution incidents"
        icon={<FileText className="h-5 w-5" />}
        trend="neutral"
        trendValue="Same as avg"
        onClick={onOpenGallery}
      />
      <StatCard
        title="Waste Intercepted"
        value={`${stats.wasteIntercepted} kg`}
        subtitle="This month"
        icon={<Trash2 className="h-5 w-5" />}
        trend="up"
        trendValue="+12% vs last month"
        variant="success"
      />
      <StatCard
        title="Teams Deployed"
        value={stats.teamsDeployed}
        subtitle="Active cleanup crews"
        icon={<Users className="h-5 w-5" />}
        trend={stats.teamsDeployed > 0 ? 'up' : 'neutral'}
        trendValue={stats.teamsDeployed > 0 ? 'In field' : 'On standby'}
      />
      <StatCard
        title="Sensors Online"
        value={`${stats.sensorsOnline}/24`}
        subtitle="Monitoring network"
        icon={<Wifi className="h-5 w-5" />}
        variant={stats.sensorsOnline < 20 ? 'warning' : 'success'}
      />
      <StatCard
        title="System Health"
        value={`${stats.healthFactor.toFixed(1)}%`}
        subtitle="All systems operational"
        icon={<TrendingUp className="h-5 w-5" />}
        variant="success"
      />
    </div>
  )
}
