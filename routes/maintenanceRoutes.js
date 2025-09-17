const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

// GET /maintenance/tickets (staff only)
router.get('/tickets', protect, authorize('admin', 'manager', 'receptionist'), maintenanceController.getTickets);

// GET /maintenance/tickets/:id
router.get('/tickets/:id', protect, maintenanceController.getTicket);

// POST /maintenance/tickets (create ticket - guest or staff)
router.post('/tickets', protect, maintenanceController.createTicket);

// PATCH /maintenance/tickets/:id/status (update status - staff only)
router.patch('/tickets/:id/status', protect, authorize('admin', 'manager', 'receptionist'), maintenanceController.updateTicketStatus);

// DELETE /maintenance/tickets/:id (admin only)
router.delete('/tickets/:id', protect, authorize('admin'), maintenanceController.deleteTicket);

module.exports = router;