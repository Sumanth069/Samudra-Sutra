import { NextResponse } from 'next/server'

export interface PollutionReport {
  id: string
  type: 'plastic' | 'chemical' | 'sewage' | 'oil' | 'debris' | 'mixed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: {
    lat: number
    lon: number
    name: string
    zone: string
  }
  source: 'drain' | 'river' | 'industrial' | 'urban' | 'coastal' | 'citizen'
  estimatedVolume: number // in cubic meters
  riskIndex: number // 0-100
  flowPath: Array<{ lat: number; lon: number; eta: number }> // eta in hours
  reportedAt: string
  updatedAt: string
  status: 'active' | 'monitoring' | 'contained' | 'resolved'
  etaToOcean: number | null // hours
  etaToRiver: number | null // hours
}

export interface ZoneRisk {
  zone: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  activeReports: number
  predictedImpact: string
  coordinates: { lat: number; lon: number }[]
}

// Simulated drainage network for Mumbai (would be GeoJSON in production)
const drainageNetwork = [
  { id: 'D1', name: 'Mithi River Drain', start: { lat: 19.1072, lon: 72.8747 }, end: { lat: 19.0533, lon: 72.8891 }, flowRate: 2.5 },
  { id: 'D2', name: 'Mahim Creek', start: { lat: 19.0424, lon: 72.8404 }, end: { lat: 19.0356, lon: 72.8451 }, flowRate: 1.8 },
  { id: 'D3', name: 'Thane Creek', start: { lat: 19.1823, lon: 72.9751 }, end: { lat: 19.0899, lon: 72.9923 }, flowRate: 3.2 },
  { id: 'D4', name: 'Ulhas Estuary', start: { lat: 19.2551, lon: 73.0032 }, end: { lat: 19.0678, lon: 72.9654 }, flowRate: 4.1 },
  { id: 'D5', name: 'Versova Creek', start: { lat: 19.1368, lon: 72.8143 }, end: { lat: 19.1142, lon: 72.8056 }, flowRate: 1.5 },
]

// Generate realistic pollution reports based on real-world patterns
function generatePollutionReports(): PollutionReport[] {
  const now = new Date()
  const reports: PollutionReport[] = []

  // Mumbai hotspots
  const hotspots = [
    { name: 'Mithi River', zone: 'Zone A', lat: 19.0702, lon: 72.8821, baseRisk: 75 },
    { name: 'Mahim Bay', zone: 'Zone B', lat: 19.0356, lon: 72.8451, baseRisk: 65 },
    { name: 'Versova Beach', zone: 'Zone C', lat: 19.1342, lon: 72.8062, baseRisk: 55 },
    { name: 'Thane Creek', zone: 'Zone D', lat: 19.1823, lon: 72.9751, baseRisk: 70 },
    { name: 'Juhu Beach', zone: 'Zone E', lat: 19.0948, lon: 72.8269, baseRisk: 45 },
    { name: 'Colaba', zone: 'Zone F', lat: 18.9067, lon: 72.8147, baseRisk: 40 },
    { name: 'Worli', zone: 'Zone G', lat: 19.0176, lon: 72.8150, baseRisk: 60 },
    { name: 'Bandra', zone: 'Zone H', lat: 19.0596, lon: 72.8295, baseRisk: 58 },
  ]

  const pollutionTypes: PollutionReport['type'][] = ['plastic', 'sewage', 'debris', 'mixed', 'chemical']
  const sources: PollutionReport['source'][] = ['drain', 'river', 'urban', 'industrial', 'citizen']

  hotspots.forEach((spot, index) => {
    // Vary risk based on time of day and randomness
    const hour = now.getHours()
    const timeVariation = Math.sin((hour / 24) * Math.PI * 2) * 15
    const randomVariation = (Math.random() - 0.5) * 20
    const riskIndex = Math.max(0, Math.min(100, spot.baseRisk + timeVariation + randomVariation))

    const severity = riskIndex > 80 ? 'critical' : riskIndex > 60 ? 'high' : riskIndex > 40 ? 'medium' : 'low'
    const type = pollutionTypes[index % pollutionTypes.length]
    const source = sources[index % sources.length]

    // Generate flow path to ocean
    const flowPath = generateFlowPath(spot.lat, spot.lon)
    const etaToOcean = calculateETA(flowPath)

    reports.push({
      id: `PR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(index + 1).padStart(3, '0')}`,
      type,
      severity,
      location: {
        lat: spot.lat + (Math.random() - 0.5) * 0.01,
        lon: spot.lon + (Math.random() - 0.5) * 0.01,
        name: spot.name,
        zone: spot.zone
      },
      source,
      estimatedVolume: Math.round(10 + Math.random() * 500),
      riskIndex: Math.round(riskIndex),
      flowPath,
      reportedAt: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
      status: riskIndex > 70 ? 'active' : riskIndex > 50 ? 'monitoring' : 'contained',
      etaToOcean,
      etaToRiver: Math.round(etaToOcean * 0.3)
    })
  })

  return reports.sort((a, b) => b.riskIndex - a.riskIndex)
}

function generateFlowPath(startLat: number, startLon: number): Array<{ lat: number; lon: number; eta: number }> {
  const path = [{ lat: startLat, lon: startLon, eta: 0 }]
  let currentLat = startLat
  let currentLon = startLon

  // Simulate flow towards ocean (generally southwest for Mumbai)
  const steps = 5 + Math.floor(Math.random() * 3)
  for (let i = 1; i <= steps; i++) {
    currentLat -= 0.005 + Math.random() * 0.01
    currentLon -= 0.002 + Math.random() * 0.005
    path.push({
      lat: currentLat,
      lon: currentLon,
      eta: i * (4 + Math.random() * 4) // 4-8 hours per segment
    })
  }

  return path
}

function calculateETA(flowPath: Array<{ lat: number; lon: number; eta: number }>): number {
  return Math.round(flowPath[flowPath.length - 1]?.eta || 24)
}

function calculateZoneRisks(reports: PollutionReport[]): ZoneRisk[] {
  const zoneMap = new Map<string, { reports: PollutionReport[]; coords: { lat: number; lon: number }[] }>()

  reports.forEach(report => {
    const zone = report.location.zone
    if (!zoneMap.has(zone)) {
      zoneMap.set(zone, { reports: [], coords: [] })
    }
    const zoneData = zoneMap.get(zone)!
    zoneData.reports.push(report)
    zoneData.coords.push({ lat: report.location.lat, lon: report.location.lon })
  })

  const zoneRisks: ZoneRisk[] = []
  zoneMap.forEach((data, zone) => {
    const avgRisk = data.reports.reduce((sum, r) => sum + r.riskIndex, 0) / data.reports.length
    const riskLevel = avgRisk > 75 ? 'critical' : avgRisk > 55 ? 'high' : avgRisk > 35 ? 'medium' : 'low'

    zoneRisks.push({
      zone,
      riskLevel,
      riskScore: Math.round(avgRisk),
      activeReports: data.reports.filter(r => r.status === 'active').length,
      predictedImpact: getPredictedImpact(avgRisk),
      coordinates: data.coords
    })
  })

  return zoneRisks.sort((a, b) => b.riskScore - a.riskScore)
}

function getPredictedImpact(riskScore: number): string {
  if (riskScore > 75) return 'Severe marine ecosystem impact expected within 24 hours'
  if (riskScore > 55) return 'Moderate impact on coastal waters within 48 hours'
  if (riskScore > 35) return 'Minor impact possible, monitoring recommended'
  return 'Low risk, routine monitoring sufficient'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'reports'

  try {
    const reports = generatePollutionReports()

    if (type === 'reports') {
      return NextResponse.json({
        reports,
        totalCount: reports.length,
        criticalCount: reports.filter(r => r.severity === 'critical').length,
        activeCount: reports.filter(r => r.status === 'active').length,
        timestamp: new Date().toISOString()
      })
    }

    if (type === 'zones') {
      const zoneRisks = calculateZoneRisks(reports)
      return NextResponse.json({
        zones: zoneRisks,
        timestamp: new Date().toISOString()
      })
    }

    if (type === 'drainage') {
      return NextResponse.json({
        network: drainageNetwork,
        timestamp: new Date().toISOString()
      })
    }

    if (type === 'summary') {
      const critical = reports.filter(r => r.severity === 'critical').length
      const high = reports.filter(r => r.severity === 'high').length
      const medium = reports.filter(r => r.severity === 'medium').length
      const low = reports.filter(r => r.severity === 'low').length

      return NextResponse.json({
        summary: {
          total: reports.length,
          byServity: { critical, high, medium, low },
          avgRiskIndex: Math.round(reports.reduce((sum, r) => sum + r.riskIndex, 0) / reports.length),
          activeIncidents: reports.filter(r => r.status === 'active').length,
          containedIncidents: reports.filter(r => r.status === 'contained').length,
          avgEtaToOcean: Math.round(reports.reduce((sum, r) => sum + (r.etaToOcean || 0), 0) / reports.length)
        },
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Pollution API error:', error)
    return NextResponse.json({ error: 'Failed to fetch pollution data' }, { status: 500 })
  }
}
