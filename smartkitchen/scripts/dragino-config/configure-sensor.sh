#!/bin/bash
#
# VisionDrive Smart Kitchen - Dragino PS-NB-GE Configuration Script
# 
# This script generates AT commands for configuring a Dragino sensor.
# Copy the output and send via BLE or UART to your sensor.
#
# Usage: ./configure-sensor.sh <sensor_id> <kitchen_id> <location>
# Example: ./configure-sensor.sh sensor-001 kitchen-001 "Walk-in Fridge"
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration defaults
AWS_IOT_ENDPOINT="${AWS_IOT_ENDPOINT:-xxxxxx-ats.iot.me-central-1.amazonaws.com}"
DU_APN="${DU_APN:-du}"
TRANSMISSION_INTERVAL="${TRANSMISSION_INTERVAL:-300000}"  # 5 minutes in ms
PROBE_TYPE="${PROBE_TYPE:-1}"  # 1 = 4-20mA
POWER_OUTPUT_TIME="${POWER_OUTPUT_TIME:-2000}"  # 2 seconds

# Parse arguments
SENSOR_ID="${1:-sensor-001}"
KITCHEN_ID="${2:-kitchen-001}"
LOCATION="${3:-Default Location}"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║        VisionDrive Smart Kitchen - Sensor Configuration           ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}Configuration Parameters:${NC}"
echo "  Sensor ID:     ${SENSOR_ID}"
echo "  Kitchen ID:    ${KITCHEN_ID}"
echo "  Location:      ${LOCATION}"
echo "  IoT Endpoint:  ${AWS_IOT_ENDPOINT}"
echo "  APN:           ${DU_APN}"
echo "  Interval:      ${TRANSMISSION_INTERVAL}ms ($(($TRANSMISSION_INTERVAL / 60000)) minutes)"
echo ""

echo -e "${YELLOW}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}                    AT COMMANDS TO SEND                                ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════════════${NC}"
echo ""

cat << EOF
# ============================================
# NETWORK CONFIGURATION
# ============================================

# Set du APN
AT+APN=${DU_APN}

# ============================================
# MQTT CONFIGURATION FOR AWS IOT CORE
# ============================================

# Set protocol to MQTTs (TLS encrypted MQTT)
AT+PRO=3

# Set AWS IoT Core endpoint
AT+SERVADDR=${AWS_IOT_ENDPOINT},8883

# Set unique MQTT Client ID
AT+CLIENT=visiondrive-${SENSOR_ID}

# Set MQTT Publish Topic
AT+PUBTOPIC=visiondrive/${KITCHEN_ID}/${SENSOR_ID}/temperature

# Set MQTT Subscribe Topic (for commands)
AT+SUBTOPIC=visiondrive/${KITCHEN_ID}/${SENSOR_ID}/commands

# Enable TLS mode
AT+TLSMOD=1

# ============================================
# TRANSMISSION SETTINGS
# ============================================

# Set transmission interval (milliseconds)
AT+TDC=${TRANSMISSION_INTERVAL}

# Set payload format to JSON
AT+PAYLOADTYPE=5

# ============================================
# TEMPERATURE PROBE SETTINGS
# ============================================

# Set probe model (1 = 4-20mA)
AT+PROBE=${PROBE_TYPE}

# Set 5V power output duration (ms)
AT+5VT=${POWER_OUTPUT_TIME}

# ============================================
# VERIFY AND SAVE
# ============================================

# Print all configuration
AT+CFG

# Test sensor reading
AT+GETSENSORVALUE=0

EOF

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Instructions:${NC}"
echo "1. Connect to sensor via BLE using Dragino Config App"
echo "2. Enter device password from label (AT+PIN=xxxxxx)"
echo "3. Copy and paste each command above"
echo "4. Verify with AT+CFG"
echo "5. Test with AT+GETSENSORVALUE=0"
echo ""
echo -e "${BLUE}After configuration, force a transmission with: AT+SEND${NC}"
echo ""
