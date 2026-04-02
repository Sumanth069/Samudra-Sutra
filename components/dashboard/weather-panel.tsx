'use client'

import { Cloud, Droplets, Wind, Thermometer, Navigation, Waves } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { WeatherData, MarineConditions } from '@/lib/types'

interface WeatherPanelProps {
  weather: WeatherData | null
  marine: MarineConditions | null
  loading: boolean
}

function DataRow({ 
  icon, 
  label, 
  value, 
  unit, 
  highlight 
}: { 
  icon: React.ReactNode
  label: string
  value: string | number
  unit?: string
  highlight?: boolean 
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={cn(
        "text-sm font-medium",
        highlight ? "text-primary" : "text-foreground"
      )}>
        {value}{unit && <span className="ml-0.5 text-muted-foreground">{unit}</span>}
      </span>
    </div>
  )
}

export function WeatherPanel({ weather, marine, loading }: WeatherPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Environmental Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Environmental Conditions</CardTitle>
          <span className="text-xs text-muted-foreground">
            {weather?.location || 'Mumbai'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather Overview */}
        <div className="flex items-center gap-4 rounded-lg bg-secondary/50 p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Cloud className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {weather?.temperature?.toFixed(0) || '--'}
              </span>
              <span className="text-lg text-muted-foreground">°C</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {weather?.condition || 'Loading...'}
            </p>
          </div>
          {weather?.rainfall && weather.rainfall > 0 && (
            <div className="rounded-full bg-primary/20 px-3 py-1">
              <span className="text-xs font-medium text-primary">
                {weather.rainfall.toFixed(1)}mm/h
              </span>
            </div>
          )}
        </div>

        {/* Weather Details */}
        <div className="divide-y divide-border">
          <DataRow 
            icon={<Thermometer className="h-4 w-4" />}
            label="Temperature"
            value={weather?.temperature?.toFixed(1) || '--'}
            unit="°C"
          />
          <DataRow 
            icon={<Droplets className="h-4 w-4" />}
            label="Humidity"
            value={weather?.humidity || '--'}
            unit="%"
            highlight={(weather?.humidity || 0) > 80}
          />
          <DataRow 
            icon={<Wind className="h-4 w-4" />}
            label="Wind Speed"
            value={weather?.windSpeed || '--'}
            unit="km/h"
          />
          <DataRow 
            icon={<Navigation className="h-4 w-4" style={{ transform: `rotate(${getWindRotation(weather?.windDirection)}deg)` }} />}
            label="Wind Direction"
            value={weather?.windDirection || '--'}
          />
        </div>

        {/* Marine Conditions */}
        {marine && (
          <>
            <div className="border-t border-border pt-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Marine Conditions
              </h4>
              <div className="divide-y divide-border">
                <DataRow 
                  icon={<Waves className="h-4 w-4" />}
                  label="Water Level"
                  value={marine.tidal.waterLevel.toFixed(2)}
                  unit="m"
                />
                <DataRow 
                  icon={<Waves className="h-4 w-4" />}
                  label="Tidal State"
                  value={marine.tidal.tidalType.charAt(0).toUpperCase() + marine.tidal.tidalType.slice(1)}
                />
                <DataRow 
                  icon={<Thermometer className="h-4 w-4" />}
                  label="Water Temp"
                  value={marine.waterTemperature.toFixed(1)}
                  unit="°C"
                />
                <DataRow 
                  icon={<Navigation className="h-4 w-4" style={{ transform: `rotate(${marine.currents.direction}deg)` }} />}
                  label="Current Speed"
                  value={marine.currents.speed.toFixed(2)}
                  unit="m/s"
                />
              </div>
            </div>

            {/* Pollution Index */}
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pollution Index</span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  marine.pollutionIndex > 70 ? "bg-destructive/20 text-destructive" :
                  marine.pollutionIndex > 50 ? "bg-warning/20 text-warning" :
                  "bg-success/20 text-success"
                )}>
                  {marine.pollutionIndex}/100
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    marine.pollutionIndex > 70 ? "bg-destructive" :
                    marine.pollutionIndex > 50 ? "bg-warning" :
                    "bg-success"
                  )}
                  style={{ width: `${marine.pollutionIndex}%` }}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function getWindRotation(direction: string | undefined): number {
  const directions: Record<string, number> = {
    'N': 0, 'NE': 45, 'E': 90, 'SE': 135,
    'S': 180, 'SW': 225, 'W': 270, 'NW': 315
  }
  return directions[direction || 'N'] || 0
}
