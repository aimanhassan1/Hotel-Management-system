const Feedback = require('../models/Feedback.js');
const Booking = require('../models/Booking.js');

// @desc    Get all feedback
// @route   GET /api/feedback
exports.getFeedback = async (req, res) => {
  try {
    const { rating, page = 1, limit = 10 } = req.query;
    let query = {};

    if (rating) query.rating = rating;

    const feedback = await Feedback.find(query)
      .populate({
        path: 'booking',
        populate: [
          { path: 'guest', select: 'name email' },
          { path: 'room', select: 'roomNumber floor' }
        ]
      })
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(query);

    res.json({
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single feedback
// @route   GET /api/feedback/:id
exports.getSingleFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate({
        path: 'booking',
        populate: [
          { path: 'guest', select: 'name email' },
          { path: 'room', select: 'roomNumber floor roomType' }
        ]
      });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit feedback
// @route   POST /api/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      guest: req.user._id,
      status: 'checked-out'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Valid booking not found' });
    }

    // Check if feedback already submitted for this booking
    const existingFeedback = await Feedback.findOne({ booking: bookingId });
    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this booking' });
    }

    const feedback = new Feedback({
      booking: bookingId,
      rating,
      comment
    });

    const savedFeedback = await feedback.save();
    await savedFeedback.populate({
      path: 'booking',
      populate: { path: 'guest', select: 'name email' }
    });

    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get feedback stats
// @route   GET /api/feedback/stats
exports.getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalFeedback: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const ratingCounts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    if (stats.length > 0 && stats[0].ratingDistribution) {
      stats[0].ratingDistribution.forEach(rating => {
        ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
      });
    }

    res.json({
      averageRating: stats[0]?.averageRating || 0,
      totalFeedback: stats[0]?.totalFeedback || 0,
      ratingCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};