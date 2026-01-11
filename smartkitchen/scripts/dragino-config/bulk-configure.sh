#!/bin/bash
#
# VisionDrive Smart Kitchen - Bulk Sensor Configuration Generator
# 
# Generates configuration files for multiple sensors
#
# Usage: ./bulk-configure.sh sensors.csv output_dir
#

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default CSV if not provided
SENSORS_CSV="${1:-sensors.csv}"
OUTPUT_DIR="${2:-./sensor-configs}"

# Create sample CSV if it doesn't exist
if [ ! -f "$SENSORS_CSV" ]; then
    echo -e "${BLUE}Creating sample sensors.csv...${NC}"
    cat > sensors.csv << 'EOF'
sensor_id,kitchen_id,location,probe_type,interval_minutes
sensor-001,kitchen-001,Walk-in Fridge,fridge,5
sensor-002,kitchen-001,Freezer,freezer,5
sensor-003,kitchen-001,Display Fridge,fridge,5
sensor-004,kitchen-002,Main Fridge,fridge,5
sensor-005,kitchen-002,Cold Storage,fridge,10
EOF
    echo "Created sample sensors.csv - edit it with your sensor details"
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo -e "${GREEN}Generating configuration files...${NC}"

# Read CSV and generate configs
tail -n +2 "$SENSORS_CSV" | while IFS=',' read -r sensor_id kitchen_id location probe_type interval_minutes; do
    # Skip empty lines
    [ -z "$sensor_id" ] && continue
    
    # Calculate interval in milliseconds
    interval_ms=$((interval_minutes * 60000))
    
    # Set probe number based on type
    case "$probe_type" in
        fridge|general) probe_num=1 ;;
        freezer) probe_num=1 ;;
        *) probe_num=1 ;;
    esac
    
    # Set min/max thresholds based on probe type
    case "$probe_type" in
        fridge) min_temp=0; max_temp=8 ;;
        freezer) min_temp=-25; max_temp=-15 ;;
        *) min_temp=-5; max_temp=10 ;;
    esac
    
    # Generate config file
    config_file="${OUTPUT_DIR}/${sensor_id}-config.txt"
    
    cat > "$config_file" << EOF
# ============================================
# SENSOR: ${sensor_id}
# KITCHEN: ${kitchen_id}
# LOCATION: ${location}
# TYPE: ${probe_type}
# ============================================

# Network
AT+APN=du

# MQTT Configuration
AT+PRO=3
AT+SERVADDR=xxxxxx-ats.iot.me-central-1.amazonaws.com,8883
AT+CLIENT=visiondrive-${sensor_id}
AT+PUBTOPIC=visiondrive/${kitchen_id}/${sensor_id}/temperature
AT+SUBTOPIC=visiondrive/${kitchen_id}/${sensor_id}/commands
AT+TLSMOD=1

# Transmission
AT+TDC=${interval_ms}
AT+PAYLOADTYPE=5

# Probe
AT+PROBE=${probe_num}
AT+5VT=2000

# Alert on significant change (optional)
# AT+ROC=1,60,2000,0

# Verify
AT+CFG
AT+GETSENSORVALUE=0
EOF
    
    echo "  Created: $config_file"
done

echo ""
echo -e "${GREEN}Configuration files generated in: ${OUTPUT_DIR}/${NC}"
echo ""
echo "Next steps:"
echo "1. Update AWS_IOT_ENDPOINT in each file"
echo "2. Connect to each sensor via BLE"
echo "3. Paste the commands from corresponding config file"
