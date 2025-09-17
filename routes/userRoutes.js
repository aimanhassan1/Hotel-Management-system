const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// GET /users (admin only)
router.get('/', protect, authorize('admin'), userController.getUsers);

// POST /users (admin only - create staff)
router.post('/', protect, authorize('admin'), userController.createUser);

// GET /users/:id
router.get('/:id', protect, userController.getUser);

// PUT /users/:id (admin or own profile)
router.put('/:id', protect, userController.updateUser);

// DELETE /users/:id (admin only)
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;