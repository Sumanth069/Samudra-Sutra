'use client'

import { useState } from 'react'
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Clock, 
  MapPin,
  ChevronRight,
  Check,
  X,
  Bell
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Alert, AlertStats } from '@/lib/types'

interface AlertsPanelProps {
  alerts: Alert[]
  stats: AlertStats | null
  loading: boolean
  onAcknowledge: (alertId: string, action: string) => Promise<boolean>
}

function AlertIcon({ severity }: { severity: Alert['severity'] }) {
  const icons = {
    critical: <AlertTriangle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />
  }
  return icons[severity]
}

function AlertBadge({ severity }: { severity: Alert['severity'] }) {
  const styles = {
    critical: 'bg-destructive/20 text-destructive border-destructive/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    info: 'bg-primary/20 text-primary border-primary/30'
  }

  return (
    <Badge variant="outline" className={cn('uppercase text-[10px] font-semibold', styles[severity])}>
      {severity}
    </Badge>
  )
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

export function AlertsPanel({ alerts, stats, loading, onAcknowledge }: AlertsPanelProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const handleAction = async (action: string) => {
    if (!selectedAlert) return
    setActionLoading(true)
    const success = await onAcknowledge(selectedAlert.id, action)
    setActionLoading(false)
    if (success) {
      setSelectedAlert(null)
    }
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Live Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const pendingAlerts = alerts.filter(a => !a.acknowledged)
  const criticalAlerts = pendingAlerts.filter(a => a.severity === 'critical')

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Live Alerts</CardTitle>
              {criticalAlerts.length > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {stats && (
                <>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    {stats.critical} Critical
                  </Badge>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    {stats.warning} Warning
                  </Badge>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-[calc(100%-1rem)] px-4 pb-4">
            {pendingAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 rounded-full bg-success/10 p-3">
                  <Bell className="h-6 w-6 text-success" />
                </div>
                <p className="text-sm font-medium text-foreground">All Clear</p>
                <p className="text-xs text-muted-foreground">No pending alerts at this time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAlerts.map(alert => (
                  <button
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-all hover:bg-secondary/50",
                      alert.severity === 'critical' && "border-destructive/30 bg-destructive/5",
                      alert.severity === 'warning' && "border-warning/30 bg-warning/5",
                      alert.severity === 'info' && "border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 rounded-full p-1.5",
                        alert.severity === 'critical' && "bg-destructive/20 text-destructive",
                        alert.severity === 'warning' && "bg-warning/20 text-warning",
                        alert.severity === 'info' && "bg-primary/20 text-primary"
                      )}>
                        <AlertIcon severity={alert.severity} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <AlertBadge severity={alert.severity} />
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(alert.timestamp)}
                          </span>
                        </div>
                        <h4 className="mt-1 text-sm font-medium text-foreground truncate">
                          {alert.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {alert.message}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {alert.zone}
                          </span>
                          {alert.metadata.etaHours && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              ETA: {alert.metadata.etaHours}h
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-lg">
          {selectedAlert && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "rounded-full p-2",
                    selectedAlert.severity === 'critical' && "bg-destructive/20 text-destructive",
                    selectedAlert.severity === 'warning' && "bg-warning/20 text-warning",
                    selectedAlert.severity === 'info' && "bg-primary/20 text-primary"
                  )}>
                    <AlertIcon severity={selectedAlert.severity} />
                  </div>
                  <div>
                    <DialogTitle>{selectedAlert.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <AlertBadge severity={selectedAlert.severity} />
                      <span>{selectedAlert.zone}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(selectedAlert.timestamp)}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <p className="text-sm text-foreground">{selectedAlert.message}</p>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3">
                  {selectedAlert.metadata.etaHours && (
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Time to Impact</p>
                      <p className="text-lg font-semibold text-foreground">
                        {selectedAlert.metadata.etaHours}h
                      </p>
                    </div>
                  )}
                  {selectedAlert.metadata.riskIndex && (
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Risk Index</p>
                      <p className={cn(
                        "text-lg font-semibold",
                        selectedAlert.metadata.riskIndex > 70 ? "text-destructive" :
                        selectedAlert.metadata.riskIndex > 50 ? "text-warning" : "text-success"
                      )}>
                        {selectedAlert.metadata.riskIndex}%
                      </p>
                    </div>
                  )}
                  {selectedAlert.metadata.affectedArea && (
                    <div className="rounded-lg bg-secondary p-3">
                      <p className="text-xs text-muted-foreground">Affected Area</p>
                      <p className="text-lg font-semibold text-foreground">
                        {selectedAlert.metadata.affectedArea} km²
                      </p>
                    </div>
                  )}
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedAlert.location.lat.toFixed(4)}, {selectedAlert.location.lon.toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Recommended Actions */}
                {selectedAlert.actions.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Recommended Actions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlert.actions.map(action => (
                        <Button
                          key={action.id}
                          variant="secondary"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleAction(action.type)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAlert(null)}
                  disabled={actionLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
                <Button
                  onClick={() => handleAction('acknowledge')}
                  disabled={actionLoading}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Acknowledge
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
