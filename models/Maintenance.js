const mongoose = require('mongoose');

const maintenanceTicketSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
  },
  issue: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be low, medium, or high'
    },
    default: 'medium'
  },
  status: {
    type: String,
    enum: {
      values: ['open', 'in-progress', 'resolved', 'cancelled'],
      message: 'Status must be open, in-progress, resolved, or cancelled'
    },
    default: 'open'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reported by is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  images: [{
    type: String // URLs of uploaded images
  }],
  estimatedCost: {
    type: Number,
    min: 0
  },
  actualCost: {
    type: Number,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
maintenanceTicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);