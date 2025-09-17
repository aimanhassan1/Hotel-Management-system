const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

// GET /rooms (all rooms - staff access)
router.get('/', protect, authorize('admin', 'manager', 'receptionist'), roomController.getRooms);

// GET /rooms/available (available rooms - public/staff)
router.get('/available', roomController.getAvailableRooms);

// GET /rooms/:id
router.get('/:id', protect, roomController.getRoom);

// POST /rooms (admin only)
router.post('/', protect, authorize('admin'), roomController.createRoom);

// PUT /rooms/:id (admin only)
router.put('/:id', protect, authorize('admin'), roomController.updateRoom);

// PATCH /rooms/:id/status (update status - receptionist+)
router.patch('/:id/status', protect, authorize('admin', 'manager', 'receptionist'), roomController.updateRoomStatus);

// DELETE /rooms/:id (admin only)
router.delete('/:id', protect, authorize('admin'), roomController.deleteRoom);

module.exports = router;