# SWI PSL01B Parking Sensor Configuration

## Sensor Overview

The SWI PSL01B is an NB-IoT smart parking sensor with:
- **Dual Detection**: Geomagnetic + 24GHz Microwave Radar
- **99% Accuracy**: Dual-mode complementary design
- **IP68 Protection**: Waterproof and dustproof
- **5+ Year Battery**: 27Ah lithium battery
- **NB-IoT**: B1/B3/B5/B8 bands

## Configuration Steps

### 1. Physical Installation

1. Select parking bay location
2. Mark sensor position (center of bay)
3. Drill mounting holes (bolt fixation)
4. Install sensor flush with road surface
5. Verify sensor LED indicators

### 2. SIM Card Setup (du)

1. Insert du NB-IoT SIM card
2. Verify SIM activation with du
3. Note IMEI for registration

### 3. Network Configuration

Contact SWI IoT for sensor configuration tool access:
- **Email**: jimmy@swiott.com
- **Phone**: +86-13809887645

Typical configuration parameters:

| Parameter | Value |
|-----------|-------|
| **APN** | `du` or `du.iot` |
| **Server** | AWS IoT Core endpoint |
| **Port** | 8883 (MQTTs) |
| **Protocol** | MQTT with TLS |
| **Report Interval** | 30 seconds (configurable) |

### 4. AWS IoT Configuration

```bash
# Register sensor as IoT Thing
aws iot create-thing \
  --thing-name PSL01B-{IMEI} \
  --thing-type-name ParkingSensor \
  --attribute-payload "attributes={zone=zone-001,bay=1}" \
  --region me-central-1

# Create and attach certificate
aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile sensor-{IMEI}.crt \
  --private-key-outfile sensor-{IMEI}.key \
  --region me-central-1
```

### 5. Topic Structure

```
visiondrive/parking/{zoneId}/{bayNumber}/status
```

Example:
```
visiondrive/parking/zone-001/1/status
```

### 6. Expected Payload

```json
{
  "deviceId": "PSL01B-123456789",
  "status": "occupied",
  "battery": 95,
  "signal": -72,
  "mode": "dual",
  "ts": 1736678400000
}
```

| Field | Type | Description |
|-------|------|-------------|
| `deviceId` | string | Sensor IMEI/ID |
| `status` | string | "occupied" or "vacant" |
| `battery` | number | Battery percentage (0-100) |
| `signal` | number | Signal strength in dBm |
| `mode` | string | Detection mode used |
| `ts` | number | Unix timestamp (ms) |

## Troubleshooting

### No Network Connection

1. Check SIM card insertion
2. Verify du APN settings
3. Check signal strength in area
4. Contact du NB-IoT support

### No Data Received in AWS

1. Verify IoT Thing is registered
2. Check certificate is attached
3. Verify topic format matches rule
4. Check CloudWatch logs for errors

### Incorrect Detection

1. Check sensor alignment
2. Verify no metal objects nearby
3. Test with known vehicle
4. Contact SWI support

## Sensor Fleet Registration Script

See `register-sensors.ts` for bulk registration of sensors.

```bash
# Install dependencies
npm install

# Register sensors from CSV
npx tsx register-sensors.ts sensors.csv
```

## Support Contacts

| Contact | Purpose |
|---------|---------|
| SWI IoT (jimmy@swiott.com) | Hardware, firmware |
| du Business IoT | Network, SIM |
| AWS Support | IoT Core, cloud |
