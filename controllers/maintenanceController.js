const MaintenanceTicket = require('../models/MaintenanceTicket');
const Room = require('../models/Room');

// @desc    Get all maintenance tickets
// @route   GET /api/maintenance/tickets
exports.getTickets = async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await MaintenanceTicket.find(query)
      .populate('room', 'roomNumber floor')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/maintenance/tickets/:id
exports.getTicket = async (req, res) => {
  try {
    const ticket = await MaintenanceTicket.findById(req.params.id)
      .populate('room', 'roomNumber floor roomType')
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create maintenance ticket
// @route   POST /api/maintenance/tickets
exports.createTicket = async (req, res) => {
  try {
    const ticket = new MaintenanceTicket({
      ...req.body,
      reportedBy: req.user._id
    });

    const savedTicket = await ticket.save();
    await savedTicket.populate('room', 'roomNumber floor');
    await savedTicket.populate('reportedBy', 'name email');

    // Update room status to maintenance if high priority
    if (req.body.priority === 'high') {
      await Room.findByIdAndUpdate(req.body.room, { status: 'maintenance' });
    }

    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update ticket status
// @route   PATCH /api/maintenance/tickets/:id/status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status, assignedTo, notes, actualCost } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (notes) updateData.notes = notes;
    if (actualCost !== undefined) updateData.actualCost = actualCost;

    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const ticket = await MaintenanceTicket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('room', 'roomNumber floor')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // If ticket resolved, update room status back to available
    if (status === 'resolved') {
      await Room.findByIdAndUpdate(ticket.room._id, { status: 'available' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/maintenance/tickets/:id
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await MaintenanceTicket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tickets by room
// @route   GET /api/maintenance/room/:roomId/tickets
exports.getTicketsByRoom = async (req, res) => {
  try {
    const tickets = await MaintenanceTicket.find({ room: req.params.roomId })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};