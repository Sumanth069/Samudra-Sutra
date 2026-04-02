'use client'

import { useState, useEffect, useCallback } from 'react'
import type { 
  WeatherData, 
  MarineConditions, 
  PollutionReport, 
  Alert, 
  AlertStats,
  SystemStats 
} from '@/lib/types'
import { db } from '@/lib/firebase/client'
import { collection, query, getDocs } from 'firebase/firestore'

const REFRESH_INTERVAL = 30000 // 30 seconds for non-realtime API fallbacks

// --- Weather & Marine Mocks (since they depend on OpenWeather API) ---
export function useWeatherData(lat = 19.0760, lon = 72.8777) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,weather_code&timezone=Asia%2FKolkata`)
        const json = await res.json()
        const current = json.current
        
        let condition = 'Clear'
        let icon = 'sun'
        if (current.weather_code >= 51 && current.weather_code <= 67) { condition = 'Rain'; icon = 'rain' }
        if (current.weather_code >= 71) { condition = 'Heavy Rain'; icon = 'rain' }
        if (current.weather_code >= 1 && current.weather_code <= 3) { condition = 'Cloudy'; icon = 'cloud' }

        setData({
          location: "Mumbai Coast",
          temperature: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          rainfall: current.precipitation,
          windSpeed: current.wind_speed_10m,
          windDirection: current.wind_direction_10m > 180 ? 'SW' : 'NE',
          condition,
          icon,
          timestamp: current.time,
          coordinates: { lat, lon }
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [lat, lon])

  return { data, loading, error: null, refetch: () => {} }
}

export function useMarineData(lat = 19.0760, lon = 72.8777) {
  const [data, setData] = useState<MarineConditions | null>({
    tidal: { stationId: "MUM1", stationName: "Colaba", waterLevel: 2.1, prediction: 2.4, tidalType: "rising", timestamp: new Date().toISOString() },
    currents: { speed: 1.2, direction: 210, depth: 5 },
    waveHeight: 1.8,
    waterTemperature: 29.1,
    salinity: 34.5,
    turbidity: 12.5,
    pollutionIndex: 65,
    timestamp: new Date().toISOString()
  })
  return { data, loading: false, error: null, refetch: () => {} }
}

// --- Live Database Hooks (Reverted to Visual Mocks as per Request) ---

const BASE_REPORTS: PollutionReport[] = [
    {
        id: '1', type: 'mixed', severity: 'critical', 
        location: { lat: 19.043, lon: 72.834, name: 'Mithi River Estuary', zone: 'Coastal' },
        source: 'river', estimatedVolume: 450, riskIndex: 92, flowPath: [],
        reportedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        status: 'active', etaToOcean: 2, etaToRiver: 0
    },
    {
        id: '2', type: 'plastic', severity: 'high', 
        location: { lat: 19.112, lon: 72.879, name: 'Mithi Mid-stream', zone: 'Urban' },
        source: 'drain', estimatedVolume: 210, riskIndex: 78, flowPath: [],
        reportedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        status: 'active', etaToOcean: 5, etaToRiver: 0
    },
    {
        id: '3', type: 'sewage', severity: 'medium', 
        location: { lat: 19.231, lon: 72.884, name: 'Dahisar Source', zone: 'Industrial' },
        source: 'industrial', estimatedVolume: 120, riskIndex: 45, flowPath: [],
        reportedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        status: 'monitoring', etaToOcean: 12, etaToRiver: null
    },
    {
        id: '4', type: 'debris', severity: 'low', 
        location: { lat: 19.192, lon: 72.815, name: 'Poisar Outlet', zone: 'Coastal' },
        source: 'urban', estimatedVolume: 80, riskIndex: 20, flowPath: [],
        reportedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        status: 'resolved', etaToOcean: 24, etaToRiver: null
    },
    {
        id: '5', type: 'chemical', severity: 'critical', 
        location: { lat: 19.132, lon: 72.815, name: 'Oshiwara Delta', zone: 'Coastal' },
        source: 'industrial', estimatedVolume: 500, riskIndex: 88, flowPath: [],
        reportedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        status: 'active', etaToOcean: 3, etaToRiver: 0
    },
    {
        id: '6', type: 'mixed', severity: 'high', 
        location: { lat: 19.266, lon: 73.083, name: 'Ulhas Bend', zone: 'Industrial' },
        source: 'river', estimatedVolume: 320, riskIndex: 72, flowPath: [],
        reportedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        status: 'active', etaToOcean: 8, etaToRiver: 0
    },
    {
        id: '7', type: 'sewage', severity: 'medium', 
        location: { lat: 19.490, lon: 72.850, name: 'Vaitarna Coastal', zone: 'Coastal' },
        source: 'drain', estimatedVolume: 150, riskIndex: 55, flowPath: [],
        reportedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        status: 'monitoring', etaToOcean: 4, etaToRiver: null
    },
    {
        id: '8', type: 'plastic', severity: 'high', 
        location: { lat: 19.390, lon: 72.800, name: 'Tansa Outflow', zone: 'Coastal' },
        source: 'citizen', estimatedVolume: 280, riskIndex: 68, flowPath: [],
        reportedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        status: 'active', etaToOcean: 5, etaToRiver: 0
    },
    {
        id: '9', type: 'chemical', severity: 'critical', 
        location: { lat: 19.020, lon: 73.050, name: 'Kamothe Hub', zone: 'Industrial' },
        source: 'industrial', estimatedVolume: 410, riskIndex: 85, flowPath: [],
        reportedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        status: 'active', etaToOcean: 6, etaToRiver: 0
    },
    {
        id: '10', type: 'mixed', severity: 'low', 
        location: { lat: 18.990, lon: 73.040, name: 'Panvel Basin', zone: 'Urban' },
        source: 'urban', estimatedVolume: 90, riskIndex: 25, flowPath: [],
        reportedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        status: 'resolved', etaToOcean: 18, etaToRiver: null
    }
]

export function usePollutionData() {
  const [reports, setReports] = useState<PollutionReport[]>(BASE_REPORTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [summary, setSummary] = useState({
    total: 10,
    byServity: { critical: 3, high: 3, medium: 2, low: 2 },
    avgRiskIndex: 62,
    activeIncidents: 6,
    containedIncidents: 1,
    avgEtaToOcean: 9
  })

  // Poll Firebase for real Citizen Reports to notify Auth across devices
  useEffect(() => {
    const fetchCitizenData = async () => {
      try {
        const qReports = query(collection(db, 'pollution_reports'))
        const querySnapshot = await getDocs(qReports)
        
        const parsed: PollutionReport[] = querySnapshot.docs.map(doc => {
           const r = doc.data()
           return {
             id: doc.id,
             type: r.type || 'waste',
             severity: r.severity || 'low',
             location: {
                lat: r.location?.lat || 19.0,
                lon: r.location?.lon || 72.8,
                name: 'Gemini Satellite Verification',
                zone: 'Urban'
             },
             source: r.source_email || 'citizen',
             estimatedVolume: r.estimatedVolume || 100,
             riskIndex: r.riskIndex || 50,
             flowPath: [],
             reportedAt: r.reportedAt || new Date().toISOString(),
             updatedAt: r.updatedAt || new Date().toISOString(),
             status: r.status || 'active',
             etaToOcean: r.etaToOcean || 2,
             etaToRiver: 0,
             imageUrl: r.imageUrl || undefined
           }
        })
        
        const combined = [...parsed, ...BASE_REPORTS]
        setReports(combined)
        
        let criticalCount = 0; let highCount = 0; let mediumCount = 0; let lowCount = 0;
        let activeCount = 0;
        
        for (const rep of combined) {
            if (rep.severity === 'critical') criticalCount++
            else if (rep.severity === 'high') highCount++
            else if (rep.severity === 'medium') mediumCount++
            else if (rep.severity === 'low') lowCount++
            if (rep.status === 'active') activeCount++
        }

        setSummary(prev => ({
            ...prev,
            total: combined.length,
            byServity: { critical: criticalCount, high: highCount, medium: mediumCount, low: lowCount },
            activeIncidents: activeCount
        }))
      } catch (e) {
         // Silently fail if rules are blocking
      }
    }

    fetchCitizenData()
    const interval = setInterval(fetchCitizenData, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const refetch = useCallback(() => {}, [])
  return { reports, summary, loading, error, refetch }
}


const BASE_ALERTS: Alert[] = [
    {
      id: 'a1', type: 'HIGH_RISK', severity: 'critical',
      title: 'CRITICAL HIGH RISK: Mithi River Delta', message: 'Immediate action required for detected waste flow.',
      zone: 'Coastal', location: { lat: 19.043, lon: 72.834 },
      timestamp: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(),
      acknowledged: false, actions: [{ id: '1', label: 'Deploy Clearence Team', type: 'deploy_team' }], metadata: {}
    },
    {
      id: 'a2', type: 'WEATHER_WARNING', severity: 'warning',
      title: 'WARNING: Elevated Risk at Oshiwara', message: 'Teams on standby for potential intervention.',
      zone: 'Urban', location: { lat: 19.132, lon: 72.815 },
      timestamp: new Date(Date.now() - 3600000).toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(),
      acknowledged: false, actions: [{ id: '2', label: 'Increase Monitoring', type: 'increase_monitoring' }], metadata: {}
    }
]

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(BASE_ALERTS)

  const [stats, setStats] = useState({
    total: 2, critical: 1, warning: 1, info: 0, acknowledged: 0, pending: 2
  })

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
         const qAlerts = query(collection(db, 'system_alerts'))
         const querySnapshot = await getDocs(qAlerts)

         const parsed: Alert[] = querySnapshot.docs.map(doc => {
            const r = doc.data()
            return {
              id: doc.id,
              type: r.type || 'HIGH_RISK',
              severity: r.severity || 'warning',
              title: r.title || 'System Alert',
              message: r.message || '',
              zone: r.metadata?.zone || 'Cloud',
              location: r.location || { lat: 19.0, lon: 72.8 },
              timestamp: r.created_at || new Date().toISOString(),
              expiresAt: new Date(Date.now() + 86400000).toISOString(),
              acknowledged: false,
              actions: [{ id: '1', label: 'Deploy Response Unit', type: 'deploy_team' as const }],
              metadata: r.metadata || {}
            }
         })

         const combined = [...parsed, ...BASE_ALERTS]
         setAlerts(combined)

         let critical = 0; let warning = 0; let info = 0;
         for (const a of combined) {
            if (a.severity === 'critical') critical++
            else if (a.severity === 'warning' || (a.severity as string) === 'high') warning++
            else info++
         }

         setStats({
            total: combined.length,
            critical, warning, info,
            acknowledged: 0,
            pending: combined.length
         })
      } catch (e) {}
    }
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 5000)
    return () => clearInterval(interval)
  }, [])

  const refetch = useCallback(() => {}, [])
  const acknowledgeAlert = useCallback(async () => true, [])
  return { alerts, stats, loading: false, error: null, refetch, acknowledgeAlert }
}


export function useSystemStats() {
  const [stats, setStats] = useState<SystemStats>({
    activeAlerts: 0,
    reportsToday: 0,
    wasteIntercepted: 1340,
    teamsDeployed: 0,
    sensorsOnline: 24,
    healthFactor: 98.5,
    lastUpdate: new Date().toISOString()
  })

  // Hooking back into our live data
  const { stats: alertStats } = useAlerts()
  const { summary } = usePollutionData()

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      activeAlerts: alertStats?.pending || 0,
      reportsToday: summary?.total || 0,
      teamsDeployed: alertStats?.critical ? Math.min(alertStats.critical * 2, 8) : 0,
    }))
  }, [alertStats?.pending, alertStats?.critical, summary?.total])

  // Sub-second Realtime Analysis Fluctuation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        wasteIntercepted: parseFloat((prev.wasteIntercepted + (Math.random() * 0.4 + 0.1)).toFixed(1)),
        healthFactor: Math.min(100, Math.max(91, parseFloat((prev.healthFactor + (Math.random() * 0.4 - 0.2)).toFixed(1)))),
        lastUpdate: new Date().toISOString()
      }))
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  return stats
}
