const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');

// @route   GET /api/dashboard
// @desc    Get aggregated data for the home dashboard
router.get('/', auth, async (req, res) => {
  try {
    // 1. Get User Profile
    const user = await User.findById(req.user.id).select('fullName');

    // 2. Get User Devices
    const devices = await Device.find({ owner: req.user.id });

    // 3. Get Telemetry History for the first device (Last 6 points for charts)
    let telemetryHistory = [];
    if (devices.length > 0) {
      telemetryHistory = await SensorData.find({ device: devices[0]._id })
        .sort({ timestamp: -1 })
        .limit(6);


      // Reverse to show chronological order (oldest to newest)
      telemetryHistory.reverse();
    }

    // 4. Get Recent Alerts (Unread or last 3)
    const recentAlerts = await Alert.find({ owner: req.user.id })
      .sort({ timestamp: -1 })
      .limit(3);

    res.json({
      user,
      devices,
      telemetryHistory,
      latestTelemetry: telemetryHistory[telemetryHistory.length - 1] || null,
      recentAlerts,
      stats: {
        totalDevices: devices.length,
        activeAlerts: recentAlerts.filter(a => !a.isRead).length
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
