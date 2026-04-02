'use client'

import { useState } from 'react'
import { 
  X, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Droplets, 
  Activity,
  TrendingUp,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { PollutionReport } from '@/lib/types'

interface ReportDetailProps {
  report: PollutionReport | null
  onClose: () => void
  onAction: (reportId: string, action: string) => void
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export function ReportDetail({ report, onClose, onAction }: ReportDetailProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  if (!report) return null

  const handleAction = async (action: string) => {
    setActionLoading(action)
    await new Promise(resolve => setTimeout(resolve, 1000))
    onAction(report.id, action)
    setActionLoading(null)
  }

  const severityStyles = {
    critical: 'bg-destructive/20 text-destructive border-destructive/30',
    high: 'bg-warning/20 text-warning border-warning/30',
    medium: 'bg-primary/20 text-primary border-primary/30',
    low: 'bg-success/20 text-success border-success/30'
  }

  const statusStyles = {
    active: 'bg-destructive text-destructive-foreground',
    monitoring: 'bg-warning text-warning-foreground',
    contained: 'bg-primary text-primary-foreground',
    resolved: 'bg-success text-success-foreground'
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge className={statusStyles[report.status]}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Badge>
            <Badge variant="outline" className={severityStyles[report.severity]}>
              {report.severity.toUpperCase()}
            </Badge>
          </div>
          <CardTitle className="mt-2 text-lg font-semibold">
            {report.location.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {report.location.zone} • Report ID: {report.id}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Evidence */}
        {report.imageUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={report.imageUrl} 
              alt="Pollution evidence" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
              Verified Evidence
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Risk Index</span>
            </div>
            <p className={cn(
              "mt-1 text-2xl font-bold",
              report.riskIndex > 70 ? "text-destructive" :
              report.riskIndex > 50 ? "text-warning" : "text-success"
            )}>
              {report.riskIndex}%
            </p>
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Droplets className="h-4 w-4" />
              <span className="text-xs">Volume</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {report.estimatedVolume}m³
            </p>
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">ETA to Ocean</span>
            </div>
            <p className={cn(
              "mt-1 text-2xl font-bold",
              (report.etaToOcean || 0) < 24 ? "text-destructive" : "text-foreground"
            )}>
              {report.etaToOcean || '--'}h
            </p>
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span className="text-xs">ETA to River</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {report.etaToRiver || '--'}h
            </p>
          </div>
        </div>

        <Separator />

        {/* Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Report Details
          </h4>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium text-foreground capitalize">{report.type}</span>
            
            <span className="text-muted-foreground">Uploaded By</span>
            <span className="font-medium text-blue-600 truncate" title={report.source}>{report.source}</span>
            
            <span className="text-muted-foreground">Reported</span>
            <span className="font-medium text-foreground">{formatDate(report.reportedAt)}</span>
            
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium text-foreground">{formatDate(report.updatedAt)}</span>
          </div>
        </div>

        <Separator />

        {/* Location */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Location
          </h4>
          <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {report.location.lat.toFixed(6)}, {report.location.lon.toFixed(6)}
              </p>
              <p className="text-xs text-muted-foreground">{report.location.name}</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a 
                href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lon}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Flow Path Preview */}
        {report.flowPath.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Predicted Flow Path
              </h4>
              <div className="relative">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
                {report.flowPath.slice(0, 4).map((point, i) => (
                  <div key={i} className="relative flex items-center gap-3 py-2 pl-4">
                    <div className={cn(
                      "absolute left-0.5 h-3 w-3 rounded-full border-2 border-background",
                      i === 0 ? "bg-primary" : "bg-muted"
                    )} />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">
                        {i === 0 ? 'Origin' : `Waypoint ${i}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ETA: +{point.eta.toFixed(0)}h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="default" 
            size="sm"
            disabled={!!actionLoading}
            onClick={() => handleAction('deploy_team')}
          >
            {actionLoading === 'deploy_team' ? 'Deploying...' : 'Deploy Team'}
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            disabled={!!actionLoading}
            onClick={() => handleAction('increase_monitoring')}
          >
            Increase Monitoring
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!!actionLoading}
            onClick={() => handleAction('mark_resolved')}
          >
            Mark Resolved
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
