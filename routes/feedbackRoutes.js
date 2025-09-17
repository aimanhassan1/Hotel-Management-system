const express = require('express');
const router = express.Router();
const {
  getFeedback,
  getSingleFeedback,
  submitFeedback,
  getFeedbackStats,
  deleteFeedback
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all feedback (with pagination and filtering)
// @route   GET /api/feedback
// @access  Public (or Private/Admin if you prefer)
router.get('/', getFeedback);

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Public
router.get('/stats', getFeedbackStats);

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Public
router.get('/:id', getSingleFeedback);

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private (Guests who have completed stay)
router.post('/', protect, submitFeedback);

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteFeedback);

module.exports = router;