const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    default: 'info'
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    required: true,
    default: false
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Sensor data snapshot at the time of alert
  temperature: Number,
  humidity: Number,
  soilMoisture: Number,
  gas: String,
  rainDetected: Boolean
}, {
  timestamps: true
});

alertSchema.index({ owner: 1, isRead: 1 });

module.exports = mongoose.model('Alert', alertSchema);
