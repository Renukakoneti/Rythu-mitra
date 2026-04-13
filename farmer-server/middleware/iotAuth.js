const jwt = require('jsonwebtoken');

// Middleware to secure IoT endpoints using JWT Verification
module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if no header
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization denied. No token provided.' });
  }

  // Check if Bearer format
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid token format. Use Bearer <token>' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded info if needed
    console.log('Decoded IoT Token:', decoded);
    if (decoded.role === 'hardware_node' && decoded.access === 'ingest_telemetry' && decoded.identity === 'rythu_mitra_iot_hardware') {
      req.iot = decoded;
      next();
    } else {
      return res.status(403).json({ message: 'Invalid IoT token' });
    }
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired IoT token' });
  }
};

