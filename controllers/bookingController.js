const Booking = require('../models/Booking.js');
const Room = require('../models/Room.js');

// @desc    Get all bookings
// @route   GET /api/bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('guest', 'name email phone')
      .populate('room', 'roomNumber floor');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check room availability
// @route   GET /api/bookings/availability
exports.checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut, roomType } = req.query;
    
    // Find overlapping bookings
    const overlappingBookings = await Booking.find({
      $or: [
        { checkIn: { $lte: new Date(checkOut) }, checkOut: { $gte: new Date(checkIn) } },
        { checkIn: { $gte: new Date(checkIn), $lte: new Date(checkOut) } }
      ],
      status: { $in: ['reserved', 'checked-in'] }
    });

    const bookedRoomIds = overlappingBookings.map(booking => booking.room.toString());
    
    // Find available rooms
    let query = { status: 'available' };
    if (roomType) query.roomType = roomType;
    if (bookedRoomIds.length > 0) query._id = { $nin: bookedRoomIds };

    const availableRooms = await Room.find(query).populate('roomType');
    
    res.json(availableRooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest', 'name email phone address')
      .populate('room', 'roomNumber floor roomType');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    const savedBooking = await booking.save();
    await savedBooking.populate('guest', 'name email');
    await savedBooking.populate('room', 'roomNumber floor');
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('guest', 'name email')
      .populate('room', 'roomNumber floor');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Check-in booking
// @route   PATCH /api/bookings/:id/check-in
exports.checkIn = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'checked-in' },
      { new: true, runValidators: true }
    )
      .populate('guest', 'name email')
      .populate('room', 'roomNumber floor');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update room status to occupied
    await Room.findByIdAndUpdate(booking.room._id, { status: 'occupied' });

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Check-out booking
// @route   PATCH /api/bookings/:id/check-out
exports.checkOut = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'checked-out' },
      { new: true, runValidators: true }
    )
      .populate('guest', 'name email')
      .populate('room', 'roomNumber floor');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update room status to cleaning
    await Room.findByIdAndUpdate(booking.room._id, { status: 'cleaning' });

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};