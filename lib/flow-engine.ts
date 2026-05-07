// lib/flow-engine.ts

import type { WeatherData } from './types'

export const MUMBAI_RIVERS = [
  { id: 'mithi', name: 'Mithi River', coords: [[19.141, 72.894], [19.112, 72.879], [19.065, 72.853], [19.043, 72.834]] },
  { id: 'dahisar', name: 'Dahisar River', coords: [[19.231, 72.884], [19.245, 72.855], [19.252, 72.825]] },
  { id: 'poisar', name: 'Poisar River', coords: [[19.201, 72.864], [19.205, 72.835], [19.192, 72.815]] },
  { id: 'oshiwara', name: 'Oshiwara River', coords: [[19.155, 72.854], [19.145, 72.835], [19.132, 72.815]] },
  { id: 'ulhas', name: 'Ulhas River', coords: [[19.233, 73.133], [19.266, 73.083], [19.299, 72.983]] },
  { id: 'vaitarna', name: 'Vaitarna River', coords: [[19.550, 73.050], [19.520, 72.950], [19.490, 72.850]] },
  { id: 'tansa', name: 'Tansa River', coords: [[19.450, 73.000], [19.420, 72.900], [19.390, 72.800]] },
  { id: 'kamothe', name: 'Kamothe Creek', coords: [[19.010, 73.100], [19.020, 73.050], [19.030, 73.000]] },
  { id: 'panvel', name: 'Panvel Creek', coords: [[18.980, 73.110], [18.990, 73.040], [18.950, 72.950]] },
  { id: 'thane', name: 'Thane Creek', coords: [[19.180, 72.980], [19.130, 72.950], [19.080, 72.980]] }
] as { id: string; name: string; coords: [number, number][] }[]

// Calculates distance between two coords in kilometers (Haversine)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export interface FlowPrediction {
  flowPath: {lat: number, lon: number}[]
  etaToOcean: number
  snappedBasin: string
}

export function predictWasteFlow(lat: number, lon: number, weather: WeatherData | null): FlowPrediction {
  let closestRiver = MUMBAI_RIVERS[0]
  let minDistance = Infinity
  let closestIndex = 0

  // 1. Find the absolute closest point on any river
  for (const river of MUMBAI_RIVERS) {
    for (let i = 0; i < river.coords.length; i++) {
      const dist = getDistance(lat, lon, river.coords[i][0], river.coords[i][1])
      if (dist < minDistance) {
        minDistance = dist
        closestRiver = river
        closestIndex = i
      }
    }
  }

  // 2. Build flow path from the citizen's exact point -> closest river point -> ocean
  const flowPath = [{lat, lon}]
  
  // Only add the downstream river path if the citizen isn't already perfectly on the end node
  if (minDistance > 0.1) {
      for (let i = closestIndex; i < closestRiver.coords.length; i++) {
          flowPath.push({ lat: closestRiver.coords[i][0], lon: closestRiver.coords[i][1] })
      }
  }

  // 3. Calculate path length in kilometers
  let totalKm = 0
  for (let i = 0; i < flowPath.length - 1; i++) {
    totalKm += getDistance(flowPath[i].lat, flowPath[i].lon, flowPath[i+1].lat, flowPath[i+1].lon)
  }

  // 4. Dynamic Speed Algorithm based on Weather
  // Base velocity of river/drainage in km/h
  let velocityKmH = 2.5 
  
  if (weather) {
      // If it's raining heavily, flow speed drastically increases (runoff)
      if (weather.rainfall > 10) velocityKmH += 4.0
      else if (weather.rainfall > 2) velocityKmH += 1.5

      // Wind pushes surface waste
      if (weather.windSpeed > 15) velocityKmH += 1.0
  }

  // ETA is distance over speed, rounded to 1 decimal point
  let etaToOcean = totalKm / velocityKmH
  etaToOcean = Math.max(0.5, Math.round(etaToOcean * 10) / 10)

  // If the user reports waste extremely close to the ocean outfall, ETA is practically 0
  if (totalKm < 0.5) etaToOcean = 0

  return {
    flowPath,
    etaToOcean,
    snappedBasin: closestRiver.name
  }
}
