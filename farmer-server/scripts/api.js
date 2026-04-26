const axios = require('axios');
const { users, devices } = require('./data/users');

const API_URL = 'http://192.168.1.44:5000/api'; // Change to production URL if needed

const seedViaAPI = async () => {
  console.log('🚀 Starting API-based seeding...');

  try {
    const userTokens = [];

    // 1. REGISTER USERS
    console.log('👤 Registering users...');
    for (const user of users) {
      try {
        const res = await axios.post(`${API_URL}/auth/register`, {
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          password: user.password
        });
        userTokens.push(res.data.token);
        console.log(`   Registered: ${user.fullName}`);
      } catch (e) {
        console.log(`   User ${user.fullName} might already exist, attempting login...`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
          phoneNumber: user.phoneNumber,
          password: user.password
        });
        userTokens.push(loginRes.data.token);
      }
    }

    // 2. REGISTER DEVICES
    console.log('🔌 Registering devices...');
    for (let i = 0; i < devices.length; i++) {
      const token = userTokens[i % userTokens.length];
      try {
        await axios.post(`${API_URL}/devices`, devices[i], {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   Device registered: ${devices[i].name}`);
      } catch (e) {
        console.log(`   Device ${devices[i].deviceId} exists or registration error.`);
      }
    }

    // 3. INGEST TELEMETRY (10,000 PINGS)
    console.log('📊 Simulating 10,000 IoT transmissions...');
    // We need the IoT Bearer token from the generator
    // For this script, we'll assume the developer has generated it
    const fs = require('fs');
    const path = require('path');
    let iotToken = '';
    try {
        iotToken = fs.readFileSync(path.join(__dirname, '../config/accesstoken.txt'), 'utf8').trim();
    } catch (err) {
        console.error('❌ IoT token missing! Please run "npm run gen-iot-token" first.');
        process.exit(1);
    }

    const totalIngestions = 10000;
    for (let i = 0; i < totalIngestions; i++) {
        const device = devices[i % devices.length];
        
        const payload = {
            deviceId: device.deviceId,
            temperature: (25 + Math.random() * 10).toFixed(2),
            humidity: (50 + Math.random() * 30).toFixed(2),
            soil_moisture: (40 + Math.random() * 40).toFixed(2),
            co2_ppm: Math.floor(400 + Math.random() * 500),
            light_condition: Math.random() > 0.5 ? 'Bright' : 'Cloudy',
            sensor_status: { system: "ok" }
        };

        await axios.post(`${API_URL}/iot/data`, payload, {
            headers: { Authorization: iotToken }
        });

        if ((i + 1) % 500 === 0) {
            console.log(`   Ingested ${i + 1} / ${totalIngestions} records...`);
        }
    }

    console.log('✅ API SEEDING COMPLETE!');
  } catch (err) {
    console.error('❌ SEEDING FAILED:', err.response?.data || err.message);
  }
};

seedViaAPI();
