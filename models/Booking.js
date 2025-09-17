const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Guest is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  status: {
    type: String,
    enum: {
      values: ['reserved', 'checked-in', 'checked-out', 'cancelled'],
      message: 'Status must be reserved, checked-in, checked-out, or cancelled'
    },
    default: 'reserved'
  },
  totalNights: {
    type: Number,
    min: [1, 'Minimum 1 night required']
  },
  totalAmount: {
    type: Number,
    min: [0, 'Amount cannot be negative']
  },
  adults: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 adult required']
  },
  children: {
    type: Number,
    default: 0,
    min: [0, 'Children cannot be negative']
  },
  specialRequests: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Automatic calculation before saving
bookingSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    const nights = Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
    this.totalNights = nights;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);