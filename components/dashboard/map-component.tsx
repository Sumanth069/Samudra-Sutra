'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { PollutionReport, Alert } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface MapComponentProps {
  reports: PollutionReport[]
  alerts: Alert[]
  timeOffset: number
  loading: boolean
  onSelectReport: (report: PollutionReport) => void
}

const MUMBAI_CENTER: [number, number] = [19.0760, 72.8777]

// Removed static MUMBAI_RIVERS logic as it is now calculated dynamically in the flow-engine
function getPartialPath(coords: [number, number][], progress: number): [number, number][] {
  if (progress <= 0) return [coords[0]]
  if (progress >= 1) return coords
  
  let totalLen = 0
  const segmentLengths = []
  for(let i=0; i<coords.length-1; i++) {
     const dx = coords[i+1][0] - coords[i][0]
     const dy = coords[i+1][1] - coords[i][1]
     const dist = Math.sqrt(dx*dx + dy*dy)
     totalLen += dist
     segmentLengths.push(dist)
  }
  
  const targetLen = totalLen * progress
  let currentLen = 0
  const partial = [coords[0]]
  
  for(let i=0; i<segmentLengths.length; i++) {
     if (currentLen + segmentLengths[i] <= targetLen) {
        partial.push(coords[i+1])
        currentLen += segmentLengths[i]
     } else {
        const remaining = targetLen - currentLen
        const ratio = remaining / segmentLengths[i]
        const p1 = coords[i]
        const p2 = coords[i+1]
        const lat = p1[0] + (p2[0] - p1[0]) * ratio
        const lon = p1[1] + (p2[1] - p1[1]) * ratio
        partial.push([lat, lon])
        break
     }
  }
  return partial
}

function SimulationPath({ coords, timeOffset, eta, severity }: { coords: [number, number][], timeOffset: number, eta: number, severity: string }) {
  // Map timeOffset against dynamic ETA to ocean
  const progress = Math.min(1, Math.max(0, eta > 0 ? timeOffset / eta : 1))
  
  if (progress === 0 || coords.length === 0) return null

  const partial = getPartialPath(coords, progress)
  const tip = partial[partial.length - 1]
  
  // Dispersion aura grows massive as waste spreads near ocean
  const radius = 5 + (progress * 30)

  // Color mapping based on severity
  const color = severity === 'critical' ? '#ef4444' 
              : severity === 'high' ? '#f59e0b'
              : severity === 'medium' ? '#3b82f6'
              : '#22c55e'

  return (
    <React.Fragment>
      <Polyline 
        positions={partial}
        pathOptions={{ color: color, weight: 4, lineCap: 'round', lineJoin: 'round', opacity: 0.8 }}
      />
      <CircleMarker 
        center={tip}
        radius={radius}
        pathOptions={{ color: 'transparent', fillColor: color, fillOpacity: 0.25 }}
      />
      <CircleMarker 
        center={tip}
        radius={6}
        pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 1, weight: 2 }}
      />
    </React.Fragment>
  )
}

export default function MapComponent({ reports, alerts, timeOffset, loading, onSelectReport }: MapComponentProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (loading || !mounted) {
    return (
      <Card className="h-full border-0 rounded-none w-full">
        <Skeleton className="h-full w-full" />
      </Card>
    )
  }

  // Dark Mapbox theme or standard CartoDB dark matter
  const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={MUMBAI_CENTER} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />

        {/* Dynamic Simulated Waste Flow based on actual citizen reports */}
        {reports.map((report) => {
           if (report.flowPath && report.flowPath.length > 0) {
              const coords = report.flowPath.map(p => [p.lat, p.lon] as [number, number])
              return <SimulationPath key={'sim_'+report.id} coords={coords} timeOffset={timeOffset} eta={report.etaToOcean || 24} severity={report.severity} />
           }
           return null
        })}
        {reports.map((report) => {
          const isCritical = report.severity === 'critical'
          const color = isCritical ? '#ef4444' 
            : report.severity === 'high' ? '#f59e0b'
            : report.severity === 'medium' ? '#3b82f6'
            : '#22c55e'

          return (
            <React.Fragment key={report.id}>
              {/* Heatmap / Glow effect using a larger transparent circle */}
              <CircleMarker 
                center={[report.location.lat, report.location.lon]}
                radius={isCritical ? 30 : 15}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.2,
                  color: 'transparent'
                }}
              />
              
              {/* Actual Pin */}
              <CircleMarker
                center={[report.location.lat, report.location.lon]}
                radius={8}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 1,
                  color: '#ffffff',
                  weight: 2
                }}
                eventHandlers={{
                  click: () => onSelectReport(report),
                }}
              >
                <Popup className="rounded-lg shadow-xl border-border bg-background text-foreground">
                  <div className="p-2 space-y-2 min-w-[150px]">
                    <div className="flex items-center gap-2">
                       <Badge variant={isCritical ? 'destructive' : 'default'} className="uppercase text-[10px]">
                        {report.severity}
                      </Badge>
                      <span className="font-semibold text-sm">{report.location.name || 'Citizen Report'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                      Risk Index: <span className="font-semibold text-foreground">{report.riskIndex}%</span>
                    </p>
                    {report.etaToOcean && (
                      <p className="text-xs text-orange-500 font-medium">
                        ETA to ocean: {report.etaToOcean} hrs
                      </p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
              
              {/* Flow Path Line if exists */}
              {report.flowPath && report.flowPath.length > 0 && (
                <Polyline 
                  positions={report.flowPath.map(p => [p.lat, p.lon])}
                  pathOptions={{
                     color: isCritical ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.4)',
                     weight: 2
                  }}
                />
              )}
            </React.Fragment>
          )
        })}

      </MapContainer>
    </div>
  )
}
