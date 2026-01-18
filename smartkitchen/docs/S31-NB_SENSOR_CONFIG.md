# Dragino S31-NB/S31B-NB Temperature & Humidity Sensor Configuration

## VisionDrive Smart Kitchen - Kitchen Environment Monitoring

---

## 1. Hardware Overview

### S31-NB vs S31B-NB

| Feature | S31-NB | S31B-NB |
|---------|--------|---------|
| **Sensor Probe** | External 3m SHT31 probe | Internal SHT31 sensor |
| **Use Case** | Remote monitoring (probe in fridge) | Ambient room monitoring |
| **Measure Range** | -40°C to +80°C | -40°C to +80°C |
| **Humidity Range** | 0-100% RH | 0-100% RH |

### Key Specifications

| Feature | Specification |
|---------|--------------|
| **Model** | S31-NB-GE / S31B-NB-GE (General Edition) |
| **Connectivity** | NB-IoT (Narrowband IoT) |
| **Bands** | B1/B2/B3/B4/B5/B8/B12/B13/B17/B18/B19/B20/B25/B28/B66/B70/B85 |
| **Protocols** | MQTT, MQTTs, UDP, TCP, CoAP |
| **Sensor** | Sensirion SHT31 (calibrated, linearized) |
| **Accuracy** | ±0.3°C (typical), ±2% RH |
| **Battery** | 8500mAh Li-SOCI2 (years of operation) |
| **Configuration** | BLE (Bluetooth 5.1) or UART |
| **Enclosure** | IP66 Waterproof |

### SIM Card: du (UAE)

| Setting | Value |
|---------|-------|
| **Carrier** | du (Emirates Integrated Telecommunications) |
| **Network** | NB-IoT |
| **APN** | `du` (primary) or `internet` (alternative) |
| **SIM Type** | Nano SIM |

---

## 2. Initial Setup

### 2.1 SIM Card Installation ✓

> You mentioned SIM is already installed and password is correct.

### 2.2 Connect via Bluetooth (Recommended)

1. Download **Dragino BLE Config App**
   - [iOS App Store](https://apps.apple.com/app/dragino-ble-config)
   - [Google Play Store](https://play.google.com/store/apps/details?id=com.dragino.bleconfig)

2. Power on S31-NB (press button - LED should blink)

3. Open app and scan for devices

4. Select your device (S31-NB-xxxxx)

5. Enter password from device label: `AT+PIN=xxxxxx` (6 digits)

### 2.3 Alternative: UART Connection

1. Connect USB-UART adapter to sensor (115200 baud, 8N1)
2. Open terminal application
3. Enter password

---

## 3. Complete AT Command Configuration

### 3.1 Step 1: Network Configuration (du SIM)

```bash
# ============================================
# NETWORK SETTINGS FOR du SIM
# ============================================

# Set du APN
AT+APN=du

# If "du" doesn't work, try alternatives:
# AT+APN=internet
# AT+APN=du.iot

# Set network join timeout (120 seconds recommended)
AT+CSQTIME=120

# Check current APN
AT+APN=?
```

### 3.2 Step 2: Server Configuration

**Option A: AWS IoT Core (Recommended for VisionDrive)**

```bash
# ============================================
# MQTT SETTINGS FOR AWS IOT CORE
# ============================================

# Set protocol to MQTTs (TLS encrypted MQTT)
AT+PRO=3
# Options: 1=CoAP, 2=UDP, 3=MQTT, 4=TCP

# Set AWS IoT Core endpoint
AT+SERVADDR=a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com,8883

# Set unique MQTT Client ID
AT+CLIENT=visiondrive-s31-kitchen-001

# Set MQTT Publish Topic
AT+PUBTOPIC=visiondrive/kitchen-001/s31-001/environment

# Set MQTT Subscribe Topic (for commands)
AT+SUBTOPIC=visiondrive/kitchen-001/s31-001/commands

# Enable TLS mode (required for AWS IoT)
AT+TLSMOD=1
# 0 = No TLS
# 1 = TLS enabled

# Set QoS level
AT+MQOS=1
# 0 = At most once
# 1 = At least once (recommended)
```

**Option B: Simple UDP Server (for testing)**

```bash
# ============================================
# UDP SETTINGS (SIMPLER, NO TLS)
# ============================================

AT+PRO=2
AT+SERVADDR=your-server-ip,8000
```

### 3.3 Step 3: Transmission Settings

```bash
# ============================================
# DATA TRANSMISSION SETTINGS
# ============================================

# Set transmission interval in SECONDS (not milliseconds!)
# 300 = 5 minutes (recommended for kitchen monitoring)
# 600 = 10 minutes (battery saving)
# 900 = 15 minutes
AT+TDC=300

# Set payload format to General JSON (recommended)
AT+PAYLOADTYPE=5
# Options:
# 0 = HEX format
# 1 = ThingSpeak format
# 3 = ThingsBoard format
# 5 = General JSON format (recommended)

# Extend receiving time (milliseconds)
AT+RXDL=3000
```

### 3.4 Step 4: Temperature & Humidity Alarms (Optional)

```bash
# ============================================
# TEMPERATURE ALARM SETTINGS
# ============================================

# Format: AT+SHTEMP=<enable>,<low_threshold>,<high_threshold>
# Enable alarm, low=-10°C, high=40°C
AT+SHTEMP=1,-10,40

# For Walk-in Fridge (0-8°C normal)
AT+SHTEMP=1,-2,10

# For Freezer (-25 to -15°C normal)
AT+SHTEMP=1,-30,-10

# For Kitchen ambient (18-28°C normal)
AT+SHTEMP=1,15,35

# Disable temperature alarm
AT+SHTEMP=0,0,0

# ============================================
# HUMIDITY ALARM SETTINGS
# ============================================

# Format: AT+SHHUM=<enable>,<low_threshold>,<high_threshold>
# Enable alarm, low=20%, high=80%
AT+SHHUM=1,20,80

# Disable humidity alarm
AT+SHHUM=0,0,0
```

### 3.5 Step 5: Verify Configuration

```bash
# ============================================
# VERIFICATION COMMANDS
# ============================================

# Print ALL configuration
AT+CFG

# Check current sensor reading
AT+GETSENSORVALUE=0

# Check signal quality
# Response: CSQ:xx,yy (xx > 10 is good)
AT+CSQ

# Check last uploaded data
AT+LDATA

# Get device ID
AT+DEUI=?

# Check module information
AT+MODEL
```

---

## 4. Complete Configuration Script

Copy and paste all commands at once (one command per line):

```bash
# ============================================
# VISIONDRIVE KITCHEN S31-NB CONFIGURATION
# Sensor: Kitchen Environment Monitor
# ============================================

# Network (du SIM)
AT+APN=du
AT+CSQTIME=120

# Protocol: MQTTs
AT+PRO=3
AT+TLSMOD=1

# Server: AWS IoT Core
AT+SERVADDR=a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com,8883

# MQTT Settings (customize sensor ID and kitchen ID)
AT+CLIENT=visiondrive-s31-kitchen-001
AT+PUBTOPIC=visiondrive/kitchen-001/s31-001/environment
AT+SUBTOPIC=visiondrive/kitchen-001/s31-001/commands
AT+MQOS=1

# Transmission: Every 5 minutes, JSON format
AT+TDC=300
AT+PAYLOADTYPE=5
AT+RXDL=3000

# Alerts: Kitchen ambient (15-35°C, 20-80% humidity)
AT+SHTEMP=1,15,35
AT+SHHUM=1,20,80

# Verify
AT+CFG
AT+GETSENSORVALUE=0
```

---

## 5. Expected Payload Format

### JSON Payload (Type 5)

The S31-NB sends data in this format:

```json
{
  "mod": "S31-NB",
  "Battery": 3.52,
  "Temperature": 24.5,
  "Humidity": 62.3
}
```

### Field Descriptions

| Field | Description | Unit |
|-------|-------------|------|
| `mod` | Module model | - |
| `Battery` | Battery voltage | Volts |
| `Temperature` | Temperature reading | °C |
| `Humidity` | Relative humidity | % |

---

## 6. Testing & Verification

### 6.1 Check Signal Strength

```bash
AT+CSQ
```

Response interpretation:
- `CSQ:0-5` = Poor signal (relocate sensor)
- `CSQ:6-10` = Marginal
- `CSQ:11-20` = Good
- `CSQ:21-31` = Excellent

### 6.2 Test Sensor Reading

```bash
AT+GETSENSORVALUE=0
```

Should return current temperature and humidity.

### 6.3 Force Transmission

```bash
# Send data immediately
AT+SEND

# Or press the physical button on the device
```

### 6.4 Check Last Upload

```bash
AT+LDATA
```

---

## 7. Troubleshooting

### Problem: No Network Connection

```bash
# Check APN setting
AT+APN=?

# Try alternative APNs
AT+APN=internet
# or
AT+APN=du.iot

# Check signal
AT+CSQ
# If < 5, move sensor to better location

# Reset and retry
ATZ
```

### Problem: MQTT Connection Failed

```bash
# Verify server address
AT+SERVADDR=?

# Check TLS mode (should be 1 for AWS)
AT+TLSMOD=?

# Check client ID (must be unique)
AT+CLIENT=?

# Verify protocol is MQTTs
AT+PRO=?
```

### Problem: No Sensor Reading

```bash
# Test sensor
AT+GETSENSORVALUE=0

# If shows 0 or error, sensor probe may be damaged
# Check probe cable connection (S31-NB only)
```

### Problem: Battery Draining Fast

```bash
# Increase transmission interval to 10 minutes
AT+TDC=600

# Or 15 minutes
AT+TDC=900

# Disable unnecessary alarms
AT+SHTEMP=0,0,0
AT+SHHUM=0,0,0
```

---

## 8. Factory Reset

If you need to start over:

```bash
# Reset all parameters (keeps password)
AT+FDR1

# Full factory reset (resets password too)
AT+FDR
```

---

## 9. AT Commands Quick Reference

### General Commands

| Command | Description |
|---------|-------------|
| `AT+CFG` | Print all configuration |
| `AT+MODEL` | Get module information |
| `ATZ` | Reset MCU |
| `AT+DEUI` | Get/set device ID |
| `AT+FDR` | Factory reset |
| `AT+FDR1` | Reset except password |
| `AT+PWORD` | Get/set password |

### Network Commands

| Command | Description |
|---------|-------------|
| `AT+APN` | Get/set APN |
| `AT+CSQTIME` | Get/set network join timeout |
| `AT+CSQ` | Check signal quality |

### Protocol Commands

| Command | Description |
|---------|-------------|
| `AT+PRO` | Get/set protocol (1:CoAP, 2:UDP, 3:MQTT, 4:TCP) |
| `AT+SERVADDR` | Get/set server address |
| `AT+TLSMOD` | Get/set TLS mode |

### MQTT Commands

| Command | Description |
|---------|-------------|
| `AT+CLIENT` | Get/set MQTT client ID |
| `AT+PUBTOPIC` | Get/set publish topic |
| `AT+SUBTOPIC` | Get/set subscribe topic |
| `AT+UNAME` | Get/set MQTT username |
| `AT+PWD` | Get/set MQTT password |
| `AT+MQOS` | Get/set QoS level |

### Data Commands

| Command | Description |
|---------|-------------|
| `AT+TDC` | Get/set transmission interval (seconds) |
| `AT+PAYLOADTYPE` | Get/set payload format |
| `AT+GETSENSORVALUE` | Get current sensor reading |
| `AT+LDATA` | Get last uploaded data |
| `AT+SEND` | Force send data |
| `AT+RXDL` | Get/set receiving time |

### Alarm Commands

| Command | Description |
|---------|-------------|
| `AT+SHTEMP` | Get/set temperature alarm |
| `AT+SHHUM` | Get/set humidity alarm |

### Data Logging Commands

| Command | Description |
|---------|-------------|
| `AT+CLOCKLOG` | Enable/disable clock logging |
| `AT+PDTA` | Print historical data by page |
| `AT+PLDTA` | Print last few data entries |
| `AT+CLRDTA` | Clear flash storage |

---

## 10. Kitchen Location Examples

| Location | Temp Range | Humidity Range | TDC | Commands |
|----------|------------|----------------|-----|----------|
| Walk-in Fridge | 0-8°C | 50-90% | 300s | `AT+SHTEMP=1,-2,10` `AT+SHHUM=1,40,95` |
| Freezer | -25 to -15°C | - | 300s | `AT+SHTEMP=1,-30,-10` |
| Kitchen Ambient | 18-28°C | 30-70% | 600s | `AT+SHTEMP=1,15,35` `AT+SHHUM=1,20,80` |
| Dry Storage | 18-25°C | 30-50% | 900s | `AT+SHTEMP=1,15,30` `AT+SHHUM=1,20,60` |
| Hot Kitchen | 20-35°C | 30-80% | 300s | `AT+SHTEMP=1,15,40` `AT+SHHUM=1,20,85` |

---

## Documentation References

- [Dragino S31-NB Manual](https://wiki.dragino.com/xwiki/bin/view/Main/User%20Manual%20for%20LoRaWAN%20End%20Nodes/S31-NBS31B-NB--NB-IoT_Outdoor_Temperature%26Humidity_Sensor_User_Manual/)
- [du IoT Solutions](https://www.du.ae/business/iot)
- [AWS IoT Core Documentation](https://docs.aws.amazon.com/iot/)
