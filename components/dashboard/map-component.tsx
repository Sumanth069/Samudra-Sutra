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

// --- River Simulation Engine ---
const MUMBAI_RIVERS = [
  { id: 'mithi', name: 'Mithi River', coords: [[19.141, 72.894], [19.112, 72.879], [19.065, 72.853], [19.043, 72.834]] },
  { id: 'dahisar', name: 'Dahisar River', coords: [[19.231, 72.884], [19.245, 72.855], [19.252, 72.825]] },
  { id: 'poisar', name: 'Poisar River', coords: [[19.201, 72.864], [19.205, 72.835], [19.192, 72.815]] },
  { id: 'oshiwara', name: 'Oshiwara River', coords: [[19.155, 72.854], [19.145, 72.835], [19.132, 72.815]] },
  { id: 'ulhas', name: 'Ulhas River', coords: [[19.233, 73.133], [19.266, 73.083], [19.299, 72.983]] },
  { id: 'vaitarna', name: 'Vaitarna River', coords: [[19.550, 73.050], [19.520, 72.950], [19.490, 72.850]] },
  { id: 'tansa', name: 'Tansa River', coords: [[19.450, 73.000], [19.420, 72.900], [19.390, 72.800]] },
  { id: 'kamothe', name: 'Kamothe Creek', coords: [[19.010, 73.100], [19.020, 73.050], [19.030, 73.000]] },
  { id: 'panvel', name: 'Panvel Creek', coords: [[18.980, 73.110], [18.990, 73.040], [18.950, 72.950]] },
  { id: 'thane', name: 'Thane Creek', coords: [[19.180, 72.980], [19.130, 72.950], [19.080, 72.980]] }
] as { id: string; name: string; coords: [number, number][] }[]

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

function SimulationPath({ coords, timeOffset }: { coords: [number, number][], timeOffset: number }) {
  // Map 0-48 hours to 0-1 progress
  const progress = Math.min(1, Math.max(0, timeOffset / 48))
  
  if (progress === 0) return null

  const partial = getPartialPath(coords, progress)
  const tip = partial[partial.length - 1]
  
  // Dispersion aura grows massively up to 8x scale across the hours
  const radius = 5 + (progress * 25)

  return (
    <React.Fragment>
      <Polyline 
        positions={partial}
        pathOptions={{ color: '#0ea5e9', weight: 4, lineCap: 'round', lineJoin: 'round' }}
      />
      <CircleMarker 
        center={tip}
        radius={radius}
        pathOptions={{ color: 'transparent', fillColor: '#0ea5e9', fillOpacity: 0.2 }}
      />
      <CircleMarker 
        center={tip}
        radius={4}
        pathOptions={{ color: '#fff', fillColor: '#0ea5e9', fillOpacity: 1, weight: 2 }}
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

        {/* Live River Flow Simulations */}
        {MUMBAI_RIVERS.map((river) => (
           <SimulationPath key={'sim_'+river.id} coords={river.coords} timeOffset={timeOffset} />
        ))}

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
