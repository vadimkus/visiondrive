# Smart Kitchen Test Scripts

## Sensor Simulators

These scripts simulate NB-IoT sensor data for testing the VisionDrive Smart Kitchen dashboard and AWS pipeline without physical hardware.

### Single Sensor Simulator

```bash
cd scripts/test

# Install dependencies
npm install

# Run basic simulation (console output)
npx tsx simulate-sensor.ts

# With custom parameters
npx tsx simulate-sensor.ts \
  --sensor sensor-test-001 \
  --kitchen kitchen-001 \
  --location "Test Fridge" \
  --type fridge \
  --interval 5

# Output to file
npx tsx simulate-sensor.ts --output file

# Send to API endpoint
npx tsx simulate-sensor.ts \
  --output api \
  --api http://localhost:3000/api/portal/smart-kitchen/ingest
```

### Multi-Sensor Dashboard Simulator

Simulates a fleet of sensors with a real-time terminal dashboard:

```bash
npx tsx simulate-multi-sensor.ts
```

Features:
- 6 simulated sensors across 3 kitchens
- Realistic temperature fluctuations
- Random door opening simulations
- Occasional equipment failure scenarios
- Color-coded temperature display
- Live alert tracking

### Simulated Scenarios

The simulators include realistic behaviors:

| Scenario | Description | Frequency |
|----------|-------------|-----------|
| Normal operation | Temperature hovers around setpoint | Default |
| Door opening | Brief temperature spike | ~5% of ticks |
| Equipment failure | Gradual temperature rise | ~1% chance to start |
| Recovery | Equipment returns to normal | After ~20 ticks |

## Data Formats

### Dragino PS-NB-GE JSON Format

The simulator outputs data matching the actual sensor format:

```json
{
  "mod": "PS-NB",
  "Battery": 3.52,
  "IDC_mA": 8.50,
  "VDC_V": 0.0,
  "IDC_AD": 1740,
  "VDC_AD": 0,
  "_visiondrive": {
    "deviceId": "sensor-001",
    "kitchenId": "kitchen-001",
    "location": "Walk-in Fridge",
    "temperature": 4.2,
    "signalStrength": -75,
    "timestamp": "2026-01-11T10:30:00.000Z"
  }
}
```

### Temperature to mA Mapping

| Probe Type | 4 mA | 20 mA | Formula |
|------------|------|-------|---------|
| Fridge | 0°C | 10°C | `temp = (mA - 4) / 16 * 10` |
| Freezer | -30°C | 0°C | `temp = -30 + (mA - 4) / 16 * 30` |
| General | -40°C | 85°C | `temp = -40 + (mA - 4) / 16 * 125` |

## Testing AWS Pipeline

### With LocalStack (Local AWS)

```bash
# Start LocalStack
docker run -d -p 4566:4566 localstack/localstack

# Configure AWS CLI for LocalStack
export AWS_ENDPOINT_URL=http://localhost:4566

# Run simulator with API output
npx tsx simulate-sensor.ts --output api --api http://localhost:4566/...
```

### With Real AWS

```bash
# Set AWS credentials
export AWS_REGION=me-central-1
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret

# Run simulator sending to real IoT endpoint
npx tsx simulate-sensor.ts --output mqtt --broker wss://xxx.iot.me-central-1.amazonaws.com
```

## File Output

When using `--output file`, data is saved to:

```
./simulated-data/
├── sensor-001-2026-01-11.jsonl
├── sensor-002-2026-01-11.jsonl
└── ...
```

Each line is a JSON payload that can be replayed:

```bash
# Replay data to API
cat simulated-data/sensor-001-2026-01-11.jsonl | while read line; do
  curl -X POST http://localhost:3000/api/ingest \
    -H "Content-Type: application/json" \
    -d "$line"
  sleep 1
done
```
