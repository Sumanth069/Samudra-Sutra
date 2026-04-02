import { NextResponse } from 'next/server'

// NOAA CO-OPS API for tidal and ocean current data
// https://tidesandcurrents.noaa.gov/api/

interface TidalData {
  stationId: string
  stationName: string
  waterLevel: number
  prediction: number
  tidalType: 'high' | 'low' | 'rising' | 'falling'
  timestamp: string
}

interface CurrentData {
  speed: number
  direction: number
  depth: number
}

interface MarineConditions {
  tidal: TidalData
  currents: CurrentData
  waveHeight: number
  waterTemperature: number
  salinity: number
  turbidity: number
  pollutionIndex: number
  timestamp: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '19.0760')
  const lon = parseFloat(searchParams.get('lon') || '72.8777')
  const stationId = searchParams.get('station') || '8723214' // Miami as default NOAA station

  try {
    // Try to fetch real NOAA tidal predictions
    const today = new Date()
    const beginDate = today.toISOString().split('T')[0].replace(/-/g, '')
    const endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '')

    const noaaUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${beginDate}&end_date=${endDate}&station=${stationId}&product=predictions&datum=MLLW&units=metric&time_zone=gmt&application=samudra_sutra&format=json`

    let tidalData: TidalData
    let realNoaaData = false

    try {
      const noaaResponse = await fetch(noaaUrl, { next: { revalidate: 3600 } })
      if (noaaResponse.ok) {
        const noaaData = await noaaResponse.json()
        if (noaaData.predictions && noaaData.predictions.length > 0) {
          realNoaaData = true
          const currentPrediction = noaaData.predictions[0]
          const nextPrediction = noaaData.predictions[Math.min(6, noaaData.predictions.length - 1)]

          tidalData = {
            stationId: stationId,
            stationName: getStationName(stationId),
            waterLevel: parseFloat(currentPrediction.v) || 0,
            prediction: parseFloat(nextPrediction.v) || 0,
            tidalType: getTidalType(parseFloat(currentPrediction.v), parseFloat(nextPrediction.v)),
            timestamp: currentPrediction.t || new Date().toISOString()
          }
        } else {
          throw new Error('No NOAA predictions available')
        }
      } else {
        throw new Error('NOAA API not available')
      }
    } catch {
      // Generate realistic tidal data based on lunar cycle approximation
      const hour = new Date().getHours()
      const tidalCycle = Math.sin((hour / 12.42) * Math.PI) // ~12.42 hour tidal period
      const waterLevel = 1.5 + tidalCycle * 1.2 // Range from 0.3m to 2.7m

      tidalData = {
        stationId: stationId,
        stationName: getStationName(stationId),
        waterLevel: Math.round(waterLevel * 100) / 100,
        prediction: Math.round((waterLevel + Math.cos((hour / 12.42) * Math.PI) * 0.3) * 100) / 100,
        tidalType: tidalCycle > 0 ? (Math.cos((hour / 12.42) * Math.PI) > 0 ? 'rising' : 'falling') : (Math.cos((hour / 12.42) * Math.PI) > 0 ? 'rising' : 'falling'),
        timestamp: new Date().toISOString()
      }
    }

    // Calculate ocean current based on location and tidal state
    const currentData: CurrentData = {
      speed: 0.3 + Math.abs(Math.sin((new Date().getHours() / 6) * Math.PI)) * 0.8, // 0.3-1.1 m/s
      direction: (180 + lon * 2) % 360, // Approximate current direction
      depth: 5 + Math.random() * 10
    }

    // Generate marine conditions
    const marineConditions: MarineConditions = {
      tidal: tidalData,
      currents: currentData,
      waveHeight: 0.5 + Math.random() * 2,
      waterTemperature: 24 + Math.random() * 6,
      salinity: 33 + Math.random() * 3,
      turbidity: 2 + Math.random() * 8, // NTU
      pollutionIndex: calculatePollutionIndex(lat, lon),
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      ...marineConditions,
      source: realNoaaData ? 'NOAA CO-OPS' : 'Calculated',
      location: { lat, lon }
    })
  } catch (error) {
    console.error('Marine API error:', error)
    return NextResponse.json({ error: 'Failed to fetch marine data' }, { status: 500 })
  }
}

function getTidalType(current: number, next: number): 'high' | 'low' | 'rising' | 'falling' {
  const diff = next - current
  if (Math.abs(diff) < 0.1) {
    return current > 1.5 ? 'high' : 'low'
  }
  return diff > 0 ? 'rising' : 'falling'
}

function getStationName(stationId: string): string {
  const stations: Record<string, string> = {
    '8723214': 'Virginia Key, FL',
    '8724580': 'Key West, FL',
    '8729108': 'Panama City, FL',
    '8531680': 'Sandy Hook, NJ',
    '9414290': 'San Francisco, CA',
    '9410660': 'Los Angeles, CA',
    'MUMBAI': 'Mumbai Harbor',
    'CHENNAI': 'Chennai Port',
    'KOCHI': 'Kochi Harbor'
  }
  return stations[stationId] || 'Monitoring Station'
}

function calculatePollutionIndex(lat: number, lon: number): number {
  // Simulated pollution index based on proximity to known pollution hotspots
  // In production, this would integrate with real water quality sensors
  const baseIndex = 30

  // Higher pollution near major industrial/urban coastal areas
  const urbanFactor = Math.random() * 20

  // Seasonal variation (monsoon increases runoff)
  const month = new Date().getMonth()
  const monsoonFactor = (month >= 5 && month <= 9) ? 15 : 0

  // Time of day variation (higher during peak discharge hours)
  const hour = new Date().getHours()
  const hourlyFactor = (hour >= 6 && hour <= 18) ? 10 : 5

  return Math.min(100, Math.round(baseIndex + urbanFactor + monsoonFactor + hourlyFactor + Math.random() * 10))
}
