const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    min: 0
  }
});

const invoiceSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required']
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    min: 0
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  emailedTo: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  isPaid: {
    type: Boolean,
    default: false
  }
});

// Automatic calculation before saving
invoiceSchema.pre('save', function(next) {
  // Calculate item amounts
  this.items.forEach(item => {
    item.amount = item.quantity * item.rate;
  });

  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate total
  this.total = this.subtotal + this.tax;
  
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);