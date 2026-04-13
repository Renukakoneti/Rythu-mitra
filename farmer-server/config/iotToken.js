const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const IOT_PAYLOAD = {
  identity: 'rythu_mitra_iot_hardware',
  role: 'hardware_node',
  access: 'ingest_telemetry'
};

const secret = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE_URL;

// Generate Token (No expiration for hardware stability)
const token = jwt.sign(IOT_PAYLOAD, secret);

const filePath = path.join(__dirname, 'credentials.txt');
const infoPath = path.join(__dirname, 'IOT_API_INFO.txt');

try {
  // 1. Save raw Bearer token
  fs.writeFileSync(filePath, `
    BASE_URL: ${BASE_URL}
    TOKEN:  ${token}`);

  // 2. Save comprehensive API info
  const apiInfo = `
=========================================
      RYTHU MITRA IOT API CONFIG
=========================================
Token & BASE_URL Info will be find in credentials.txt

ENDPOINT: BASE_URL/api/iot/data
METHOD:   POST
HEADER:   Authorization
VALUE:    Bearer YOUR_GENERATED_JWT_TOKEN


REQUEST BODY FORMAT (JSON):
{
  "deviceId": "YOUR_DEVICE_SERIAL",
  "temperature": 24.5,
  "humidity": 65,
  "co2_ppm": 400,
  "soil_moisture": 50,
  "light_condition": "Bright",
  "rain_intensity": 0,
  "smoke_detected": false,
  "sensor_status": {
    "dht11": "ok",
    "mq135": "ok",
    "ldr": "ok",
    "rain": "ok",
    "soil": "ok"
  }
}
=========================================
`;

  fs.writeFileSync(infoPath, apiInfo);

  console.log('✅ IoT Bearer Token & API Info Generated!');
  console.log('📍 Token: config/credentials.txt');
  console.log('📍 Info:  config/IOT_API_INFO.txt');
} catch (err) {

  console.error('❌ Error saving token:', err.message);
}
