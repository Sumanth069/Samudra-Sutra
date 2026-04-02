// Core data types for Samudra Sutra

export interface Coordinates {
  lat: number
  lon: number
}

export interface WeatherData {
  location: string
  temperature: number
  humidity: number
  rainfall: number
  windSpeed: number
  windDirection: string
  condition: string
  icon: string
  timestamp: string
  coordinates: Coordinates
}

export interface ForecastData {
  time: string
  rainfall: number
  temperature: number
}

export interface TidalData {
  stationId: string
  stationName: string
  waterLevel: number
  prediction: number
  tidalType: 'high' | 'low' | 'rising' | 'falling'
  timestamp: string
}

export interface CurrentData {
  speed: number
  direction: number
  depth: number
}

export interface MarineConditions {
  tidal: TidalData
  currents: CurrentData
  waveHeight: number
  waterTemperature: number
  salinity: number
  turbidity: number
  pollutionIndex: number
  timestamp: string
  source?: string
  location?: Coordinates
}

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
  estimatedVolume: number
  riskIndex: number
  flowPath: Array<{ lat: number; lon: number; eta: number }>
  reportedAt: string
  updatedAt: string
  status: 'active' | 'monitoring' | 'contained' | 'resolved'
  etaToOcean: number | null
  etaToRiver: number | null
  imageUrl?: string
}

export interface ZoneRisk {
  zone: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  activeReports: number
  predictedImpact: string
  coordinates: Coordinates[]
}

export interface Alert {
  id: string
  type: 'HIGH_RISK' | 'INTERVENTION_REQUIRED' | 'WASTE_DETECTED' | 'WEATHER_WARNING' | 'TIDAL_SURGE' | 'SYSTEM_UPDATE'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  zone: string
  location: Coordinates
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
    affectedArea?: number
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

export interface SystemStats {
  activeAlerts: number
  reportsToday: number
  wasteIntercepted: number
  teamsDeployed: number
  sensorsOnline: number
  healthFactor: number
  lastUpdate: string
}

export interface SimulationState {
  timeOffset: number // hours from now
  isPlaying: boolean
  playbackSpeed: number
}
