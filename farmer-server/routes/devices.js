const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Device = require('../models/Device');

// @route   POST /api/devices
// @desc    Register/Pair a new device
router.post('/', auth, async (req, res) => {
  try {
    const { deviceId, name, location } = req.body;

    let device = await Device.findOne({ deviceId });
    if (device) {
      return res.status(400).json({ message: 'Device already registered' });
    }

    device = new Device({
      deviceId,
      name,
      location,
      owner: req.user.id
    });

    await device.save();
    res.json(device);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/devices
// @desc    Get all user devices
router.get('/', auth, async (req, res) => {
  try {
    const devices = await Device.find({ owner: req.user.id });
    res.json(devices);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
