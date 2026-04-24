const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const sensorRoutes = require('./routes/sensor');

// Load environment variables
dotenv.config();



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/telemetry', require('./routes/telemetry'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/iot', require('./routes/iot'));
app.use('/api/sensor', sensorRoutes);





// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running smoothly' });
});

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the Farmer App API');
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start server only after DB is connected
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
  }
};

startServer();
