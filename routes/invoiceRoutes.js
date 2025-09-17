const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

// GET /invoices (staff only)
router.get('/', protect, authorize('admin', 'manager', 'receptionist'), invoiceController.getInvoices);

// GET /invoices/:id
router.get('/:id', protect, invoiceController.getInvoice);

// POST /invoices (generate invoice - receptionist+)
router.post('/', protect, authorize('admin', 'manager', 'receptionist'), invoiceController.createInvoice);

// GET /invoices/:id/print (print invoice)
router.get('/:id/print', protect, invoiceController.printInvoice);

// POST /invoices/:id/email (email invoice)
router.post('/:id/email', protect, authorize('admin', 'manager', 'receptionist'), invoiceController.emailInvoice);

// PATCH /invoices/:id/pay (mark as paid)
router.patch('/:id/pay', protect, authorize('admin', 'manager', 'receptionist'), invoiceController.markAsPaid);

module.exports = router;