const HousekeepingTask = require('../models/HousekeepingTask.js');
const Room = require('../models/Room.js');

// @desc    Get all housekeeping tasks
// @route   GET /api/housekeeping/tasks
exports.getTasks = async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = {};

    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.dueDate = { $gte: startDate, $lt: endDate };
    }

    const tasks = await HousekeepingTask.find(query)
      .populate('room', 'roomNumber floor status')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/housekeeping/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const task = await HousekeepingTask.findById(req.params.id)
      .populate('room', 'roomNumber floor')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create housekeeping task
// @route   POST /api/housekeeping/tasks
exports.createTask = async (req, res) => {
  try {
    const task = new HousekeepingTask(req.body);
    const savedTask = await task.save();
    await savedTask.populate('room', 'roomNumber floor');
    await savedTask.populate('assignedTo', 'name email');
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update task status
// @route   PATCH /api/housekeeping/tasks/:id/status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, completedAt } = req.body;
    
    const updateData = { status };
    if (status === 'completed' && !completedAt) {
      updateData.completedAt = new Date();
    }

    const task = await HousekeepingTask.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('room', 'roomNumber floor')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // If task completed, update room status to available
    if (status === 'completed') {
      await Room.findByIdAndUpdate(task.room._id, { status: 'available' });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/housekeeping/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await HousekeepingTask.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};