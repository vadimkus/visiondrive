# PSL01B Parking Sensor Configuration Guide

## Sensor Overview

The **PSL01B-NBIoT** is a smart parking sensor that detects vehicle presence using dual-mode detection (geomagnetic + radar).

### Specifications

| Property | Value |
|----------|-------|
| Model | PSL01B-NBIoT |
| Detection | Geomagnetic + Radar (dual mode) |
| Protocol | NB-IoT |
| Network | du (UAE) |
| Battery | 3.6V Lithium (5+ years) |
| IP Rating | IP68 (waterproof) |
| Operating Temp | -40°C to +85°C |
| Dimensions | Ø120mm × 45mm |

---

## Network Configuration

### du SIM Settings

| Setting | Value |
|---------|-------|
| APN | du |
| Network | NB-IoT (Band 20) |
| Region | UAE |

---

## AWS IoT Core Configuration

### Sensor Registration

Each sensor must be registered in AWS IoT Core with:
1. X.509 certificate (or custom auth)
2. IoT Policy
3. Thing registration

### MQTT Configuration

| Setting | Value |
|---------|-------|
| Endpoint | `a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com` |
| Port | 8883 (MQTTS) |
| Protocol | MQTT 3.1.1 |
| Client ID | Sensor ID (e.g., `PSL01B-001`) |

### Topic Structure

```
visiondrive/parking/{zoneId}/{bayId}/status
```

Example:
```
visiondrive/parking/zone-001/A-001/status
```

---

## Message Format

### Status Update

Sent when vehicle status changes or on heartbeat interval.

```json
{
  "deviceId": "PSL01B-001",
  "status": "occupied",
  "battery": 95,
  "signal": -72,
  "mode": "dual",
  "ts": 1736678400000
}
```

| Field | Type | Description |
|-------|------|-------------|
| deviceId | string | Unique sensor identifier |
| status | string | `occupied` or `vacant` |
| battery | number | Battery level (0-100%) |
| signal | number | Signal strength (dBm) |
| mode | string | Detection mode used |
| ts | number | Unix timestamp (ms) |

### Heartbeat

Sent periodically (default: every 30 minutes).

```json
{
  "deviceId": "PSL01B-001",
  "status": "vacant",
  "battery": 95,
  "signal": -72,
  "mode": "dual",
  "ts": 1736678400000,
  "heartbeat": true
}
```

---

## Installation Guide

### Physical Installation

1. **Location Selection**
   - Center of parking bay
   - Away from metal grates/drains
   - Clear line of sight to sky

2. **Surface Preparation**
   - Clean the surface
   - Ensure level ground
   - Check for underground utilities

3. **Sensor Mounting**
   - Apply adhesive backing
   - Press firmly for 30 seconds
   - Allow 24 hours to cure

4. **Verification**
   - Test detection with vehicle
   - Confirm data in dashboard

### Wiring Diagram

```
         ┌─────────────────────────┐
         │      PSL01B Sensor      │
         │                         │
         │   ┌───────────────┐     │
         │   │ Geomagnetic   │     │
         │   │   Sensor      │     │
         │   └───────────────┘     │
         │                         │
         │   ┌───────────────┐     │
         │   │    Radar      │     │
         │   │   Module      │     │
         │   └───────────────┘     │
         │                         │
         │   ┌───────────────┐     │
         │   │  NB-IoT       │     │
         │   │  Module       │◄────┼──── du Network
         │   └───────────────┘     │
         │                         │
         │   ┌───────────────┐     │
         │   │   Battery     │     │
         │   │   3.6V        │     │
         │   └───────────────┘     │
         │                         │
         └─────────────────────────┘
                    │
                    │  Embedded in ground
                    ▼
         ═══════════════════════════
              Parking Surface
```

---

## Sensor Registration Script

Use this script to register sensors in the system.

### CSV Format

Create `sensors.csv`:
```csv
sensorId,zoneId,bayNumber,model
PSL01B-001,zone-001,A-001,PSL01B
PSL01B-002,zone-001,A-002,PSL01B
PSL01B-003,zone-001,A-003,PSL01B
```

### Registration Script

```bash
cd /Users/vadimkus/VisionDrive/Parking/scripts/sensor-config
npx tsx register-sensors.ts sensors.csv
```

### Manual Registration

```bash
curl -X POST https://o2s68toqw0.execute-api.me-central-1.amazonaws.com/prod/sensors \
  -H "Content-Type: application/json" \
  -d '{
    "sensorId": "PSL01B-001",
    "zoneId": "zone-001",
    "bayNumber": "A-001",
    "model": "PSL01B"
  }'
```

---

## Calibration

### Initial Calibration

After installation, perform calibration:

1. Ensure bay is **empty** (no vehicle)
2. Wait 5 minutes for sensor to stabilize
3. Use the calibration endpoint:

```bash
curl -X POST https://API_URL/sensors/PSL01B-001/calibrate
```

### Recalibration

Recalibrate if:
- Detection accuracy drops
- Sensor was moved
- Ground conditions changed
- After battery replacement

---

## Battery Management

### Battery Life Estimation

| Reporting Interval | Battery Life |
|-------------------|--------------|
| 1 minute | ~2 years |
| 5 minutes | ~4 years |
| 15 minutes | ~5+ years |

### Low Battery Alerts

System sends alerts when battery < 20%.

Alert flow:
1. Sensor reports low battery
2. IoT Rule triggers Lambda
3. Lambda sends SNS notification
4. Email/SMS delivered

### Battery Replacement

1. Remove sensor from ground
2. Open battery compartment
3. Replace with 3.6V ER26500
4. Reinstall sensor
5. Recalibrate

---

## Troubleshooting

### Sensor Not Reporting

1. **Check network coverage**
   - Ensure NB-IoT signal in area
   - Check for RF interference

2. **Verify registration**
   ```bash
   curl https://API_URL/sensors/SENSOR_ID
   ```

3. **Check AWS IoT Core**
   - Verify thing exists
   - Check certificate validity
   - Review IoT logs

### Incorrect Detection

1. **Recalibrate sensor**
2. **Check for metal interference**
   - Remove nearby metal objects
   - Check underground utilities

3. **Verify installation depth**
   - Sensor should be flush with surface

### Connectivity Issues

1. **Check APN settings**
   - APN should be "du"

2. **Verify endpoint**
   - Correct IoT endpoint URL
   - Port 8883 accessible

3. **Test with MQTT client**
   ```bash
   mosquitto_pub -h a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com \
     -p 8883 \
     --cafile root-CA.crt \
     --cert device.pem.crt \
     --key private.pem.key \
     -t "visiondrive/parking/test/test/status" \
     -m '{"deviceId":"test","status":"vacant"}'
   ```

---

## Maintenance Schedule

| Task | Frequency |
|------|-----------|
| Visual inspection | Monthly |
| Battery check | Quarterly |
| Calibration verification | Quarterly |
| Firmware update | As released |
| Surface cleaning | As needed |

---

## Support

For sensor hardware issues, contact the manufacturer.
For system integration issues, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
