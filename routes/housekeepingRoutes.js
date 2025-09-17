const express = require('express');
const router = express.Router();
const housekeepingController = require('../controllers/housekeepingController');
const { protect, authorize } = require('../middleware/auth');

// GET /housekeeping/tasks (housekeeping staff+)
router.get('/tasks', protect, authorize('admin', 'manager', 'housekeeping'), housekeepingController.getTasks);

// GET /housekeeping/tasks/:id
router.get('/tasks/:id', protect, authorize('admin', 'manager', 'housekeeping'), housekeepingController.getTask);

// POST /housekeeping/tasks (create task - receptionist+)
router.post('/tasks', protect, authorize('admin', 'manager', 'receptionist'), housekeepingController.createTask);

// PATCH /housekeeping/tasks/:id/status (update task status - housekeeping+)
router.patch('/tasks/:id/status', protect, authorize('admin', 'manager', 'housekeeping'), housekeepingController.updateTaskStatus);

// DELETE /housekeeping/tasks/:id (admin only)
router.delete('/tasks/:id', protect, authorize('admin'), housekeepingController.deleteTask);

module.exports = router;