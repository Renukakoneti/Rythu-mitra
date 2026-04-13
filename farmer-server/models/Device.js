const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Device name is required'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    default: 'Main Field'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', deviceSchema);
