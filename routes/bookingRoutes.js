const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// GET /bookings (staff only)
router.get('/', protect, authorize('admin', 'manager', 'receptionist'), bookingController.getBookings);

// GET /bookings/availability (check available rooms)
router.get('/availability', bookingController.checkAvailability);

// GET /bookings/:id
router.get('/:id', protect, bookingController.getBooking);

// POST /bookings (create booking - staff or guest)
router.post('/', protect, bookingController.createBooking);

// PUT /bookings/:id (update booking - staff only)
router.put('/:id', protect, authorize('admin', 'manager', 'receptionist'), bookingController.updateBooking);

// PATCH /bookings/:id/check-in (check-in - receptionist+)
router.patch('/:id/check-in', protect, authorize('admin', 'manager', 'receptionist'), bookingController.checkIn);

// PATCH /bookings/:id/check-out (check-out - receptionist+)
router.patch('/:id/check-out', protect, authorize('admin', 'manager', 'receptionist'), bookingController.checkOut);

// DELETE /bookings/:id (admin only)
router.delete('/:id', protect, authorize('admin'), bookingController.deleteBooking);

module.exports = router;