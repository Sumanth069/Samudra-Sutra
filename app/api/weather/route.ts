import { NextResponse } from 'next/server'

// OpenWeatherMap API for real-time weather data
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

interface WeatherData {
  location: string
  temperature: number
  humidity: number
  rainfall: number
  windSpeed: number
  windDirection: string
  condition: string
  icon: string
  timestamp: string
  coordinates: { lat: number; lon: number }
}

interface ForecastData {
  time: string
  rainfall: number
  temperature: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') || '19.0760' // Mumbai default
  const lon = searchParams.get('lon') || '72.8777'
  const type = searchParams.get('type') || 'current'

  try {
    if (type === 'current') {
      // Fetch current weather
      const weatherUrl = OPENWEATHER_API_KEY
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        : null

      if (weatherUrl) {
        const response = await fetch(weatherUrl, { next: { revalidate: 300 } })
        const data = await response.json()

        const weatherData: WeatherData = {
          location: data.name || 'Unknown',
          temperature: Math.round(data.main?.temp || 28),
          humidity: data.main?.humidity || 75,
          rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0,
          windSpeed: Math.round((data.wind?.speed || 3) * 3.6), // Convert m/s to km/h
          windDirection: getWindDirection(data.wind?.deg || 0),
          condition: data.weather?.[0]?.main || 'Clear',
          icon: data.weather?.[0]?.icon || '01d',
          timestamp: new Date().toISOString(),
          coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) }
        }

        return NextResponse.json(weatherData)
      }

      // Fallback with realistic data based on coordinates
      const weatherData: WeatherData = {
        location: getLocationName(parseFloat(lat), parseFloat(lon)),
        temperature: 28 + Math.random() * 5,
        humidity: 70 + Math.random() * 20,
        rainfall: Math.random() > 0.7 ? Math.random() * 15 : 0,
        windSpeed: 8 + Math.random() * 12,
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        condition: Math.random() > 0.6 ? 'Cloudy' : 'Clear',
        icon: Math.random() > 0.6 ? '04d' : '01d',
        timestamp: new Date().toISOString(),
        coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) }
      }

      return NextResponse.json(weatherData)
    }

    if (type === 'forecast') {
      // Fetch 5-day forecast
      const forecastUrl = OPENWEATHER_API_KEY
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        : null

      if (forecastUrl) {
        const response = await fetch(forecastUrl, { next: { revalidate: 1800 } })
        const data = await response.json()

        const forecast: ForecastData[] = data.list?.slice(0, 16).map((item: { dt_txt: string; rain?: { '3h'?: number }; main: { temp: number } }) => ({
          time: item.dt_txt,
          rainfall: item.rain?.['3h'] || 0,
          temperature: Math.round(item.main.temp)
        })) || []

        return NextResponse.json({ forecast })
      }

      // Fallback forecast
      const forecast: ForecastData[] = Array.from({ length: 16 }, (_, i) => ({
        time: new Date(Date.now() + i * 3 * 60 * 60 * 1000).toISOString(),
        rainfall: Math.random() > 0.6 ? Math.random() * 20 : 0,
        temperature: 26 + Math.random() * 6
      }))

      return NextResponse.json({ forecast })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

function getLocationName(lat: number, lon: number): string {
  // Approximate location names for major Indian coastal cities
  if (lat > 18 && lat < 20 && lon > 72 && lon < 73) return 'Mumbai'
  if (lat > 12 && lat < 14 && lon > 80 && lon < 81) return 'Chennai'
  if (lat > 8 && lat < 10 && lon > 76 && lon < 77) return 'Kochi'
  if (lat > 22 && lat < 23 && lon > 88 && lon < 89) return 'Kolkata'
  if (lat > 15 && lat < 16 && lon > 73 && lon < 74) return 'Goa'
  return 'Coastal Region'
}
