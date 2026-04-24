const express = require('express');
const router = express.Router();

// ✅ Sensor API (no auth)
router.get('/', (req, res) => {
res.json({
    soil: 30,
    temperature: 36,
    humidity: 25,
    rain: 0,
    gas: 200
});
});

module.exports = router;