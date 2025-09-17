const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required'],
    unique: true // Ek booking ke liye ek hi feedback
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
feedbackSchema.index({ booking: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ submittedAt: -1 });

// Virtual for formatted date
feedbackSchema.virtual('formattedDate').get(function() {
  return this.submittedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Ensure virtual fields are serialized
feedbackSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Feedback', feedbackSchema);