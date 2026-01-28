import { NextResponse } from 'next/server'

// Dubai coordinates
const DUBAI_LAT = 25.2048
const DUBAI_LON = 55.2708

// Open-Meteo API - completely free, no API key needed
const OPEN_METEO_URL = `https://api.open-meteo.com/v1/forecast?latitude=${DUBAI_LAT}&longitude=${DUBAI_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Dubai`

// Weather code to condition mapping (WMO codes)
function getConditionFromCode(code: number): string {
  if (code === 0) return 'Clear'
  if (code === 1) return 'Mostly Clear'
  if (code === 2) return 'Partly Cloudy'
  if (code === 3) return 'Cloudy'
  if (code >= 45 && code <= 48) return 'Foggy'
  if (code >= 51 && code <= 55) return 'Drizzle'
  if (code >= 56 && code <= 57) return 'Freezing Drizzle'
  if (code >= 61 && code <= 65) return 'Rainy'
  if (code >= 66 && code <= 67) return 'Freezing Rain'
  if (code >= 71 && code <= 77) return 'Snowy'
  if (code >= 80 && code <= 82) return 'Showers'
  if (code >= 85 && code <= 86) return 'Snow Showers'
  if (code === 95) return 'Thunderstorm'
  if (code >= 96 && code <= 99) return 'Thunderstorm'
  return 'Clear'
}

// Get descriptive condition based on temp and weather
function getDescriptiveCondition(temp: number, weatherCode: number, hour: number): string {
  const isNight = hour < 6 || hour >= 19
  const baseCondition = getConditionFromCode(weatherCode)
  
  // If there's actual weather, use it
  if (weatherCode > 3) return baseCondition
  
  // Otherwise describe based on temperature
  if (temp >= 42) return 'Very Hot'
  if (temp >= 38) return 'Hot'
  if (temp >= 32) return isNight ? 'Warm' : 'Sunny'
  if (temp >= 26) return 'Pleasant'
  if (temp >= 20) return 'Cool'
  return 'Cold'
}

export async function GET() {
  try {
    const response = await fetch(OPEN_METEO_URL, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Weather API error')
    }
    
    const data = await response.json()
    const current = data.current
    const hour = new Date().getHours()
    
    const weather = {
      temp: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      wind: Math.round(current.wind_speed_10m * 10) / 10,
      condition: getDescriptiveCondition(
        current.temperature_2m, 
        current.weather_code,
        hour
      ),
      weatherCode: current.weather_code,
      location: 'Dubai',
      timestamp: new Date().toISOString(),
    }
    
    return NextResponse.json(weather)
  } catch (error) {
    console.error('Weather fetch error:', error)
    
    // Fallback data if API fails
    return NextResponse.json({
      temp: 32,
      humidity: 45,
      wind: 12.0,
      condition: 'Pleasant',
      location: 'Dubai',
      timestamp: new Date().toISOString(),
      fallback: true,
    })
  }
}
