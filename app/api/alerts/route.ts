import { NextResponse } from 'next/server'

export interface Alert {
  id: string
  type: 'HIGH_RISK' | 'INTERVENTION_REQUIRED' | 'WASTE_DETECTED' | 'WEATHER_WARNING' | 'TIDAL_SURGE' | 'SYSTEM_UPDATE'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  zone: string
  location: { lat: number; lon: number }
  timestamp: string
  expiresAt: string
  acknowledged: boolean
  actions: Array<{
    id: string
    label: string
    type: 'deploy_team' | 'alert_fishermen' | 'increase_monitoring' | 'evacuate' | 'contain'
  }>
  metadata: {
    etaHours?: number
    riskIndex?: number
    affectedArea?: number // sq km
    estimatedCost?: number
  }
}

export interface AlertStats {
  total: number
  critical: number
  warning: number
  info: number
  acknowledged: number
  pending: number
}

function generateAlerts(): Alert[] {
  const now = new Date()
  const alerts: Alert[] = []

  // Mumbai zones with realistic alert scenarios
  const alertScenarios = [
    {
      type: 'HIGH_RISK' as const,
      severity: 'critical' as const,
      zone: 'Mithi River',
      lat: 19.0702,
      lon: 72.8821,
      title: 'Critical Pollution Level Detected',
      message: 'High concentration of plastic waste detected at Mithi River outfall. Risk index at 87%. Immediate intervention recommended.',
      etaHours: 18,
      riskIndex: 87,
      affectedArea: 2.4
    },
    {
      type: 'INTERVENTION_REQUIRED' as const,
      severity: 'critical' as const,
      zone: 'Mahim Bay',
      lat: 19.0356,
      lon: 72.8451,
      title: 'Intervention Required - Mahim Bay',
      message: 'Sewage discharge exceeds safe limits. Deploy cleanup teams to prevent marine ecosystem damage.',
      etaHours: 12,
      riskIndex: 78,
      affectedArea: 1.8
    },
    {
      type: 'WEATHER_WARNING' as const,
      severity: 'warning' as const,
      zone: 'Mumbai Coast',
      lat: 19.0176,
      lon: 72.8150,
      title: 'Heavy Rainfall Advisory',
      message: 'IMD forecasts heavy rainfall in next 6 hours. Expect increased drainage flow and potential pollution surge.',
      etaHours: 6,
      riskIndex: 65
    },
    {
      type: 'WASTE_DETECTED' as const,
      severity: 'warning' as const,
      zone: 'Versova Beach',
      lat: 19.1342,
      lon: 72.8062,
      title: 'Waste Accumulation Detected',
      message: 'Satellite imagery confirms debris accumulation at Versova Beach. Estimated volume: 45 cubic meters.',
      etaHours: 24,
      riskIndex: 52,
      affectedArea: 0.5
    },
    {
      type: 'TIDAL_SURGE' as const,
      severity: 'warning' as const,
      zone: 'Thane Creek',
      lat: 19.1823,
      lon: 72.9751,
      title: 'Tidal Surge Expected',
      message: 'High tide combined with strong winds may push accumulated waste inland. Monitor drainage outlets.',
      etaHours: 4,
      riskIndex: 58
    },
    {
      type: 'SYSTEM_UPDATE' as const,
      severity: 'info' as const,
      zone: 'All Zones',
      lat: 19.0760,
      lon: 72.8777,
      title: 'Sensor Network Update',
      message: 'All 24 monitoring stations reporting normal. Last calibration: 2 hours ago.',
      riskIndex: 0
    },
    {
      type: 'WASTE_DETECTED' as const,
      severity: 'info' as const,
      zone: 'Juhu Beach',
      lat: 19.0948,
      lon: 72.8269,
      title: 'Minor Debris Detected',
      message: 'Small debris patch identified near Juhu Beach. Low priority, scheduled for routine cleanup.',
      etaHours: 48,
      riskIndex: 28,
      affectedArea: 0.1
    }
  ]

  alertScenarios.forEach((scenario, index) => {
    const hoursAgo = Math.random() * 4 // Alerts from last 4 hours
    const createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
    const expiresIn = scenario.severity === 'critical' ? 6 : scenario.severity === 'warning' ? 12 : 24

    alerts.push({
      id: `ALT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(index + 1).padStart(4, '0')}`,
      type: scenario.type,
      severity: scenario.severity,
      title: scenario.title,
      message: scenario.message,
      zone: scenario.zone,
      location: { lat: scenario.lat, lon: scenario.lon },
      timestamp: createdAt.toISOString(),
      expiresAt: new Date(createdAt.getTime() + expiresIn * 60 * 60 * 1000).toISOString(),
      acknowledged: scenario.severity === 'info' ? true : Math.random() > 0.7,
      actions: getActionsForType(scenario.type, scenario.severity),
      metadata: {
        etaHours: scenario.etaHours,
        riskIndex: scenario.riskIndex,
        affectedArea: scenario.affectedArea,
        estimatedCost: scenario.severity === 'critical' ? 50000 + Math.random() * 100000 : undefined
      }
    })
  })

  return alerts.sort((a, b) => {
    // Sort by severity first, then by timestamp
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })
}

function getActionsForType(type: Alert['type'], severity: Alert['severity']): Alert['actions'] {
  const actions: Alert['actions'] = []

  if (severity === 'critical') {
    actions.push(
      { id: 'deploy', label: 'Deploy Cleanup Team', type: 'deploy_team' },
      { id: 'contain', label: 'Initiate Containment', type: 'contain' }
    )
  }

  if (type === 'HIGH_RISK' || type === 'INTERVENTION_REQUIRED') {
    actions.push({ id: 'alert', label: 'Alert Fishermen', type: 'alert_fishermen' })
  }

  if (type === 'WEATHER_WARNING' || type === 'TIDAL_SURGE') {
    actions.push({ id: 'monitor', label: 'Increase Monitoring', type: 'increase_monitoring' })
  }

  if (type === 'WASTE_DETECTED' && severity !== 'critical') {
    actions.push({ id: 'monitor', label: 'Add to Watch List', type: 'increase_monitoring' })
  }

  return actions
}

function calculateStats(alerts: Alert[]): AlertStats {
  return {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
    acknowledged: alerts.filter(a => a.acknowledged).length,
    pending: alerts.filter(a => !a.acknowledged).length
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const severity = searchParams.get('severity')
  const zone = searchParams.get('zone')
  const acknowledged = searchParams.get('acknowledged')

  try {
    let alerts = generateAlerts()

    // Apply filters
    if (severity) {
      alerts = alerts.filter(a => a.severity === severity)
    }
    if (zone) {
      alerts = alerts.filter(a => a.zone.toLowerCase().includes(zone.toLowerCase()))
    }
    if (acknowledged !== null) {
      alerts = alerts.filter(a => a.acknowledged === (acknowledged === 'true'))
    }

    const stats = calculateStats(alerts)

    return NextResponse.json({
      alerts,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Alerts API error:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { alertId, action } = body

    // In production, this would update the database
    // For now, we'll just acknowledge the action
    return NextResponse.json({
      success: true,
      alertId,
      action,
      message: `Action '${action}' initiated for alert ${alertId}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Alert action error:', error)
    return NextResponse.json({ error: 'Failed to process alert action' }, { status: 500 })
  }
}
