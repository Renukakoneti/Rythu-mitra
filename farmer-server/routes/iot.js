const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const iotAuth = require('../middleware/iotAuth');

// @route   POST /api/iot/data
// @desc    Ingest telemetry data from hardware nodes
// @access  Protected (Hardware Bearer Token)
router.post('/data', async (req, res) => {

  const {
    deviceId,
    temperature,
    humidity,
    co2_ppm,
    soil_moisture,
    light_condition,
    rain_intensity,
    smoke_detected,
    sensor_status
  } = req.body;

  if (!deviceId) {
    return res.status(400).json({ message: 'Device ID is required' });
  }

  try {
    // 1. Find the device in the system
    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({ message: 'Device not registered in system' });
    }

    // 2. Create the telemetry record
    const newData = new SensorData({
      device: device._id,
      temperature,
      humidity,
      co2_ppm,
      soil_moisture,
      light_condition,
      rain_intensity,
      smoke_detected,
      sensor_status,
      timestamp: Date.now()
    });

    await newData.save();

    // 4. AUTOMATIC ALERT SYSTEM (Intelligent Guard)
    const alerts = [];

    // Fire/Smoke Check
    if (smoke_detected) {
      alerts.push({
        message: `🔒 SECURITY: Smoke Detected! Emergency sensor active on ${device.name}. Check field immediately!`,
        type: 'critical',
        device: device._id
      });
    }

    // Heat Stress Check
    if (temperature > 38) {
      alerts.push({
        message: `🌡️ CLIMATE: Peak Temperature! ${device.name} reporting ${temperature}°C. Critical heat risk for crops.`,
        type: 'warning',
        device: device._id
      });
    }

    // Irrigation Check
    if (soil_moisture > 0 && soil_moisture < 20) {
      alerts.push({
        message: `💧 SOIL: Low Moisture! ${device.name} soil is critically dry (${soil_moisture}%). Irrigation recommended.`,
        type: 'info',
        device: device._id
      });
    }

    // Air Quality / Greenhouse Check (High CO2)
    if (co2_ppm > 800) {
      alerts.push({
        message: `🌬️ AIR: High CO2 Levels! ${device.name} detected ${co2_ppm} ppm. Consider ventilating the greenhouse.`,
        type: 'warning',
        device: device._id
      });
    }

    // Weather Warning (Moderate/Heavy Rain)
    if (rain_intensity > 5) {
      alerts.push({
        message: `🌧️ WEATHER: Rain Detected! Moderate rain detected at ${device.name}. Check open storage or equipment.`,
        type: 'info',
        device: device._id
      });
    }

    // Diagnostic Alert (Sensor Failure)
    if (sensor_status && (sensor_status.dht11 === 'error' || sensor_status.soil === 'error')) {
      alerts.push({
        message: `🛠️ SYSTEM: Sensor Fault! Node ${device.name} reporting hardware read errors. Maintenance required.`,
        type: 'warning',
        device: device._id
      });
    }



    // Save alerts if any triggered
    if (alerts.length > 0) {
      const Alert = require('../models/Alert');
      for (const alertData of alerts) {
        await Alert.create({
          ...alertData,
          owner: device.owner,
          timestamp: Date.now()
        });
      }
    }

    // 5. Update device status to online
    device.status = 'online';
    device.lastSeen = Date.now();
    await device.save();


    res.status(201).json({
      message: 'Telemetry ingested successfully',
      deviceId: device.deviceId
    });
  } catch (err) {
    console.error('IoT Data Ingestion Error:', err.message);
    res.status(500).send('Ingestion Error');
  }
});

module.exports = router;
