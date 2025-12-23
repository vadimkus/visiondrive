# Fetching Parking Data from 2GIS

## Overview

This guide explains how to fetch real parking data from [2GIS API](https://platform.2gis.ru/keys) for Dubai and import it into your VisionDrive database.

## Prerequisites

1. **2GIS API Key**: `543f552a-57ae-4de7-bf23-d887735ab5e4` (demo key provided)
2. **Node.js** installed
3. **Database** seeded with at least one tenant and site

## Step-by-Step Instructions

### Step 1: Fetch Parking Data from 2GIS

Run the fetch script to download parking facility data from 2GIS for Dubai:

```bash
npm run fetch:2gis
```

**What this does:**
- Searches 2GIS for parking facilities in Dubai using multiple queries
- Searches in English and Arabic (موقف سيارات)
- Covers 50km radius from Dubai center
- Removes duplicates based on location
- Converts to VisionDrive zone format
- Saves to `data/2gis-dubai-parking.json`

**Expected output:**
```
Fetching: parking...
Found 45 results for "parking"
Fetching: موقف سيارات...
Found 38 results for "موقف سيارات"
...

Total unique parking facilities found: 127

✅ Saved 127 parking zones to ./data/2gis-dubai-parking.json
```

### Step 2: Import into Database

After fetching, import the data into your VisionDrive database:

```bash
npm run import:2gis
```

**What this does:**
- Reads `data/2gis-dubai-parking.json`
- Checks for duplicate zones (by name or location)
- Inserts new zones into the `zones` table
- Links zones to your default tenant and site
- Preserves GeoJSON polygons and tariff information

**Expected output:**
```
🚀 Importing 2GIS parking data...

📊 Found 127 parking zones to import

✅ Imported: Dubai Mall Parking (PAID)
✅ Imported: Marina Walk Parking (PAID)
⏭️  Skipping "Downtown Parking" (already exists)
...

✅ Import complete!
   Imported: 98 zones
   Skipped: 29 zones (already exist)
   Total: 127 zones
```

### Step 3: View on Map

1. Navigate to `http://localhost:3000/portal/map`
2. Click the **"Parking Areas"** button
3. You'll see all imported 2GIS parking zones overlaid on the map!

## Data Structure

Each 2GIS parking zone includes:

```json
{
  "name": "Dubai Mall Parking",
  "kind": "PAID",
  "lat": 25.1980,
  "lng": 55.2794,
  "geojson": {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [...]
    },
    "properties": {
      "name": "Dubai Mall Parking",
      "source": "2GIS",
      "originalId": "70030076169679317"
    }
  },
  "capacity": 1000,
  "address": "Downtown Dubai",
  "tariff": {
    "rateAedPerHour": 10,
    "hours": "08:00-22:00",
    "maxDailyAed": 50
  },
  "source": "2GIS"
}
```

## API Documentation

- **2GIS Platform**: https://platform.2gis.ru/keys
- **Search API Docs**: https://docs.2gis.com/en/api/search/places/overview
- **UAE Region ID**: `1`
- **Dubai Center**: `25.2048, 55.2708`

## Troubleshooting

### "2GIS data file not found"
Run `npm run fetch:2gis` first to download the data.

### "Default tenant not found"
Run `npm run db:seed` to initialize your database.

### "Rate limit exceeded"
The script includes 1-second delays between requests. If you still hit rate limits, increase the delay in `fetch-2gis-parking.js`.

### "No results found"
- Check your internet connection
- Verify the API key is valid
- Try different search queries in the script

## Customization

### Add More Search Queries

Edit `scripts/fetch-2gis-parking.js`:

```javascript
const searchQueries = [
  'parking',
  'موقف سيارات',
  'car park',
  'valet parking',
  'covered parking',
  // Add your own queries here
]
```

### Change Search Radius

```javascript
url.searchParams.append('radius', '50000') // Change from 50km
```

### Filter by Type

```javascript
url.searchParams.append('type', 'building.parking')
// Or: 'building.parking.underground', 'building.parking.multilevel'
```

## Notes

- **Demo Key**: The provided key is for demo/testing purposes
- **Rate Limits**: 2GIS may have rate limits on their API
- **Data Accuracy**: 2GIS data is crowdsourced and may not be 100% accurate
- **Updates**: Re-run the scripts periodically to get updated data
- **Duplicate Detection**: Uses 100m radius to detect duplicate locations

## License & Terms

- 2GIS data is subject to [2GIS Terms of Service](https://law.2gis.ru/api-rules/)
- Ensure compliance with their terms for commercial use
- Data is provided "as-is" without warranty

## Next Steps

1. ✅ Fetch and import 2GIS data
2. ✅ Verify zones on the map
3. 🔄 Integrate with your IoT sensors for real-time occupancy
4. 🔄 Add tariff information from RTA Dubai
5. 🔄 Enhance zone boundaries with actual surveyed data

---

**Happy Parking! 🅿️**

