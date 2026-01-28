import { NextResponse } from 'next/server'

// Dubai coordinates
const DUBAI_LAT = 25.2048
const DUBAI_LON = 55.2708

// Open-Meteo API with extended data
const OPEN_METEO_URL = `https://api.open-meteo.com/v1/forecast?latitude=${DUBAI_LAT}&longitude=${DUBAI_LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,uv_index,visibility&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Asia/Dubai&forecast_days=1`

// Weather code to condition mapping (WMO codes)
function getConditionFromCode(code: number): { condition: string; description: string } {
  const conditions: Record<number, { condition: string; description: string }> = {
    0: { condition: 'Clear', description: 'Clear sky with excellent visibility' },
    1: { condition: 'Mostly Clear', description: 'Mainly clear with few clouds' },
    2: { condition: 'Partly Cloudy', description: 'Partly cloudy skies' },
    3: { condition: 'Cloudy', description: 'Overcast with full cloud cover' },
    45: { condition: 'Foggy', description: 'Fog reducing visibility' },
    48: { condition: 'Foggy', description: 'Depositing rime fog' },
    51: { condition: 'Drizzle', description: 'Light drizzle' },
    53: { condition: 'Drizzle', description: 'Moderate drizzle' },
    55: { condition: 'Drizzle', description: 'Dense drizzle' },
    61: { condition: 'Rainy', description: 'Slight rain' },
    63: { condition: 'Rainy', description: 'Moderate rain' },
    65: { condition: 'Rainy', description: 'Heavy rain' },
    80: { condition: 'Showers', description: 'Slight rain showers' },
    81: { condition: 'Showers', description: 'Moderate rain showers' },
    82: { condition: 'Showers', description: 'Violent rain showers' },
    95: { condition: 'Thunderstorm', description: 'Thunderstorm activity' },
    96: { condition: 'Thunderstorm', description: 'Thunderstorm with slight hail' },
    99: { condition: 'Thunderstorm', description: 'Thunderstorm with heavy hail' },
  }
  return conditions[code] || { condition: 'Clear', description: 'Clear conditions' }
}

// Get descriptive condition based on temp and weather
function getDescriptiveCondition(temp: number, weatherCode: number, hour: number): { condition: string; description: string } {
  const isNight = hour < 6 || hour >= 19
  const baseCondition = getConditionFromCode(weatherCode)
  
  // If there's actual weather (rain, fog, etc), use it
  if (weatherCode > 3) return baseCondition
  
  // Otherwise describe based on temperature
  if (temp >= 42) return { condition: 'Very Hot', description: 'Extreme heat - stay hydrated and avoid prolonged sun exposure' }
  if (temp >= 38) return { condition: 'Hot', description: 'Hot conditions - limit outdoor activities during peak hours' }
  if (temp >= 32) return isNight 
    ? { condition: 'Warm', description: 'Warm evening with comfortable temperatures' }
    : { condition: 'Sunny', description: 'Sunny and warm - typical Dubai weather' }
  if (temp >= 26) return { condition: 'Pleasant', description: 'Pleasant weather - ideal for outdoor activities' }
  if (temp >= 20) return { condition: 'Cool', description: 'Cool and comfortable temperatures' }
  return { condition: 'Cold', description: 'Unusually cold for Dubai' }
}

// Wind direction to compass
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

// Humidity description
function getHumidityDescription(humidity: number): string {
  if (humidity < 30) return 'Very dry air - consider using moisturizer'
  if (humidity < 40) return 'Comfortable humidity levels'
  if (humidity < 60) return 'Moderate humidity - pleasant conditions'
  if (humidity < 80) return 'Humid - may feel sticky outdoors'
  return 'Very humid - high moisture in the air'
}

// UV Index description
function getUVDescription(uv: number): { level: string; advice: string } {
  if (uv < 3) return { level: 'Low', advice: 'Minimal protection needed' }
  if (uv < 6) return { level: 'Moderate', advice: 'Wear sunscreen SPF 30+' }
  if (uv < 8) return { level: 'High', advice: 'Reduce sun exposure 10am-4pm' }
  if (uv < 11) return { level: 'Very High', advice: 'Extra protection essential' }
  return { level: 'Extreme', advice: 'Avoid outdoor activities' }
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
    const daily = data.daily
    const hour = new Date().getHours()
    
    const conditionData = getDescriptiveCondition(
      current.temperature_2m, 
      current.weather_code,
      hour
    )
    
    const uvData = getUVDescription(current.uv_index || 0)
    
    const weather = {
      // Basic data
      temp: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      wind: Math.round(current.wind_speed_10m * 10) / 10,
      condition: conditionData.condition,
      
      // Extended temperature data
      feelsLike: Math.round(current.apparent_temperature),
      tempMin: Math.round(daily.temperature_2m_min[0]),
      tempMax: Math.round(daily.temperature_2m_max[0]),
      
      // Extended humidity data
      humidityDescription: getHumidityDescription(current.relative_humidity_2m),
      dewPoint: Math.round(current.temperature_2m - ((100 - current.relative_humidity_2m) / 5)),
      pressure: Math.round(current.surface_pressure),
      
      // Extended wind data
      windDirection: getWindDirection(current.wind_direction_10m),
      windDirectionDegrees: current.wind_direction_10m,
      windGusts: Math.round(current.wind_gusts_10m * 10) / 10,
      
      // Extended condition data
      conditionDescription: conditionData.description,
      uvIndex: Math.round(current.uv_index || 0),
      uvLevel: uvData.level,
      uvAdvice: uvData.advice,
      visibility: Math.round((current.visibility || 10000) / 1000),
      
      // Sun data
      sunrise: daily.sunrise[0]?.split('T')[1] || '06:00',
      sunset: daily.sunset[0]?.split('T')[1] || '18:00',
      
      // Meta
      location: 'Dubai, UAE',
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
      feelsLike: 34,
      tempMin: 26,
      tempMax: 38,
      humidityDescription: 'Moderate humidity levels',
      dewPoint: 18,
      pressure: 1013,
      windDirection: 'NW',
      windDirectionDegrees: 315,
      windGusts: 18.5,
      conditionDescription: 'Pleasant weather conditions',
      uvIndex: 7,
      uvLevel: 'High',
      uvAdvice: 'Wear sunscreen SPF 30+',
      visibility: 10,
      sunrise: '06:30',
      sunset: '18:00',
      location: 'Dubai, UAE',
      timestamp: new Date().toISOString(),
      fallback: true,
    })
  }
}
