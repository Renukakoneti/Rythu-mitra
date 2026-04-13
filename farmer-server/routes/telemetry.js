const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');
const Device = require('../models/Device');

// @route   POST /api/telemetry
// @desc    Receive sensor data from hardware
router.post('/', async (req, res) => {
  try {
    const { deviceId, temperature, humidity, co2_ppm, soil_moisture, light_condition, status } = req.body;

    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    const newData = new SensorData({
      device: device._id,
      temperature,
      humidity,
      co2_ppm,
      soil_moisture,
      light_condition,
      sensor_status: status
    });

    await newData.save();

    // Update device status and last seen
    device.status = 'online';
    device.lastSeen = Date.now();
    await device.save();

    res.json({ message: 'Data received successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/telemetry/:deviceId/latest
// @desc    Get latest sensor reading for a device
router.get('/:deviceId/latest', async (req, res) => {
  try {
    const device = await Device.findOne({ deviceId: req.params.deviceId });
    if (!device) return res.status(404).json({ message: 'Device not found' });

    const latestData = await SensorData.findOne({ device: device._id }).sort({ timestamp: -1 });
    res.json(latestData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
