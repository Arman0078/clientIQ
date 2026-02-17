import Lead from '../models/Lead.js';
import Customer from '../models/Customer.js';

export const getRevenueReport = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = Math.max(1, Math.min(365, parseInt(period) || 30));
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const leads = await Lead.aggregate([
      { $match: { status: 'Closed', createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$value' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const totalRevenue = leads.reduce((s, x) => s + x.total, 0);
    res.json({ data: leads, totalRevenue, period: days });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getFunnelReport = async (req, res) => {
  try {
    const funnel = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$value' } } },
    ]);
    const order = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'];
    const sorted = order.map((s) => funnel.find((f) => f._id === s) || { _id: s, count: 0, value: 0 });
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getSummaryReport = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments({ createdBy: req.user._id });
    const totalLeads = await Lead.countDocuments({});
    const closedLeads = await Lead.find({ status: 'Closed' });
    const totalRevenue = closedLeads.reduce((s, l) => s + (l.value || 0), 0);
    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json({
      totalCustomers,
      totalLeads,
      totalRevenue,
      closedCount: closedLeads.length,
      leadsByStatus: leadsByStatus.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const exportLeadsCsv = async (req, res) => {
  try {
    const leads = await Lead.find({})
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    const headers = ['Title', 'Customer', 'Email', 'Status', 'Value', 'Created'];
    const rows = leads.map((l) => [
      l.title,
      l.customer?.name || '',
      l.customer?.email || '',
      l.status,
      l.value ?? 0,
      l.createdAt ? new Date(l.createdAt).toISOString() : '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads-export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const exportCustomersCsv = async (req, res) => {
  try {
    const customers = await Customer.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).lean();
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Created'];
    const rows = customers.map((c) => [
      c.name,
      c.email,
      c.phone || '',
      c.company || '',
      c.createdAt ? new Date(c.createdAt).toISOString() : '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=customers-export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
