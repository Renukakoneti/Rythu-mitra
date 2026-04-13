# 🌾 Rythu Mitra IoT Integration Guide

This guide explains how to connect physical hardware nodes to the Rythu Mitra Cloud Server.

---

## 🚀 1. Endpoint Details
- **Base URL:** `http://<YOUR_SERVER_IP>:5000`
- **Full Endpoint:** `/api/iot/data`
- **Method:** `POST`
- **Content-Type:** `application/json`

---

## 🔒 2. Authentication
Every request **must** include a Bearer Token in the headers.

**Header Key:** `Authorization`  
**Header Value:** `Bearer <YOUR_TOKEN_HERE>`

> [!TIP]
> You can find your specific token in the `config/accesstoken.txt` file. Copy the entire string including "Bearer".

---

## 📦 3. Data Payload (JSON Body)
The server expects the following JSON structure from your sensors:

```json
{
  "deviceId": "NODE_SERIAL_001",
  "temperature": 24.5,
  "humidity": 62,
  "co2_ppm": 450,
  "soil_moisture": 55,
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
```

### Field Descriptions:
- `deviceId`: (String) The serial number of the hardware (must be registered in the app first).
- `temperature`: (Number) Celsius degrees.
- `humidity`: (Number) Relative humidity percentage.
- `co2_ppm`: (Number) CO2 concentration in parts per million.
- `soil_moisture`: (Number) Soil moisture percentage.
- `light_condition`: (String) "Bright", "Cloudy", "Dark".
- `rain_intensity`: (Number) Intensity level (0 if dry).
- `smoke_detected`: (Boolean) True if smoke is picked up by MQ135.
- `sensor_status`: (Object) Diagnostic status for each sensor unit.

---

## 📡 4. Sample Integration (JavaScript/Axios)
```javascript
const axios = require('axios');
const fs = require('fs');

const token = fs.readFileSync('./config/accesstoken.txt', 'utf8');

const telemetry = {
  deviceId: "NODE_SERIAL_001",
  temperature: 28.5,
  humidity: 45
};

axios.post('http://localhost:5000/api/iot/data', telemetry, {
  headers: { 'Authorization': token }
})
.then(res => console.log('Data Ingested:', res.data))
.catch(err => console.error('Ingestion Error:', err.response?.data || err.message));
```

---

## ⚙️ 5. Status Codes
- **201 Created:** Data stored successfully.
- **401 Unauthorized:** Missing or invalid Bearer Token.
- **404 Not Found:** Device ID not registered in the system.
- **500 Server Error:** Internal processing issue.
