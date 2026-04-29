const axios = require('axios');

// Configure the URL to match your server
const API_URL = 'http://127.0.0.1:5000/api/iot/data';

console.log('🚀 Starting Live Sensor Simulator...');
console.log(`📡 Sending data to: ${API_URL}`);

let logsCount = 0;

const simulateTransmission = async () => {
    try {
        const payload = {
            deviceId: 'Test_node_21',
            temperature: parseFloat((28 + Math.random() * 5).toFixed(1)),
            humidity: parseFloat((60 + Math.random() * 10).toFixed(1)),
            soil_moisture: parseFloat((35 + Math.random() * 15).toFixed(1)), // Live soil moisture
            co2_ppm: Math.floor(400 + Math.random() * 200),
            light_condition: Math.random() > 0.3 ? 'Bright' : 'Cloudy',
            rain_intensity: parseFloat((Math.random() * 2).toFixed(1)),
            smoke_detected: false,
            sensor_status: {
                dht11: 'ok',
                mq135: 'ok',
                ldr: 'ok',
                rain: 'ok',
                soil: 'ok'
            }
        };

        const res = await axios.post(API_URL, payload);
        logsCount++;
        
        process.stdout.write(`\r✅ Transmission #${logsCount} sent. Moisture: ${payload.soil_moisture}% | Temp: ${payload.temperature}°C`);

    } catch (err) {
        console.error(`\n❌ Failed to send data: ${err.message}`);
    }
};

// Send data every 2 seconds to match the app's polling interval
setInterval(simulateTransmission, 2000);

// Initial transmission
simulateTransmission();
