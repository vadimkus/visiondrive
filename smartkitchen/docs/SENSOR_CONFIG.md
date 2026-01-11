# Dragino PS-NB-GE Sensor Configuration

## Complete Configuration Guide for VisionDrive Smart Kitchen

---

## 1. Hardware Overview

### Dragino PS-NB-GE Specifications

| Feature | Specification |
|---------|--------------|
| **Model** | PS-NB-GE (General Edition) |
| **Connectivity** | NB-IoT (Narrowband IoT) |
| **Bands** | B1/B2/B3/B4/B5/B8/B12/B13/B17/B18/B19/B20/B25/B28/B66/B70/B85 |
| **Protocols** | MQTT, MQTTs, UDP, TCP, CoAP |
| **Analog Input** | 0-20mA (current), 0-30V (voltage) |
| **Power Output** | 5V and 12V for external sensors |
| **Battery** | 8500mAh Li-SOCI2 (years of operation) |
| **Configuration** | BLE (Bluetooth 5.1) or UART |
| **Enclosure** | IP66 Waterproof |
| **Operating Temp** | -40°C to +85°C |

### SIM Card: du (UAE)

| Setting | Value |
|---------|-------|
| **Carrier** | du (Emirates Integrated Telecommunications) |
| **Network** | NB-IoT |
| **APN** | `du` or `internet` (verify with du) |
| **SIM Type** | Nano SIM |

---

## 2. Initial Setup

### 2.1 Insert SIM Card

1. Open the PS-NB-GE enclosure
2. Locate the nano SIM slot (see manual for direction)
3. Insert du SIM card with contacts facing down
4. Close enclosure securely

### 2.2 Connect via Bluetooth

**Option A: Dragino BLE Config App (Recommended)**

1. Download app from App Store or Google Play
2. Enable Bluetooth on your phone
3. Power on PS-NB-GE (press button)
4. Open app and scan for devices
5. Select your device (PS-NB-GE-xxxxx)
6. Enter password from device label: `AT+PIN=xxxxxx`

**Option B: UART Connection**

1. Connect USB-UART adapter to sensor
2. Open terminal (115200 baud, 8N1)
3. Enter password

---

## 3. Complete AT Command Configuration

### 3.1 Network Configuration

```bash
# ============================================
# NETWORK SETTINGS
# ============================================

# Set du APN
AT+APN=du

# Alternative APNs (if du doesn't work):
# AT+APN=internet
# AT+APN=du.iot

# Check current APN
AT+APN?

# Set network join timeout (seconds)
AT+CSQTIME=120
```

### 3.2 MQTT Configuration

```bash
# ============================================
# MQTT SETTINGS FOR AWS IOT CORE
# ============================================

# Set protocol to MQTTs (TLS encrypted MQTT)
AT+PRO=3
# Options:
# 0 = UDP
# 1 = MQTT
# 2 = TCP
# 3 = MQTTs (recommended for AWS)
# 4 = CoAP

# Set AWS IoT Core endpoint
# Replace xxxxxx with your actual endpoint
AT+SERVADDR=xxxxxx-ats.iot.me-central-1.amazonaws.com,8883

# Set MQTT Client ID (must be unique per device)
AT+CLIENT=visiondrive-sensor-001

# Set MQTT Publish Topic
AT+PUBTOPIC=visiondrive/kitchen-001/sensor-001/temperature

# Set MQTT Subscribe Topic (for receiving commands)
AT+SUBTOPIC=visiondrive/kitchen-001/sensor-001/commands

# Enable TLS mode (required for AWS IoT)
AT+TLSMOD=1
# 0 = No TLS
# 1 = TLS enabled (required for MQTTs)

# Set MQTT Username (if using custom auth)
# AT+UNAME=your-username

# Set MQTT Password (if using custom auth)
# AT+PWD=your-password
```

### 3.3 Transmission Settings

```bash
# ============================================
# DATA TRANSMISSION SETTINGS
# ============================================

# Set transmission interval (milliseconds)
# 300000 = 5 minutes
# 600000 = 10 minutes
# 900000 = 15 minutes
AT+TDC=300000

# Set payload format to JSON
AT+PAYLOADTYPE=5
# 0 = HEX format
# 1 = ThingSpeak format
# 3 = ThingsBoard format
# 5 = JSON format (recommended)

# Set number of uplinks per transmission
AT+NOUD=1

# Extend sending/receiving time (ms)
AT+RXDL=3000
```

### 3.4 Temperature Probe Configuration

```bash
# ============================================
# TEMPERATURE PROBE SETTINGS
# ============================================

# Set probe model
AT+PROBE=1
# 0 = No probe (use internal ADC)
# 1 = 4-20mA probe
# 2 = 0-5V probe
# 3 = 0-10V probe

# Set 5V power output duration (ms)
# Time to power the temperature probe before reading
AT+5VT=2000

# Set 12V power output duration (ms)
# Use if your probe needs 12V
AT+12VT=2000

# Set 3.3V power output duration (ms)
AT+3V3T=1000

# Test sensor reading
AT+GETSENSORVALUE=0
```

### 3.5 Alert Thresholds (Report on Change)

```bash
# ============================================
# REPORT ON CHANGE (ALERT THRESHOLDS)
# ============================================

# Enable Report on Change feature
# Format: AT+ROC=mode,interval,current_threshold,voltage_threshold
# 
# mode: 0=OFF, 1=Mode1, 2=Mode2
# interval: check interval in seconds
# current_threshold: μA (3000 = 3mA)
# voltage_threshold: mV (500 = 0.5V)

# Check every 60 seconds, alert if current changes by 3mA
AT+ROC=1,60,3000,0

# Example: Alert if temperature changes significantly
# (3mA change ≈ several degrees with typical probe)
AT+ROC=1,60,2000,0
```

---

## 4. Configuration for Each Kitchen Location

### Template for Multiple Sensors

| Sensor ID | Kitchen | Location | Client ID | Topic |
|-----------|---------|----------|-----------|-------|
| sensor-001 | kitchen-001 | Walk-in Fridge | visiondrive-sensor-001 | visiondrive/kitchen-001/sensor-001/temperature |
| sensor-002 | kitchen-001 | Freezer | visiondrive-sensor-002 | visiondrive/kitchen-001/sensor-002/temperature |
| sensor-003 | kitchen-002 | Main Fridge | visiondrive-sensor-003 | visiondrive/kitchen-002/sensor-003/temperature |

### Per-Sensor Configuration Script

```bash
# ============================================
# SENSOR: sensor-001
# LOCATION: Kitchen 1 - Walk-in Fridge
# ============================================

AT+APN=du
AT+PRO=3
AT+SERVADDR=xxxxxx-ats.iot.me-central-1.amazonaws.com,8883
AT+CLIENT=visiondrive-sensor-001
AT+PUBTOPIC=visiondrive/kitchen-001/sensor-001/temperature
AT+SUBTOPIC=visiondrive/kitchen-001/sensor-001/commands
AT+TLSMOD=1
AT+TDC=300000
AT+PAYLOADTYPE=5
AT+PROBE=1
AT+5VT=2000
AT+ROC=1,60,2000,0

# Save and verify
AT+CFG
```

---

## 5. Expected Payload Format

### JSON Payload (Type 5)

```json
{
  "mod": "PS-NB",
  "Battery": 3.52,
  "IDC_mA": 12.5,
  "VDC_V": 0.0,
  "IDC_AD": 2048,
  "VDC_AD": 0
}
```

### Field Descriptions

| Field | Description | Unit |
|-------|-------------|------|
| `mod` | Module model | - |
| `Battery` | Battery voltage | Volts |
| `IDC_mA` | Current input (temperature probe) | mA |
| `VDC_V` | Voltage input | Volts |
| `IDC_AD` | Raw ADC value for current | - |
| `VDC_AD` | Raw ADC value for voltage | - |

---

## 6. Temperature Conversion

### 4-20mA to Temperature Mapping

Most industrial temperature probes use 4-20mA output:

| mA Value | Typical Range | Notes |
|----------|---------------|-------|
| 4 mA | Minimum temp | Probe-specific |
| 12 mA | Midpoint | - |
| 20 mA | Maximum temp | Probe-specific |

### Common Probe Configurations

**For Kitchen Fridge Monitoring (0-20°C range):**
```javascript
// 4mA = 0°C, 20mA = 20°C
const temp = (mA - 4) / (20 - 4) * 20;
```

**For Walk-in Freezer (-30 to 0°C range):**
```javascript
// 4mA = -30°C, 20mA = 0°C
const temp = -30 + (mA - 4) / (20 - 4) * 30;
```

**For General Purpose (-40 to 85°C range):**
```javascript
// 4mA = -40°C, 20mA = 85°C
const temp = -40 + (mA - 4) / (20 - 4) * 125;
```

---

## 7. Verification & Testing

### 7.1 Check Configuration

```bash
# Print all configuration
AT+CFG

# Check last uploaded data
AT+LDATA

# Get current sensor value
AT+GETSENSORVALUE=0

# Check signal quality
AT+CSQ
# Response: CSQ:xx,yy
# xx = signal strength (0-31, higher is better, >10 is OK)
# yy = bit error rate
```

### 7.2 Force Transmission

```bash
# Send data immediately
AT+SEND

# Or press the physical button on the device
```

### 7.3 Check Connection Status

```bash
# Check module information
AT+MODEL

# Check sleep status
AT+SLEEP
# 0 = awake
# 1 = sleep mode
```

---

## 8. Troubleshooting

### Problem: No Network Connection

```bash
# Check APN
AT+APN?

# Try alternative APNs
AT+APN=internet
# or
AT+APN=du.iot

# Check signal
AT+CSQ
# If CSQ < 5, move sensor to better location

# Reset and retry
ATZ
```

### Problem: MQTT Connection Failed

```bash
# Verify endpoint
AT+SERVADDR?

# Check TLS mode
AT+TLSMOD?
# Should be 1 for AWS

# Check client ID
AT+CLIENT?
# Must be unique
```

### Problem: No Sensor Reading

```bash
# Check probe setting
AT+PROBE?

# Verify power output
AT+5VT?

# Test reading
AT+GETSENSORVALUE=0
# If IDC_mA shows 0 or very low, check probe wiring
```

### Problem: Battery Draining Fast

```bash
# Increase transmission interval
AT+TDC=600000  # 10 minutes

# Reduce power output time
AT+5VT=1000    # 1 second

# Disable Report on Change
AT+ROC=0,0,0,0
```

---

## 9. Factory Reset

If needed, reset to factory defaults:

```bash
AT+FDR

# Then reconfigure all settings
```

---

## 10. Reference: All AT Commands

| Command | Description |
|---------|-------------|
| `AT+APN` | Get/set APN |
| `AT+PRO` | Get/set protocol (MQTT/UDP/etc) |
| `AT+SERVADDR` | Get/set server address |
| `AT+CLIENT` | Get/set MQTT client ID |
| `AT+PUBTOPIC` | Get/set MQTT publish topic |
| `AT+SUBTOPIC` | Get/set MQTT subscribe topic |
| `AT+UNAME` | Get/set MQTT username |
| `AT+PWD` | Get/set MQTT password |
| `AT+TLSMOD` | Get/set TLS mode |
| `AT+TDC` | Get/set transmission interval |
| `AT+PAYLOADTYPE` | Get/set payload format |
| `AT+PROBE` | Get/set probe model |
| `AT+5VT` | Get/set 5V power duration |
| `AT+12VT` | Get/set 12V power duration |
| `AT+ROC` | Get/set Report on Change |
| `AT+CFG` | Print all config |
| `AT+LDATA` | Get last uploaded data |
| `AT+GETSENSORVALUE` | Get current sensor reading |
| `AT+CSQ` | Get signal quality |
| `AT+SEND` | Force send data |
| `ATZ` | Reset MCU |
| `AT+FDR` | Factory reset |

---

## Documentation References

- [Dragino PS-NB-NA User Manual](https://wiki.dragino.com/xwiki/bin/view/Main/User%20Manual%20for%20LoRaWAN%20End%20Nodes/PS-NB-NA_NB-IoT_Analog_Sensor_User_Manual/)
- [du IoT Solutions](https://www.du.ae/business/iot)
- [AWS IoT Core Documentation](https://docs.aws.amazon.com/iot/)
