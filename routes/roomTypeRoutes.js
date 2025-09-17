// const express = require('express');
// const router = express.Router();
// const roomTypeController = require('../controllers/roomTypeController');
// const { protect, authorize } = require('../middleware/auth');

// // GET /room-types (public)
// router.get('/', roomTypeController.getRoomTypes);

// // GET /room-types/:id
// router.get('/:id', roomTypeController.getRoomType);

// // POST /room-types (admin only)
// router.post('/', protect, authorize('admin'), roomTypeController.createRoomType);

// // PUT /room-types/:id (admin only)
// router.put('/:id', protect, authorize('admin'), roomTypeController.updateRoomType);

// // DELETE /room-types/:id (admin only)
// router.delete('/:id', protect, authorize('admin'), roomTypeController.deleteRoomType);

// module.exports = router;



const express = require('express');
const router = express.Router();
const {
  getRoomTypes,
  getRoomType,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  getRoomTypeStats,
  searchRoomTypes
} = require('../controllers/roomTypeController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getRoomTypes);
router.get('/search/:query', searchRoomTypes);
router.get('/:id', getRoomType);

// Admin only routes
router.post('/', protect, authorize('admin'), createRoomType);
router.put('/:id', protect, authorize('admin'), updateRoomType);
router.delete('/:id', protect, authorize('admin'), deleteRoomType);
router.get('/stats/count', protect, authorize('admin'), getRoomTypeStats);

module.exports = router;