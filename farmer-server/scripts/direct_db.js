const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const { users, devices } = require('./data/users');

const seedDirectly = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Connected to MongoDB for seeding...');

    // 1. CLEANING DATABASE
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Device.deleteMany({});
    await SensorData.deleteMany({});

    // 2. CREATE USERS
    console.log(`👤 Creating ${users.length} users...`);
    const salt = await bcrypt.genSalt(10);
    const createdUsers = [];

    for (const u of users) {
      const hashedPassword = await bcrypt.hash(u.password, salt);
      const user = await User.create({
        ...u,
        password: hashedPassword
      });
      createdUsers.push(user);
    }

    // 3. CREATE DEVICES (Distributed among users)
    console.log(`🔌 Creating ${devices.length} devices...`);
    const createdDevices = [];
    for (let i = 0; i < devices.length; i++) {
      // Assign to a rotating user
      const owner = createdUsers[i % createdUsers.length];
      const device = await Device.create({
        ...devices[i],
        owner: owner._id,
        status: 'online',
        lastSeen: new Date()
      });
      createdDevices.push(device);
    }

    // 4. GENERATE SENSOR DATA & ALERTS (10,000 Records)
    console.log(`📊 Generating 10,000 sensor records and corresponding alerts...`);
    const BATCH_SIZE = 1000;
    let records = [];
    let alertRecords = [];
    const totalRecords = 10000;

    let timeOffset = 3600000; // Start 1 hour in the past to be strictly 'past only'
    for (let i = 0; i < totalRecords; i++) {
      const device = createdDevices[i % createdDevices.length];

      // Random sensor variations (Aligned with alert thresholds)
      const temp = 18 + Math.random() * 25;
      const humidity = 30 + Math.random() * 60;
      const soil = 10 + Math.random() * 80;
      const co2 = 300 + Math.random() * 900;
      const rain = Math.random() > 0.7 ? Math.floor(Math.random() * 15) : 0;
      const smoke = Math.random() > 0.98;

      // Variable interval (Natural flow)
      timeOffset += (45 + Math.floor(Math.random() * 75)) * 1000;
      const currentTimestamp = new Date(Date.now() - timeOffset);

      // --- ALERT GENERATION LOGIC ---
      if (smoke) {
        alertRecords.push({
          message: `🔒 SECURITY: Smoke Detected! Emergency sensor active on ${device.name}.`,
          type: 'critical',
          device: device._id,
          owner: device.owner,
          isRead: false,
          timestamp: currentTimestamp
        });
      }
      if (temp > 38) {
        alertRecords.push({
          message: `🌡️ CLIMATE: Peak Temperature! ${device.name} reporting ${temp.toFixed(1)}°C.`,
          type: 'warning',
          device: device._id,
          owner: device.owner,
          isRead: false,
          timestamp: currentTimestamp
        });
      }
      if (soil > 0 && soil < 20) {
        alertRecords.push({
          message: `💧 SOIL: Low Moisture! ${device.name} soil is critically dry (${soil.toFixed(1)}%).`,
          type: 'info',
          device: device._id,
          owner: device.owner,
          isRead: false,
          timestamp: currentTimestamp
        });
      }
      if (co2 > 800) {
        alertRecords.push({
          message: `🌬️ AIR: High CO2 Levels! ${device.name} detected ${co2} ppm.`,
          type: 'warning',
          device: device._id,
          owner: device.owner,
          isRead: false,
          timestamp: currentTimestamp
        });
      }
      if (rain > 5) {
        alertRecords.push({
          message: `🌧️ WEATHER: Rain Detected! Moderate rain detected at ${device.name}.`,
          type: 'info',
          device: device._id,
          owner: device.owner,
          isRead: false,
          timestamp: currentTimestamp
        });
      }



      records.push({
        device: device._id,
        temperature: parseFloat(temp.toFixed(2)),
        humidity: parseFloat(humidity.toFixed(2)),
        soil_moisture: parseFloat(soil.toFixed(2)),
        co2_ppm: Math.floor(co2),
        light_condition: Math.random() > 0.5 ? 'Bright' : 'Cloudy',
        rain_intensity: rain,
        smoke_detected: smoke,
        timestamp: currentTimestamp
      });

      // Insert in batches for performance
      if (records.length === BATCH_SIZE) {
        await SensorData.insertMany(records);
        if (alertRecords.length > 0) {
          await require('../models/Alert').insertMany(alertRecords);
          alertRecords = [];
        }
        records = [];
        console.log(`   Processed ${i + 1} / ${totalRecords} records...`);
      }
    }


    // Final batch
    if (records.length > 0) {
      await SensorData.insertMany(records);
      if (alertRecords.length > 0) {
        await require('../models/Alert').insertMany(alertRecords);
      }
    }

    console.log('✅ DATABASE SEEDING COMPLETE!');
    process.exit(0);

  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  }
};

seedDirectly();
