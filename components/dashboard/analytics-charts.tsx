'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PollutionReport } from '@/lib/types'

interface AnalyticsChartsProps {
  reports: PollutionReport[]
}

const COLORS = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#22c55e'
}

const SOURCE_COLORS = {
  drain: '#6366f1',
  river: '#3b82f6',
  industrial: '#f59e0b',
  urban: '#8b5cf6',
  coastal: '#06b6d4',
  citizen: '#22c55e'
}

export function AnalyticsCharts({ reports }: AnalyticsChartsProps) {
  // Calculate severity distribution
  const severityData = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 }
    reports.forEach(r => counts[r.severity]++)
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[name as keyof typeof COLORS]
    }))
  }, [reports])

  // Calculate source distribution
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {}
    reports.forEach(r => {
      counts[r.source] = (counts[r.source] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: SOURCE_COLORS[name as keyof typeof SOURCE_COLORS] || '#888'
    }))
  }, [reports])

  // Risk index trend (simulated hourly data)
  const riskTrendData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return hours.map(hour => {
      const baseRisk = 45 + Math.sin((hour / 24) * Math.PI * 2) * 15
      const variation = Math.random() * 10 - 5
      return {
        hour: `${String(hour).padStart(2, '0')}:00`,
        risk: Math.round(Math.max(0, Math.min(100, baseRisk + variation)))
      }
    })
  }, [])

  // Zone risk data
  const zoneRiskData = useMemo(() => {
    const zones: Record<string, { total: number; avgRisk: number }> = {}
    reports.forEach(r => {
      if (!zones[r.location.zone]) {
        zones[r.location.zone] = { total: 0, avgRisk: 0 }
      }
      zones[r.location.zone].total++
      zones[r.location.zone].avgRisk += r.riskIndex
    })

    return Object.entries(zones).map(([zone, data]) => ({
      zone,
      incidents: data.total,
      avgRisk: Math.round(data.avgRisk / data.total)
    })).sort((a, b) => b.avgRisk - a.avgRisk)
  }, [reports])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="zones">Zones</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Severity Distribution */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  By Severity
                </h4>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {severityData.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.name} ({item.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source Distribution */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  By Source
                </h4>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {sourceData.slice(0, 4).map(item => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">
                24-Hour Risk Index Trend
              </h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskTrendData}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="hsl(var(--border))" 
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      interval={3}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="risk"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#riskGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* Zones Tab */}
          <TabsContent value="zones" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">
                Risk by Zone
              </h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneRiskData} layout="vertical">
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="hsl(var(--border))" 
                      opacity={0.3}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <YAxis
                      type="category"
                      dataKey="zone"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [`${value}%`, 'Avg Risk']}
                    />
                    <Bar dataKey="avgRisk" radius={[0, 4, 4, 0]}>
                      {zoneRiskData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.avgRisk > 70 ? COLORS.critical :
                            entry.avgRisk > 50 ? COLORS.high :
                            entry.avgRisk > 30 ? COLORS.medium :
                            COLORS.low
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
