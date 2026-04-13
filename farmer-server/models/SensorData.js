const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
    index: true // Optimize for queries per device
  },
  temperature: Number,
  humidity: Number,
  co2_ppm: Number,
  soil_moisture: Number,
  light_condition: String,
  rain_intensity: Number,
  smoke_detected: {
    type: Boolean,
    default: false
  },
  // Sensor healthy/diagnostics
  sensor_status: {
    dht11: { type: String, default: 'ok' },
    mq135: { type: String, default: 'ok' },
    ldr: { type: String, default: 'ok' },
    rain: { type: String, default: 'ok' },
    soil: { type: String, default: 'ok' }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Highly important for time-series charts
  }
});

// Add index for time-range queries (e.g. last 6 hours for a specific device)
sensorDataSchema.index({ device: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
