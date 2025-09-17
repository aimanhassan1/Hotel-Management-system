const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  roomType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomType',
    required: [true, 'Room type is required']
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'occupied', 'cleaning', 'maintenance'],
      message: 'Status must be available, occupied, cleaning, or maintenance'
    },
    default: 'available'
  },
  currentPrice: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  floor: {
    type: String,
    required: [true, 'Floor number is required'],
    trim: true
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Room', roomSchema);