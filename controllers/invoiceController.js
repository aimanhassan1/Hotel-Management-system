const Invoice = require('../models/Invoice.js');
const Booking = require('../models/Booking.js');
const Room = require('../models/Room.js');

// @desc    Get all invoices
// @route   GET /api/invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('booking')
      .populate({
        path: 'booking',
        populate: { path: 'guest', select: 'name email' }
      });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'booking',
        populate: [
          { path: 'guest', select: 'name email phone address' },
          { path: 'room', select: 'roomNumber floor' }
        ]
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create invoice
// @route   POST /api/invoices
exports.createInvoice = async (req, res) => {
  try {
    const { bookingId, items, tax } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('room')
      .populate('guest');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Calculate room charges
    const roomCharge = booking.totalNights * booking.room.currentPrice;

    const invoice = new Invoice({
      booking: bookingId,
      items: [
        {
          description: `Room ${booking.room.roomNumber} - ${booking.totalNights} nights`,
          quantity: booking.totalNights,
          rate: booking.room.currentPrice,
          amount: roomCharge
        },
        ...items
      ],
      tax: tax || 0
    });

    const savedInvoice = await invoice.save();
    await savedInvoice.populate({
      path: 'booking',
      populate: [
        { path: 'guest', select: 'name email' },
        { path: 'room', select: 'roomNumber floor' }
      ]
    });

    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Print invoice
// @route   GET /api/invoices/:id/print
exports.printInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'booking',
        populate: [
          { path: 'guest', select: 'name email phone address' },
          { path: 'room', select: 'roomNumber floor roomType' }
        ]
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Here you would generate PDF (using pdfkit or similar)
    // For now returning JSON for printing
    res.json({
      invoice,
      printFormat: 'PDF',
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Email invoice
// @route   POST /api/invoices/:id/email
exports.emailInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'booking',
        populate: { path: 'guest', select: 'name email' }
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Here you would integrate with email service (Nodemailer)
    // For now simulating email send
    const emailResponse = {
      success: true,
      message: `Invoice sent to ${invoice.booking.guest.email}`,
      invoiceId: invoice._id
    };

    // Update invoice with email info
    invoice.emailedTo = invoice.booking.guest.email;
    await invoice.save();

    res.json(emailResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark invoice as paid
// @route   PATCH /api/invoices/:id/pay
exports.markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { isPaid: true },
      { new: true, runValidators: true }
    ).populate({
      path: 'booking',
      populate: { path: 'guest', select: 'name email' }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};