const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Alert = require('../models/Alert');

// @route   GET /api/alerts
// @desc    Get all user alerts
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ owner: req.user.id }).sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/alerts/:id
// @desc    Mark alert as read
router.put('/:id', auth, async (req, res) => {
  try {
    let alert = await Alert.findById(req.params.id);

    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    // Make sure user owns alert
    if (alert.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { $set: { isRead: true } },
      { new: true }
    );

    res.json(alert);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/alerts/:id
// @desc    Delete an alert
router.delete('/:id', auth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    if (alert.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await alert.deleteOne();
    res.json({ message: 'Alert removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/alerts
// @desc    Clear all alerts for user
router.delete('/', auth, async (req, res) => {
  try {
    await Alert.deleteMany({ owner: req.user.id });
    res.json({ message: 'All alerts cleared' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
