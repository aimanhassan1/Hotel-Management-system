const Room = require('../models/Room.js');
const RoomType = require('../models/Room.js');

// @desc    Get all rooms
// @route   GET /api/rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('roomType');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available rooms
// @route   GET /api/rooms/available
exports.getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'available' }).populate('roomType');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('roomType');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create room
// @route   POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const room = new Room(req.body);
    const savedRoom = await room.save();
    await savedRoom.populate('roomType');
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('roomType');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update room status
// @route   PATCH /api/rooms/:id/status
exports.updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('roomType');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};