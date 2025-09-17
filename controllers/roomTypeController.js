const RoomType = require('../models/Roomtype.js');

// @desc    Get all room types
// @route   GET /api/room-types
// @access  Public
exports.getRoomTypes = async (req, res) => {
  try {
    const { isAvailable } = req.query;
    let query = {};

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const roomTypes = await RoomType.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: roomTypes.length,
      data: roomTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single room type
// @route   GET /api/room-types/:id
// @access  Public
exports.getRoomType = async (req, res) => {
  try {
    const roomType = await RoomType.findById(req.params.id);

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found'
      });
    }

    res.json({
      success: true,
      data: roomType
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid room type ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create room type
// @route   POST /api/room-types
// @access  Private/Admin
exports.createRoomType = async (req, res) => {
  try {
    const { name, description, basePrice, capacity, amenities, imageUrl, isAvailable } = req.body;

    // Check if room type already exists
    const existingRoomType = await RoomType.findOne({ name });
    if (existingRoomType) {
      return res.status(400).json({
        success: false,
        message: 'Room type with this name already exists'
      });
    }

    const roomType = new RoomType({
      name,
      description,
      basePrice,
      capacity,
      amenities: amenities || [],
      imageUrl: imageUrl || '',
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    const savedRoomType = await roomType.save();

    res.status(201).json({
      success: true,
      message: 'Room type created successfully',
      data: savedRoomType
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update room type
// @route   PUT /api/room-types/:id
// @access  Private/Admin
exports.updateRoomType = async (req, res) => {
  try {
    const { name, description, basePrice, capacity, amenities, imageUrl, isAvailable } = req.body;

    // Check if room type exists
    let roomType = await RoomType.findById(req.params.id);
    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found'
      });
    }

    // Check if new name already exists (excluding current room type)
    if (name && name !== roomType.name) {
      const existingRoomType = await RoomType.findOne({ name });
      if (existingRoomType) {
        return res.status(400).json({
          success: false,
          message: 'Room type with this name already exists'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (basePrice !== undefined) updateData.basePrice = basePrice;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (amenities !== undefined) updateData.amenities = amenities;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    roomType = await RoomType.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Room type updated successfully',
      data: roomType
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid room type ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete room type
// @route   DELETE /api/room-types/:id
// @access  Private/Admin
exports.deleteRoomType = async (req, res) => {
  try {
    const roomType = await RoomType.findById(req.params.id);

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found'
      });
    }

    // Check if room type is being used in any rooms
    // (You might want to add this check once you have Room model)
    // const roomsWithThisType = await Room.countDocuments({ roomType: req.params.id });
    // if (roomsWithThisType > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Cannot delete room type. It is being used by some rooms.'
    //   });
    // }

    await RoomType.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Room type deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid room type ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get room type statistics
// @route   GET /api/room-types/stats/count
// @access  Private/Admin
exports.getRoomTypeStats = async (req, res) => {
  try {
    const totalRoomTypes = await RoomType.countDocuments();
    const availableRoomTypes = await RoomType.countDocuments({ isAvailable: true });
    const unavailableRoomTypes = await RoomType.countDocuments({ isAvailable: false });

    res.json({
      success: true,
      data: {
        total: totalRoomTypes,
        available: availableRoomTypes,
        unavailable: unavailableRoomTypes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Search room types
// @route   GET /api/room-types/search/:query
// @access  Public
exports.searchRoomTypes = async (req, res) => {
  try {
    const { query } = req.params;
    
    const roomTypes = await RoomType.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { amenities: { $in: [new RegExp(query, 'i')] } }
      ]
    });

    res.json({
      success: true,
      count: roomTypes.length,
      data: roomTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};