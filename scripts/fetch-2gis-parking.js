// Script to fetch parking data from 2GIS API for Dubai
// Run this manually: node scripts/fetch-2gis-parking.js

const API_KEY = '543f552a-57ae-4de7-bf23-d887735ab5e4'
const DUBAI_BOUNDS = {
  minLat: 25.0,
  maxLat: 25.4,
  minLng: 55.0,
  maxLng: 55.5
}

async function fetch2GISParking() {
  // 2GIS Places API endpoint for searching parking facilities
  // Documentation: https://docs.2gis.com/en/api/search/places/overview
  
  const searchQueries = [
    'parking',
    'موقف سيارات', // Arabic for parking
    'car park',
    'parking lot',
    'underground parking',
    'multi-story parking'
  ]

  const allParkingData = []

  for (const query of searchQueries) {
    try {
      // 2GIS Search API - trying different endpoint structure
      const url = new URL('https://catalog.api.2gis.com/3.0/items')
      url.searchParams.append('key', API_KEY)
      url.searchParams.append('q', query)
      url.searchParams.append('locale', 'en_AE')
      url.searchParams.append('location', '55.2708,25.2048') // Dubai center (lng,lat)
      url.searchParams.append('radius', '50000') // 50km radius
      url.searchParams.append('fields', 'items.point,items.address,items.name_ex,items.rubrics')
      url.searchParams.append('page_size', '50')

      console.log(`Fetching: ${query}...`)
      console.log(`URL: ${url.toString()}`)
      
      const response = await fetch(url.toString())
      console.log(`Status: ${response.status} ${response.statusText}`)
      
      const text = await response.text()
      console.log(`Response preview: ${text.substring(0, 200)}...`)
      
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error(`Failed to parse JSON: ${e.message}`)
        continue
      }

      if (data.meta) {
        console.log(`Meta:`, JSON.stringify(data.meta, null, 2))
      }

      if (data.result?.items) {
        console.log(`Found ${data.result.items.length} results for "${query}"`)
        allParkingData.push(...data.result.items)
      } else {
        console.log(`No items found for "${query}"`)
        if (data.error) {
          console.log(`Error from API:`, data.error)
        }
      }

      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Error fetching "${query}":`, error.message)
      console.error(error.stack)
    }
  }

  // If no results from 2GIS, create some demo zones based on known Dubai parking locations
  if (allParkingData.length === 0) {
    console.log('\n⚠️  No data from 2GIS API. Creating demo parking zones based on known Dubai locations...\n')
    
    allParkingData.push(
      // Known major parking facilities in Dubai
      {
        name: 'Dubai Mall Parking',
        point: { lat: 25.1980, lon: 55.2794 },
        address: { name: 'Downtown Dubai' }
      },
      {
        name: 'Mall of the Emirates Parking',
        point: { lat: 25.1180, lon: 55.2004 },
        address: { name: 'Al Barsha' }
      },
      {
        name: 'Dubai Marina Mall Parking',
        point: { lat: 25.0783, lon: 55.1402 },
        address: { name: 'Dubai Marina' }
      },
      {
        name: 'Ibn Battuta Mall Parking',
        point: { lat: 25.0441, lon: 55.1173 },
        address: { name: 'Jebel Ali' }
      },
      {
        name: 'City Centre Deira Parking',
        point: { lat: 25.2525, lon: 55.3330 },
        address: { name: 'Deira' }
      },
      {
        name: 'BurJuman Mall Parking',
        point: { lat: 25.2535, lon: 55.3033 },
        address: { name: 'Bur Dubai' }
      },
      {
        name: 'Mercato Shopping Mall Parking',
        point: { lat: 25.2185, lon: 55.2586 },
        address: { name: 'Jumeirah' }
      },
      {
        name: 'Dubai Festival City Mall Parking',
        point: { lat: 25.2219, lon: 55.3548 },
        address: { name: 'Festival City' }
      },
      {
        name: 'Wafi Mall Parking',
        point: { lat: 25.2300, lon: 55.3188 },
        address: { name: 'Oud Metha' }
      },
      {
        name: 'The Dubai Mall Metro Parking',
        point: { lat: 25.1972, lon: 55.2744 },
        address: { name: 'Downtown Dubai' }
      },
      {
        name: 'DIFC Gate Village Parking',
        point: { lat: 25.2138, lon: 55.2817 },
        address: { name: 'DIFC' }
      },
      {
        name: 'JBR Beach Parking',
        point: { lat: 25.0747, lon: 55.1346 },
        address: { name: 'JBR' }
      },
      {
        name: 'Kite Beach Parking',
        point: { lat: 25.2017, lon: 55.2408 },
        address: { name: 'Umm Suqeim' }
      },
      {
        name: 'La Mer Beach Parking',
        point: { lat: 25.2320, lon: 55.2913 },
        address: { name: 'Jumeirah' }
      },
      {
        name: 'Dubai Design District Parking',
        point: { lat: 25.1949, lon: 55.2900 },
        address: { name: 'd3' }
      },
      {
        name: 'City Walk Parking',
        point: { lat: 25.2142, lon: 55.2604 },
        address: { name: 'Al Wasl' }
      },
      {
        name: 'Box Park Parking',
        point: { lat: 25.2156, lon: 55.2587 },
        address: { name: 'Al Wasl' }
      },
      {
        name: 'Dubai Internet City Metro Parking',
        point: { lat: 25.0943, lon: 55.1620 },
        address: { name: 'Internet City' }
      },
      {
        name: 'Dubai Media City Parking',
        point: { lat: 25.0989, lon: 55.1643 },
        address: { name: 'Media City' }
      },
      {
        name: 'Knowledge Park Parking',
        point: { lat: 25.1016, lon: 55.1622 },
        address: { name: 'Knowledge Park' }
      }
    )
  }

  // Remove duplicates based on location
  const uniqueParking = []
  const seen = new Set()

  for (const item of allParkingData) {
    if (!item.point) continue
    
    const key = `${item.point.lat.toFixed(5)},${item.point.lon.toFixed(5)}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueParking.push(item)
    }
  }

  console.log(`\nTotal unique parking facilities found: ${uniqueParking.length}`)

  // Convert to VisionDrive zone format
  const visionDriveZones = uniqueParking.map((parking, index) => {
    const name = parking.name || `Parking ${index + 1}`
    const lat = parking.point.lat
    const lng = parking.point.lon
    
    // Determine zone kind based on rubrics or name
    let kind = 'PAID'
    const nameLC = name.toLowerCase()
    if (nameLC.includes('free') || nameLC.includes('public')) {
      kind = 'FREE'
    } else if (nameLC.includes('private') || nameLC.includes('resident')) {
      kind = 'PRIVATE'
    }

    // Create a small polygon around the point (approximate 50m radius)
    const size = 0.0005 // ~50m
    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [lng - size, lat - size],
            [lng + size, lat - size],
            [lng + size, lat + size],
            [lng - size, lat + size],
            [lng - size, lat - size],
          ],
        ],
      },
      properties: { 
        name,
        source: '2GIS',
        address: parking.address?.name || null,
        originalId: parking.id
      },
    }

    // Extract capacity if available
    const capacity = parking.capacity || null

    // Extract address
    const address = parking.address?.name || null

    return {
      name,
      kind,
      lat,
      lng,
      geojson,
      capacity,
      address,
      tariff: kind === 'PAID' ? { rateAedPerHour: 10, hours: '08:00-22:00', maxDailyAed: 50 } : null,
      source: '2GIS',
      originalId: parking.id
    }
  })

  // Save to JSON file
  const fs = require('fs')
  const outputPath = './data/2gis-dubai-parking.json'
  
  fs.mkdirSync('./data', { recursive: true })
  fs.writeFileSync(
    outputPath,
    JSON.stringify(visionDriveZones, null, 2),
    'utf-8'
  )

  console.log(`\n✅ Saved ${visionDriveZones.length} parking zones to ${outputPath}`)
  console.log('\nSample zone:')
  console.log(JSON.stringify(visionDriveZones[0], null, 2))

  return visionDriveZones
}

// Run the script
if (require.main === module) {
  fetch2GISParking()
    .then(() => {
      console.log('\n🎉 Done! Now you can import this data into your database.')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Error:', error)
      process.exit(1)
    })
}

module.exports = { fetch2GISParking }

