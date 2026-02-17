import Task from '../models/Task.js';
import { logActivity } from '../utils/logActivity.js';

export const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 20, completed, customerId, leadId } = req.query;
    const filter = { createdBy: req.user._id };
    if (completed !== undefined) filter.completed = completed === 'true';
    if (customerId) filter.customer = customerId;
    if (leadId) filter.lead = leadId;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('customer', 'name email')
        .populate('lead', 'title status')
        .populate('assignedTo', 'name')
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Task.countDocuments(filter),
    ]);
    res.json({ tasks, page: pageNum, totalPages: Math.ceil(total / limitNum), total });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getUpcomingTasks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const tasks = await Task.find({
      createdBy: req.user._id,
      completed: false,
      $or: [{ dueDate: null }, { dueDate: { $gte: new Date() } }],
    })
      .populate('customer', 'name')
      .populate('lead', 'title')
      .sort({ dueDate: 1 })
      .limit(limit)
      .lean();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, customerId, leadId } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });
    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'medium',
      customer: customerId || undefined,
      lead: leadId || undefined,
      assignedTo: req.user._id,
      createdBy: req.user._id,
    });
    const populated = await Task.findById(task._id).populate('customer', 'name').populate('lead', 'title');
    await logActivity('task_created', 'Task', task._id, `Created task "${title}"`, req.user._id);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const { title, description, dueDate, completed, priority } = req.body;
    if (title != null) task.title = String(title).trim();
    if (description != null) task.description = String(description).trim();
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (completed !== undefined) {
      task.completed = completed;
      task.completedAt = completed ? new Date() : null;
    }
    if (priority !== undefined) task.priority = priority;
    await task.save();
    if (completed === true) {
      await logActivity('task_completed', 'Task', task._id, `Completed task "${task.title}"`, req.user._id);
    }
    const populated = await Task.findById(task._id).populate('customer', 'name').populate('lead', 'title');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
