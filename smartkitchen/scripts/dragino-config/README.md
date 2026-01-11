# Dragino PS-NB-GE Configuration Scripts

## Quick Start

### Single Sensor Configuration

```bash
# Make script executable
chmod +x configure-sensor.sh

# Generate config for a single sensor
./configure-sensor.sh sensor-001 kitchen-001 "Walk-in Fridge"

# With custom AWS endpoint
AWS_IOT_ENDPOINT=your-endpoint.iot.me-central-1.amazonaws.com \
  ./configure-sensor.sh sensor-001 kitchen-001 "Walk-in Fridge"
```

### Bulk Configuration

```bash
# Make script executable
chmod +x bulk-configure.sh

# Create sensors.csv with your sensor details
# Then run:
./bulk-configure.sh sensors.csv ./output

# This creates individual config files for each sensor
```

## sensors.csv Format

```csv
sensor_id,kitchen_id,location,probe_type,interval_minutes
sensor-001,kitchen-001,Walk-in Fridge,fridge,5
sensor-002,kitchen-001,Freezer,freezer,5
sensor-003,kitchen-002,Main Fridge,fridge,10
```

### Probe Types

| Type | Temperature Range | Use Case |
|------|------------------|----------|
| `fridge` | 0°C to 10°C | Standard refrigerators |
| `freezer` | -30°C to 0°C | Freezers, cold storage |
| `general` | -40°C to 85°C | General purpose |

## Connecting to Sensor

### Via Bluetooth (Recommended)

1. Download **Dragino BLE Config App**
   - [iOS App Store](https://apps.apple.com/app/dragino-ble-config)
   - [Google Play Store](https://play.google.com/store/apps/details?id=com.dragino.bleconfig)

2. Power on the sensor (press button)

3. Open app and scan for devices

4. Connect to your PS-NB-GE

5. Enter password from device label: `AT+PIN=xxxxxx`

6. Paste configuration commands

### Via UART

1. Connect USB-UART adapter to sensor (115200 baud, 8N1)

2. Open terminal (screen, minicom, etc.)
   ```bash
   screen /dev/tty.usbserial-XXXX 115200
   ```

3. Enter password and paste commands

## Verification Commands

After configuration, verify with:

```
# Print all settings
AT+CFG

# Check signal strength (should be > 10)
AT+CSQ

# Test sensor reading
AT+GETSENSORVALUE=0

# Force transmission
AT+SEND

# Check last uploaded data
AT+LDATA
```

## Troubleshooting

### No Network Connection

```bash
# Check APN
AT+APN?

# Try alternative APNs
AT+APN=internet
AT+APN=du.iot

# Check signal
AT+CSQ
# If < 5, relocate sensor for better coverage
```

### MQTT Connection Failed

```bash
# Verify endpoint
AT+SERVADDR?

# Check TLS mode
AT+TLSMOD?
# Should be 1

# Verify client ID is unique
AT+CLIENT?
```

### No Sensor Reading

```bash
# Check probe config
AT+PROBE?

# Verify power output time
AT+5VT?

# Test reading
AT+GETSENSORVALUE=0
# If 0 or very low, check probe wiring
```

## Factory Reset

If needed, reset all settings:

```bash
AT+FDR
```

Then reconfigure from scratch.

## Reference

- [Dragino PS-NB-NA Manual](https://wiki.dragino.com/xwiki/bin/view/Main/User%20Manual%20for%20LoRaWAN%20End%20Nodes/PS-NB-NA_NB-IoT_Analog_Sensor_User_Manual/)
- [du IoT Services](https://www.du.ae/business/iot)
- [AWS IoT Core](https://docs.aws.amazon.com/iot/)
