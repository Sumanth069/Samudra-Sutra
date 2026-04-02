'use client'

import React, { useState, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface TimelinePanelProps {
  onTimeChange: (hours: number) => void
  currentTime: number
}

const TIME_MARKERS = [
  { value: 0, label: 'NOW' },
  { value: 6, label: '+6h' },
  { value: 12, label: '+12h' },
  { value: 24, label: '+24h' },
  { value: 48, label: '+48h' },
]

export function TimelinePanel({ onTimeChange, currentTime }: TimelinePanelProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [internalTime, setInternalTime] = useState(currentTime)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setInternalTime(prev => {
          const next = prev + playbackSpeed
          if (next >= 48) {
            setIsPlaying(false)
            return 48
          }
          onTimeChange(next)
          return next
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, onTimeChange])

  const handleSliderChange = (value: number[]) => {
    const newTime = value[0]
    setInternalTime(newTime)
    onTimeChange(newTime)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setInternalTime(0)
    onTimeChange(0)
  }

  const handleSkip = (direction: 'forward' | 'back') => {
    const delta = direction === 'forward' ? 6 : -6
    const newTime = Math.max(0, Math.min(48, internalTime + delta))
    setInternalTime(newTime)
    onTimeChange(newTime)
  }

  const formatSimulatedTime = (hoursOffset: number) => {
    const now = new Date()
    const simulated = new Date(now.getTime() + hoursOffset * 60 * 60 * 1000)
    return simulated.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">Timeline Simulation</CardTitle>
            {isPlaying && (
              <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Simulating
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Speed: {playbackSpeed}x</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Simulation Time Display */}
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
          <div>
            <p className="text-xs text-muted-foreground">Simulated Time</p>
            <p className="text-lg font-semibold text-foreground">
              {formatSimulatedTime(internalTime)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Offset</p>
            <p className={cn(
              "text-lg font-mono font-semibold",
              internalTime > 0 ? "text-primary" : "text-foreground"
            )}>
              {internalTime > 0 ? `+${internalTime}h` : 'NOW'}
            </p>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-2">
          <Slider
            value={React.useMemo(() => [internalTime], [internalTime])}
            onValueChange={handleSliderChange}
            max={48}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between">
            {TIME_MARKERS.map(marker => (
              <button
                key={marker.value}
                onClick={() => {
                  setInternalTime(marker.value)
                  onTimeChange(marker.value)
                }}
                className={cn(
                  "text-xs transition-colors",
                  internalTime === marker.value
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {marker.label}
              </button>
            ))}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSkip('back')}
            disabled={internalTime === 0}
            className="h-8 w-8"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant={isPlaying ? "secondary" : "default"}
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSkip('forward')}
            disabled={internalTime >= 48}
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 ml-2">
            {[1, 2, 4].map(speed => (
              <Button
                key={speed}
                variant={playbackSpeed === speed ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPlaybackSpeed(speed)}
                className="h-7 px-2 text-xs"
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>

        {/* Simulation Impact Preview */}
        {internalTime > 0 && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
            <p className="text-xs font-medium text-warning">
              Projected Impact at +{internalTime}h
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {internalTime <= 12 
                ? 'Pollution expected to spread ~2.5km downstream. Early intervention recommended.'
                : internalTime <= 24
                ? 'High probability of marine ecosystem impact. Deploy containment measures.'
                : 'Critical timeline. Pollution likely to reach open ocean. Immediate action required.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
