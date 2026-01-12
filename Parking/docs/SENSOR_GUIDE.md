# PSL01B Parking Sensor Configuration Guide

## Sensor Overview

The **PSL01B-NBIoT** (SWIOTT) is a smart parking sensor that detects vehicle presence using dual-mode detection (geomagnetic + radar).

### Specifications

| Property | Value |
|----------|-------|
| Model | PSL01B-NBIoT |
| Manufacturer | SWIOTT |
| Detection | Geomagnetic + Microwave Radar (dual mode) |
| Protocol | NB-IoT / LoRaWAN |
| Network | du (UAE) |
| Battery | 3.6V Lithium (5+ years) |
| IP Rating | IP68 (waterproof) |
| Operating Temp | -40°C to +85°C |
| Dimensions | Ø120mm × 45mm |
| Config App | SWIOTT Sensor Tool (Bluetooth) |

### Detection Modes

| Mode | Description | Battery Life |
|------|-------------|--------------|
| **Radar + Magnetic** | Full dual-mode detection (recommended) | Standard |
| **Magnetic Only** | Radar in SLEEP mode for max battery | Extended |

---

## SWIOTT Sensor Tool App

The **SWIOTT Sensor Tool** is the official mobile app for configuring sensors via Bluetooth.

### App Features

| Tab | Purpose |
|-----|---------|
| **STATUS** | Real-time monitoring dashboard |
| **CONFIG** | Sensor and network configuration |
| **LOGS** | Debug terminal with AT commands |

### Connecting to Sensor

1. **Enable Bluetooth** on your phone
2. **Wake the sensor** - Use a strong magnet on the reed switch if sensor is asleep
3. **Tap [Connect Device]** in the app
4. **Select sensor** from list (identified by 16-character Hex ID)
5. Wait for "Connected" status

### Status Dashboard

The STATUS tab shows real-time sensor data:

| Metric | Description |
|--------|-------------|
| **Occupancy** | OCCUPIED (red) / VACANT (green) |
| **Battery** | Remaining power % (red if <20%) |
| **Temp** | Internal hardware temperature |
| **Distance** | Radar measured distance (cm) |
| **Mag X/Y/Z** | Three-axis magnetic field values |
| **Water Cover** | Detects water/snow on surface |
| **RSSI** | Bluetooth signal strength |

### Actions

| Button | Function |
|--------|----------|
| **Calibrate Radar** | Recalibrate radar (needs 2m clear radius, ~20 sec) |
| **Device Reboot** | Restart sensor (reconnect Bluetooth after) |

---

## Sensor Configuration (CONFIG Tab)

### Radar & General Settings

| Setting | Options | Description |
|---------|---------|-------------|
| **Radar Module** | ENABLED / SLEEP | Enable dual-mode or magnetic-only |
| **Mounting Type** | Horizontal / Vertical | Surface mount or underground |
| **Detect Range** | 0-500 cm | Distance threshold to filter interference |

### Network Configuration

Switch between LoRaWAN and NB-IoT tabs.

⚠️ **Note:** Device must be restarted after changing network settings.

---

## NB-IoT Configuration (du Network)

### du SIM Settings

| Setting | Value |
|---------|-------|
| APN | du |
| Network | NB-IoT (Band 20) |
| Region | UAE |

---

## NB-IoT MQTT Configuration (via App)

Configure these settings in the **CONFIG → NB-IoT** tab:

### MQTT Broker Settings

| Setting | Value |
|---------|-------|
| **APN** | `du` |
| **MQTT Host** | `a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com` |
| **MQTT Port** | `8883` |
| **Timeout** | `60` |
| **Username** | `swiott01` |
| **Password** | `Demolition999` |
| **SSL** | ENABLED ✓ |

### Screenshot Reference

```
┌─────────────────────────────────────────────────────────────┐
│  MQTT BROKER                                     SSL 🔒     │
├─────────────────────────────────────────────────────────────┤
│  a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com         │
├────────────────────────────┬────────────────────────────────┤
│  8883                      │  60                            │
├────────────────────────────┼────────────────────────────────┤
│  swiott01                  │  ••••••••••••                  │
├────────────────────────────┴────────────────────────────────┤
│  SSL CONNECTION                                             │
│  ┌──────────────┐  ┌──────────────────────────────────────┐ │
│  │   DISABLED   │  │           ENABLED (✓)                │ │
│  └──────────────┘  └──────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     [ UPDATE MQTT ]                         │
└─────────────────────────────────────────────────────────────┘
```

⚠️ **Important:** All sensors use the same credentials for simplicity.

### Topic Configuration

| Setting | Value |
|---------|-------|
| **Publish Topic** | `visiondrive/parking/{zoneId}/{bayId}/status` |

Example: `visiondrive/parking/zone-001/A-001/status`

---

## AWS IoT Core Configuration

### Authentication Method

VisionDrive uses **Custom Authorizer** for username/password MQTT authentication:

| Component | Value |
|-----------|-------|
| **Authorizer Name** | `VisionDriveParkingAuthorizer` |
| **Auth Type** | Username/Password |
| **Username** | `swiott01` |
| **Password** | `Demolition999` |

### How Authentication Works

```
┌─────────────┐     MQTT + Username/Password      ┌──────────────────┐
│   SWIOTT    │────────────────────────────────────▶│  AWS IoT Core    │
│   Sensor    │    Username: swiott01               │                  │
└─────────────┘    Password: ********               │  ┌────────────┐  │
                                                    │  │  Custom    │  │
                                                    │  │ Authorizer │  │
                                                    │  │  (Lambda)  │  │
                                                    │  └─────┬──────┘  │
                                                    │        │         │
                                                    │        ▼         │
                                                    │  ✓ Validate      │
                                                    │  ✓ Return Policy │
                                                    └──────────────────┘
```

### MQTT Configuration

| Setting | Value |
|---------|-------|
| Endpoint | `a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com` |
| Port | 8883 (MQTTS) |
| Protocol | MQTT 3.1.1 |
| Authentication | Username/Password via Custom Authorizer |
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

### Radar Calibration (via SWIOTT App)

The radar sensor requires calibration for accurate distance measurement.

**Calibration Steps:**

1. **Connect** to sensor via Bluetooth using SWIOTT Sensor Tool
2. **Clear the area** - Ensure NO objects within **2-meter radius**
3. **Ensure bay is empty** - No vehicle present
4. **Tap [Calibrate Radar]** in the STATUS tab
5. **Wait ~20 seconds** for calibration to complete
6. **Verify** - Check distance reading stabilizes

⚠️ **Important:** 
- The sensor area must be completely clear during calibration
- Do not move the sensor during the 20-second process
- Calibrate in dry weather conditions

### When to Recalibrate

Recalibrate if:
- Detection accuracy drops
- Sensor shows "Radar Invalid" error
- Sensor was physically moved
- Surface is blocked by mud/ice (clean first)
- Ground conditions changed significantly
- After battery replacement
- Mounting orientation changed

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

### Quick Reference (from SWIOTT Manual)

| Symptom | Indicator | Solution |
|---------|-----------|----------|
| Connection Failed | Can't pair via Bluetooth | Use strong magnet to trigger "Wake up" reed switch |
| Radar Invalid | Detection errors | Clean sensor surface, perform [Calibrate Radar] |
| Low Signal | Poor connectivity | Move closer or check NB-IoT SIM in CONFIG tab |

### Sensor Not Reporting

1. **Wake the sensor**
   - Use a strong magnet on the reed switch to wake from sleep mode
   - Connect via Bluetooth to verify it's alive

2. **Check network coverage**
   - Ensure NB-IoT signal in area (du network)
   - Check RSSI in STATUS tab
   - Check for RF interference

3. **Verify NB-IoT config** (via SWIOTT App)
   - Open CONFIG → NB-IoT tab
   - Verify APN is set to `du`
   - Check MQTT broker settings
   - Ensure SSL is ENABLED

4. **Verify registration in backend**
   ```bash
   curl https://API_URL/sensors/SENSOR_ID
   ```

5. **Check AWS IoT Core**
   - Verify thing exists
   - Check certificate validity
   - Review IoT logs

### Incorrect Detection

1. **Clean the sensor surface**
   - Remove mud, ice, or debris
   - Water/snow cover affects detection

2. **Recalibrate radar**
   - Use SWIOTT App → STATUS → [Calibrate Radar]
   - Ensure 2m clear radius
   - Wait 20 seconds

3. **Check mounting type**
   - Verify Horizontal/Vertical setting matches physical installation

4. **Adjust detect range**
   - CONFIG → Detect Range (cm)
   - Filter out overhead interference

5. **Check for metal interference**
   - Remove nearby metal objects
   - Check underground utilities

6. **Verify installation**
   - Sensor should be flush with surface
   - Center of parking bay

### Connectivity Issues

1. **Check APN settings** (via App)
   - APN should be `du`
   - Restart device after changes

2. **Verify MQTT settings**
   - Host: `a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com`
   - Port: `8883`
   - SSL: Enabled

3. **Check SIM status**
   - Verify du SIM is active
   - Check data plan

4. **Reboot device**
   - Use [Device Reboot] in STATUS tab
   - Reconnect Bluetooth after restart

5. **Use LOGS tab for debugging**
   - View AT commands sent/received
   - Blue: Commands sent by app
   - Green: Responses from sensor

### Debug with AT Commands

Use the LOGS tab in SWIOTT App to send custom AT commands:

```
> AT+STATUS       # Query sensor status
> AT+BATTERY      # Check battery level
> AT+SIGNAL       # Check NB-IoT signal
> AT+REBOOT       # Restart sensor
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
