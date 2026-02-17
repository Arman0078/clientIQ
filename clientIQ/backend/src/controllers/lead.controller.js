import Lead, { leadStatuses } from '../models/Lead.js';
import { logActivity } from '../utils/logActivity.js';

export const getLeads = async (req, res) => {
  try {
    const status = req.query.status || '';
    const pageNum = Math.max(1, parseInt(req.query.page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status && leadStatuses.includes(status)) {
      filter.status = status;
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('customer', 'name email company image')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Lead.countDocuments(filter),
    ]);

    res.json({
      leads,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('customer', 'name email phone company image')
      .populate('assignedTo', 'name email');
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const createLead = async (req, res) => {
  try {
    const { title, customer, status, value, winProbability, notes, assignedTo, image } = req.body;
    if (!title || !customer) {
      return res.status(400).json({ message: 'Title and customer are required' });
    }
    const lead = await Lead.create({
      title,
      customer,
      status: status || 'New',
      value: value || 0,
      winProbability: winProbability != null ? Math.min(100, Math.max(0, Number(winProbability))) : undefined,
      image: image || '',
      notes: notes ? [{ text: notes, createdBy: req.user._id }] : [],
      assignedTo: assignedTo || undefined,
    });
    const populated = await Lead.findById(lead._id)
      .populate('customer', 'name email image')
      .populate('assignedTo', 'name email');
    await logActivity('lead_created', 'Lead', lead._id, `Created lead "${title}"`, req.user._id, { title, customer: populated.customer?.name });
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    const { title, customer, status, value, winProbability, assignedTo, image } = req.body;
    const oldStatus = lead.status;
    if (title !== undefined) lead.title = title;
    if (customer !== undefined) lead.customer = customer;
    if (status !== undefined && leadStatuses.includes(status)) lead.status = status;
    if (value !== undefined) lead.value = Number(value);
    if (winProbability !== undefined) lead.winProbability = Math.min(100, Math.max(0, Number(winProbability)));
    if (assignedTo !== undefined) lead.assignedTo = assignedTo;
    if (image !== undefined) lead.image = image;
    await lead.save();
    const populated = await Lead.findById(lead._id)
      .populate('customer', 'name email image')
      .populate('assignedTo', 'name email');
    if (status !== undefined && oldStatus !== status) {
      await logActivity('lead_status_changed', 'Lead', lead._id, `Changed lead status from "${oldStatus}" to "${status}"`, req.user._id, { oldStatus, newStatus: status });
    } else {
      await logActivity('lead_updated', 'Lead', lead._id, `Updated lead "${lead.title}"`, req.user._id);
    }
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const addLeadNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Note text is required' });
    }
    lead.notes.push({ text: text.trim(), createdBy: req.user._id });
    await lead.save();
    await logActivity('lead_note_added', 'Lead', lead._id, `Added note to lead "${lead.title}"`, req.user._id);
    const populated = await Lead.findById(lead._id)
      .populate('customer', 'name email image')
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    const title = lead.title;
    await lead.deleteOne();
    await logActivity('lead_deleted', 'Lead', req.params.id, `Deleted lead "${title}"`, req.user._id);
    res.json({ message: 'Lead removed' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const Customer = (await import('../models/Customer.js')).default;
    const totalCustomers = await Customer.countDocuments({ createdBy: req.user._id });
    const totalLeads = await Lead.countDocuments({});
    const closedLeads = await Lead.find({ status: 'Closed' }).select('value').lean();
    const totalRevenue = closedLeads.reduce((s, l) => s + (l.value || 0), 0);
    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const recentLeads = await Lead.find({})
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      totalCustomers,
      totalLeads,
      totalRevenue,
      leadsByStatus: leadsByStatus.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
      recentLeads,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
