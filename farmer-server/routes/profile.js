const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Device = require('../models/Device');
const SensorData = require('../models/SensorData');

// @route   GET /api/profile
// @desc    Get current user profile & stats
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Find all devices owned by user
    const devices = await Device.find({ owner: req.user.id });
    const deviceIds = devices.map(d => d.deviceId);

    // Count all telemetry logs for these devices
    const totalLogs = await SensorData.countDocuments({ deviceId: { $in: deviceIds } });

    res.json({
      ...user._doc,
      stats: {
        totalLogs,
        deviceCount: devices.length
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
router.put('/', auth, async (req, res) => {
  const { fullName, phoneNumber } = req.body;

  // Build profile object
  const profileFields = {};
  if (fullName) profileFields.fullName = fullName;
  if (phoneNumber) profileFields.phoneNumber = phoneNumber;

  try {
    let user = await User.findById(req.user.id);

    if (user) {
      // Update
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: profileFields },
        { new: true }
      ).select('-password');

      return res.json(user);
    }

    res.status(404).json({ message: 'User not found' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
