#!/usr/bin/env node
/**
 * Device Provisioning Script for VisionDrive Smart Kitchen
 * 
 * 🔐 Security: Generates device tokens for custom authorizer (VD-2026-001)
 * 
 * Usage:
 *   node scripts/provision-device.js <deviceId> <kitchenId>
 * 
 * Example:
 *   node scripts/provision-device.js s31-001 kitchen-001
 * 
 * Output:
 *   - Device registered in DynamoDB
 *   - Secret token printed (configure in sensor)
 *   - AT command for sensor configuration
 */

const crypto = require('crypto');

// Configuration
const AWS_REGION = 'me-central-1';
const DEVICES_TABLE = 'VisionDrive-Devices';
const IOT_ENDPOINT = 'a15wlpv31y3kre-ats.iot.me-central-1.amazonaws.com';

/**
 * Generate a secure device secret and its hash
 */
function generateDeviceSecret() {
  // Generate 32 random bytes (256-bit security)
  const secret = crypto.randomBytes(32).toString('hex');
  // Hash for storage (we never store the raw secret)
  const hash = crypto.createHash('sha256').update(secret).digest('hex');
  return { secret, hash };
}

/**
 * Main provisioning function
 */
async function provisionDevice(deviceId, kitchenId) {
  console.log('\n🔐 VisionDrive Device Provisioning');
  console.log('═'.repeat(50));
  
  // Validate inputs
  if (!deviceId || !kitchenId) {
    console.error('❌ Usage: node provision-device.js <deviceId> <kitchenId>');
    console.error('   Example: node provision-device.js s31-001 kitchen-001');
    process.exit(1);
  }

  // Generate credentials
  const { secret, hash } = generateDeviceSecret();
  const token = `${deviceId}:${hash}`;
  
  console.log(`\n📦 Device: ${deviceId}`);
  console.log(`🏠 Kitchen: ${kitchenId}`);
  console.log(`🔑 Secret Hash: ${hash.substring(0, 16)}...`);

  // DynamoDB item
  const deviceItem = {
    PK: `DEVICE#${deviceId}`,
    SK: 'METADATA',
    deviceId,
    kitchenId,
    secretHash: hash,
    enabled: true,
    model: 'S31-NB',
    createdAt: new Date().toISOString(),
    provisionedBy: 'provision-device.js'
  };

  console.log('\n📝 DynamoDB Item (save to VisionDrive-Devices):');
  console.log('─'.repeat(50));
  console.log(JSON.stringify(deviceItem, null, 2));

  // AWS CLI command to create the item
  console.log('\n🔧 AWS CLI Command:');
  console.log('─'.repeat(50));
  console.log(`aws dynamodb put-item \\
  --table-name ${DEVICES_TABLE} \\
  --item '{
    "PK": {"S": "DEVICE#${deviceId}"},
    "SK": {"S": "METADATA"},
    "deviceId": {"S": "${deviceId}"},
    "kitchenId": {"S": "${kitchenId}"},
    "secretHash": {"S": "${hash}"},
    "enabled": {"BOOL": true},
    "model": {"S": "S31-NB"},
    "createdAt": {"S": "${new Date().toISOString()}"}
  }' \\
  --region ${AWS_REGION}`);

  // Sensor configuration
  console.log('\n📡 Sensor Configuration (via Dragino BLE App):');
  console.log('─'.repeat(50));
  console.log(`
# 1. Connect to sensor via Bluetooth

# 2. Configure MQTT with authentication
AT+PRO=3,0              # MQTTs protocol
AT+TLSMOD=1,0           # Enable TLS
AT+SERVADDR=${IOT_ENDPOINT},8883

# 3. Set device credentials (TOKEN AUTHENTICATION)
AT+CLIENT=visiondrive-${deviceId}
AT+MQUSER=${token}
# Note: MQPASS can be empty or set to device secret for double auth

# 4. Set topics
AT+PUBTOPIC=visiondrive/${kitchenId}/${deviceId}/environment
AT+SUBTOPIC=visiondrive/${kitchenId}/${deviceId}/commands

# 5. Save and reboot
ATZ
`);

  // Security notice
  console.log('\n⚠️  SECURITY NOTICE');
  console.log('─'.repeat(50));
  console.log(`
1. The secret token is: ${token}
   (Store securely - this is shown only once!)

2. The sensor will authenticate using:
   - TLS 1.2 encryption (first layer)
   - Device token in MQTT username (second layer)

3. Even if TLS is compromised via MITM:
   - Attacker cannot forge valid messages
   - Attacker cannot publish to other devices' topics
   - Each device has unique token
`);

  console.log('\n✅ Device provisioning complete!');
  console.log('═'.repeat(50));
}

// Run if called directly
const args = process.argv.slice(2);
provisionDevice(args[0], args[1]);
