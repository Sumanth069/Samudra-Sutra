'use client'

import { useState, useCallback } from 'react'
import { db } from '@/lib/firebase/client'
import { doc, updateDoc } from 'firebase/firestore'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardHeader } from '@/components/dashboard/header'
import { StatsPanel } from '@/components/dashboard/stats-panel'
import { WeatherPanel } from '@/components/dashboard/weather-panel'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { TimelinePanel } from '@/components/dashboard/timeline-panel'
import { ActionsPanel } from '@/components/dashboard/actions-panel'
import { MapView } from '@/components/dashboard/map-view'
import { ReportDetail } from '@/components/dashboard/report-detail'
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'
import { ReportsTable } from '@/components/dashboard/reports-table'
import { 
  useWeatherData, 
  useMarineData, 
  usePollutionData, 
  useAlerts,
  useSystemStats 
} from '@/hooks/use-dashboard-data'
import type { PollutionReport } from '@/lib/types'

export default function DashboardPage() {
  const [timeOffset, setTimeOffset] = useState(0)
  const [selectedReport, setSelectedReport] = useState<PollutionReport | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  // Fetch all data
  const { data: weather, loading: weatherLoading } = useWeatherData()
  const { data: marine, loading: marineLoading } = useMarineData()
  const { reports, loading: pollutionLoading, refetch: refetchPollution } = usePollutionData()
  const { alerts, stats: alertStats, loading: alertsLoading, acknowledgeAlert, refetch: refetchAlerts } = useAlerts()
  const systemStats = useSystemStats()

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1)
    refetchPollution()
    refetchAlerts()
  }, [refetchPollution, refetchAlerts])

  const handleTimeChange = useCallback((hours: number) => {
    setTimeOffset(hours)
  }, [])

  const handleSelectReport = useCallback((report: PollutionReport) => {
    setSelectedReport(report)
  }, [])

  const handleCloseReport = useCallback(() => {
    setSelectedReport(null)
  }, [])

  const handleReportAction = useCallback(async (reportId: string, action: string) => {
    console.log(`Action ${action} on report ${reportId}`)
    try {
      const reportRef = doc(db, 'pollution_reports', reportId)
      let newStatus = 'active'
      if (action === 'mark_resolved') newStatus = 'resolved'
      if (action === 'deploy_team') newStatus = 'contained'
      if (action === 'increase_monitoring') newStatus = 'monitoring'
      
      await updateDoc(reportRef, { status: newStatus, updatedAt: new Date().toISOString() })
      handleRefresh()
    } catch (err) {
      console.error("Failed to update status in Firebase", err)
    }
    setSelectedReport(null)
  }, [handleRefresh])

  const handleAction = useCallback(async (actionId: string) => {
    console.log(`Executing action: ${actionId}`)
    return true
  }, [])

  return (
    <div key={refreshKey} className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <DashboardHeader 
        alertCount={alertStats?.pending || 0} 
        onRefresh={handleRefresh}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6">
        <div className="mx-auto max-w-[1800px] space-y-4 lg:space-y-6">
          {/* Stats Overview */}
          <StatsPanel stats={systemStats} onOpenGallery={() => setIsGalleryOpen(true)} />

          {/* Main Grid */}
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
            {/* Left Column - Map and Timeline */}
            <div className="space-y-4 lg:col-span-8 lg:space-y-6">
              {/* Map View */}
              <div className="h-[400px] lg:h-[500px]">
                <MapView
                  reports={reports}
                  alerts={alerts}
                  timeOffset={timeOffset}
                  loading={pollutionLoading || alertsLoading}
                  onSelectReport={handleSelectReport}
                />
              </div>

              {/* Timeline Simulation */}
              <TimelinePanel 
                onTimeChange={handleTimeChange}
                currentTime={timeOffset}
              />

              {/* Reports Table */}
              <ReportsTable 
                reports={reports}
                onSelectReport={handleSelectReport}
              />
            </div>

            {/* Right Column - Panels */}
            <div className="space-y-4 lg:col-span-4 lg:space-y-6">
              {/* Alert or Report Detail */}
              {selectedReport ? (
                <ReportDetail
                  report={selectedReport}
                  onClose={handleCloseReport}
                  onAction={handleReportAction}
                />
              ) : (
                <div className="h-[400px]">
                  <AlertsPanel
                    alerts={alerts}
                    stats={alertStats}
                    loading={alertsLoading}
                    onAcknowledge={acknowledgeAlert}
                  />
                </div>
              )}

              {/* Weather & Marine Conditions */}
              <WeatherPanel
                weather={weather}
                marine={marine}
                loading={weatherLoading || marineLoading}
              />

              {/* Quick Actions */}
              <ActionsPanel onAction={handleAction} />

              {/* Analytics Charts */}
              <AnalyticsCharts reports={reports} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-[1800px] flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-4">
            <span>Samudra Sutra BlueTrace Intelligence System</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Version 1.0.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Data sources: NOAA CO-OPS, OpenWeather, Internal Sensors</span>
            <span className="hidden sm:inline">|</span>
            <span suppressHydrationWarning>
              Last sync: {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        </div>
      </footer>

      {/* Citizen Evidence Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 md:p-12">
           <div className="relative flex flex-col w-full h-full max-w-7xl bg-card border shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="flex items-center justify-between p-4 border-b bg-muted/10">
                <div>
                   <h2 className="text-xl font-bold">Citizen Evidence Gallery</h2>
                   <p className="text-sm text-muted-foreground">Actual photographs submitted by locals from the field.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsGalleryOpen(false)}>
                   <X className="h-5 w-5" />
                </Button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 bg-muted/5">
               {reports.filter(r => r.imageUrl).length === 0 ? (
                 <div className="col-span-full h-full flex flex-col items-center justify-center text-muted-foreground p-12">
                    <p className="text-lg font-medium">No visual evidence submitted today.</p>
                    <p className="text-sm">Wait for a citizen to submit a photo using the portal.</p>
                 </div>
               ) : (
                 reports.filter(r => r.imageUrl).map(r => (
                    <div 
                      key={r.id} 
                      className="group relative rounded-xl border overflow-hidden bg-card cursor-pointer shadow-sm hover:shadow-md transition-all hover:border-primary/50" 
                      onClick={() => {
                        setSelectedReport(r)
                        setIsGalleryOpen(false)
                      }}
                    >
                       <div className="aspect-[4/3] w-full relative overflow-hidden bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={r.imageUrl} 
                            alt="Pollution evidence" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                             <Badge variant="secondary" className="bg-black/60 text-white border-none backdrop-blur-md">
                               {r.severity.toUpperCase()}
                             </Badge>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                             <p className="text-sm font-semibold text-white truncate drop-shadow-md">{r.location.name}</p>
                          </div>
                       </div>
                       <div className="p-3">
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Uploaded By</p>
                          <p className="text-sm truncate text-blue-600 dark:text-blue-400">{r.source}</p>
                       </div>
                    </div>
                 ))
               )}
             </div>
           </div>
        </div>
      )}
    </div>
  )
}
