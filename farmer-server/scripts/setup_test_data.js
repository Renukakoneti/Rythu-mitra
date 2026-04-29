const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Device = require('../models/Device');
const User = require('../models/User');

dotenv.config();

const setupTestDevice = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Find or Create a test user (owner)
        let user = await User.findOne({ phoneNumber: '1234567890' });
        if (!user) {
            user = await User.create({
                fullName: 'Test Farmer',
                password: 'password123',
                phoneNumber: '1234567890'
            });
            console.log('Test User Created');
        }

        // 2. Find or Create the test device
        let device = await Device.findOne({ deviceId: 'Test_node_21' });
        if (!device) {
            device = await Device.create({
                deviceId: 'Test_node_21',
                name: 'Main Field Node',
                owner: user._id,
                status: 'online',
                type: 'Soil Sensor'
            });
            console.log('Test Device Created: Test_node_21');
        } else {
            console.log('Test Device Already Exists: Test_node_21');
        }

        process.exit(0);
    } catch (err) {
        console.error('Setup Error:', err.message);
        process.exit(1);
    }
};

setupTestDevice();
