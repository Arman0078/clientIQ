import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';
import Email from '../models/Email.js';
import Task from '../models/Task.js';

export const getPlatformStats = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalCustomers,
      totalLeads,
      totalActivities,
      totalEmails,
      totalTasks,
      tasksCompleted,
      closedLeads,
      leadsByStatus,
      funnel,
      usersLast7Days,
      customersLast7Days,
      leadsLast7Days,
      recentActivities,
    ] = await Promise.all([
      User.countDocuments({}),
      Customer.countDocuments({}),
      Lead.countDocuments({}),
      Activity.countDocuments({}),
      Email.countDocuments({}),
      Task.countDocuments({}),
      Task.countDocuments({ completed: true }),
      Lead.find({ status: 'Closed' }).select('value').lean(),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$value' } } },
      ]),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Customer.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Lead.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Activity.find({})
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
    ]);

    const totalRevenue = closedLeads.reduce((s, l) => s + (l.value || 0), 0);
    const leadsByStatusMap = leadsByStatus.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    const funnelOrder = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'];
    const funnelData = funnelOrder.map((s) => funnel.find((f) => f._id === s) || { _id: s, count: 0, value: 0 });

    res.json({
      overview: {
        totalUsers,
        totalCustomers,
        totalLeads,
        totalActivities,
        totalEmails,
        totalTasks,
        tasksCompleted,
        totalRevenue,
      },
      leadsByStatus: leadsByStatusMap,
      funnel: funnelData,
      last7Days: {
        newUsers: usersLast7Days,
        newCustomers: customersLast7Days,
        newLeads: leadsLast7Days,
      },
      recentActivities: recentActivities.map((a) => ({
        _id: a._id,
        type: a.type,
        description: a.description,
        entityType: a.entityType,
        createdAt: a.createdAt,
        createdBy: a.createdBy?.name,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
