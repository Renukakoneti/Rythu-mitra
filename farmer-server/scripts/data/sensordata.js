module.exports = {
    generateRandomTelemetry: (deviceId) => ({
        deviceId: deviceId,
        temperature: parseFloat((18 + Math.random() * 25).toFixed(2)), // Up to 43°C
        humidity: parseFloat((30 + Math.random() * 60).toFixed(2)),
        soil_moisture: parseFloat((10 + Math.random() * 70).toFixed(2)), // Can hit < 20
        co2_ppm: Math.floor(300 + Math.random() * 800), // Up to 1100 ppm
        light_condition: Math.random() > 0.5 ? 'Bright' : 'Cloudy',
        rain_intensity: Math.random() > 0.7 ? Math.floor(Math.random() * 15) : 0, // More rain
        smoke_detected: Math.random() > 0.98,
        sensor_status: {
            dht11: Math.random() > 0.99 ? "error" : "ok",
            mq135: "ok",
            ldr: "ok",
            rain: "ok",
            soil: Math.random() > 0.99 ? "error" : "ok"
        }
    })

};
