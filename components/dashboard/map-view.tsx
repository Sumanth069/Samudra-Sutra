'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PollutionReport, Alert } from '@/lib/types'

// Dynamically import the map to avoid SSR 'window is not defined' errors
const MapComponent = dynamic(
  () => import('./map-component'),
  { ssr: false, loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm">Loading map layers...</div> }
)

interface MapViewProps {
  reports: PollutionReport[]
  alerts: Alert[]
  timeOffset: number
  loading: boolean
  onSelectReport: (report: PollutionReport) => void
}

export function MapView(props: MapViewProps) {
  return (
    <Card className="flex h-full flex-col shadow-sm border-border">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Live Pollution Map</CardTitle>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
              <Activity className="mr-1 h-3 w-3 animate-pulse" />
              Real-time
            </Badge>
          </div>
          <div>
            <Button variant="outline" size="sm" className="h-8 shadow-none">
                <Layers className="mr-2 h-4 w-4" />
                Layers
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative flex-1 overflow-hidden p-0 rounded-b-lg z-0">
        <MapComponent {...props} />
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[400] rounded-lg border border-border bg-card/95 p-3 backdrop-blur shadow-md">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Risk Level</p>
          <div className="flex flex-col gap-1.5">
            {[
              { color: '#ef4444', label: 'Critical' },
              { color: '#f59e0b', label: 'High' },
              { color: '#3b82f6', label: 'Medium' },
              { color: '#22c55e', label: 'Low' }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span 
                  className="h-3 w-3 rounded-full shadow-sm" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time Offset Indicator */}
        {props.timeOffset > 0 && (
          <div className="absolute right-4 top-4 z-[400] rounded-lg border border-warning/30 bg-warning/10 px-3 py-1.5 backdrop-blur">
            <p className="text-xs font-medium text-warning">
              Simulation: +{props.timeOffset}h
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
