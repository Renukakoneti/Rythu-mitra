const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const sensorRoutes = require('./routes/sensor');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ===============================
// 🔥 GLOBAL LIVE SENSOR STORAGE
// ===============================
let latestSensorData = {};

// ===============================
// 🔥 LIVE SENSOR APIs (IMPORTANT)
// ===============================

// 📡 Hardware sends data here
app.post('/api/sensor/data', (req, res) => {
  latestSensorData = {
    ...req.body,
    updatedAt: new Date()
  };

  console.log(`📡 [${new Date().toLocaleTimeString()}] Live Sensor Update:`, {
    moisture: req.body.soil_moisture,
    temp: req.body.temperature,
    device: req.body.deviceId
  });

  res.json({
    success: true,
    message: "Sensor data updated",
    data: latestSensorData
  });
});

// 📱 App fetches live data here (PRIMARY ENDPOINT)
app.get('/api/sensor/data', (req, res) => {
  // Ensure consistent response format
  const responseData = latestSensorData.updatedAt ? latestSensorData : {
    soil_moisture: 0,
    soil: 0,
    temperature: 0,
    humidity: 0,
    co2_ppm: 0,
    gas: 0,
    rain_intensity: 0,
    rain: 0,
    updatedAt: new Date()
  };
  
  res.json(responseData);
});

// Fallback endpoint for compatibility
app.get('/api/sensor', (req, res) => {
  res.json(latestSensorData.updatedAt ? latestSensorData : {
    soil_moisture: 0,
    soil: 0,
    temperature: 0,
    humidity: 0,
    co2_ppm: 0,
    gas: 0,
    rain_intensity: 0,
    rain: 0,
    updatedAt: new Date()
  });
});

// ===============================
// Existing Routes
// ===============================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/telemetry', require('./routes/telemetry'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/iot', require('./routes/iot'));

// ⚠️ Remove conflicting route - use direct endpoints above instead
// app.use('/api/sensor', sensorRoutes);

// ===============================
// Health Check
// ===============================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running smoothly'
  });
});

// Root
app.get('/', (req, res) => {
  res.send('Welcome to the Farmer App API');
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Live sensor API: /api/sensor/data`);
    });

  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
  }
};

startServer();