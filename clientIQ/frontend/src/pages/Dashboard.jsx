import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getDashboardStats, getRecentActivities, getUpcomingTasks } from '../services/api';
import { SkeletonDashboard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

function formatActivityDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getDashboardStats().then((res) => setStats(res.data)).catch(() => setError('Failed to load dashboard')),
      getRecentActivities(5).then((res) => setActivities(res.data)).catch(() => setActivities([])),
      getUpcomingTasks(5).then((res) => setUpcomingTasks(res.data)).catch(() => setUpcomingTasks([])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <SkeletonDashboard />;
  }
  if (error) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="error-msg">{error}</p>
        </motion.div>
      </div>
    );
  }

  const statusColors = { 
    New: '#64748b', 
    Contacted: '#475569', 
    Qualified: '#34d399', 
    Closed: '#94a3b8', 
    Lost: '#f87171' 
  };
  const leadsByStatusData = stats?.leadsByStatus
    ? Object.entries(stats.leadsByStatus).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="container page-padding">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="page-title"
        style={{ fontWeight: 700, color: 'var(--text-primary)' }}
      >
        Dashboard
      </motion.h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="responsive-grid"
        style={{ marginBottom: '2rem' }}
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          className="card"
          style={{ textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--black-main)' }}
          >
            {stats?.totalCustomers ?? 0}
          </motion.div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, marginTop: '0.5rem' }}>Customers</div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/crm/customers" style={{ fontSize: '0.875rem', marginTop: '0.75rem', display: 'inline-block', fontWeight: 600, color: 'var(--black-main)' }}>
              View all →
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          className="card"
          style={{ textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--black-main)' }}
          >
            {stats?.totalLeads ?? 0}
          </motion.div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, marginTop: '0.5rem' }}>Leads</div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem' }}>
              <Link to="/crm/leads" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--black-main)' }}>View all →</Link>
              <Link to="/crm/pipeline" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--black-main)' }}>Pipeline →</Link>
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          className="card"
          style={{ textAlign: 'center', borderLeft: '4px solid var(--mint-green)' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--mint-green)' }}
          >
            ₹{(stats?.totalRevenue ?? 0).toLocaleString()}
          </motion.div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, marginTop: '0.5rem' }}>Revenue</div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/crm/reports" style={{ fontSize: '0.875rem', marginTop: '0.75rem', display: 'inline-block', fontWeight: 600, color: 'var(--black-main)' }}>
              View reports →
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {leadsByStatusData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
          style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}
        >
          <div style={{ flex: '1 1 200px', minWidth: 200 }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>Leads by Status</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={leadsByStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => (percent > 0.08 ? `${name}` : '')}
                  labelLine={false}
                  animationBegin={300}
                  animationDuration={600}
                >
                  {leadsByStatusData.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} leads`, name]}
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--cream-border)',
                    borderRadius: 8,
                    boxShadow: 'var(--shadow-soft)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: '1 1 180px', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignContent: 'flex-start' }}>
            {leadsByStatusData.map((d, i) => (
              <motion.span
                key={d.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                whileHover={{ scale: 1.05 }}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 6,
                  background: statusColors[d.name],
                  color: '#fff',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 3, background: '#fff', opacity: 0.9 }} />
                {d.name}: {d.value}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {stats?.recentLeads?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h2 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.5rem', fontWeight: 600 }}>Recent Leads</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {stats.recentLeads.map((lead, index) => (
              <motion.li
                key={lead._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ x: 5 }}
                style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-light)' }}
              >
                <Link to="/crm/leads" style={{ fontWeight: 500 }}>{lead.title}</Link>
                {lead.customer?.name && <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}> – {lead.customer.name}</span>}
                <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem', background: 'var(--cream-accent)', borderRadius: 4, border: '1px solid var(--cream-border)' }}>
                  {lead.status}
                </span>
              </motion.li>
            ))}
          </ul>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ marginTop: '1rem' }}>
            <Link to="/crm/leads" className="btn btn-secondary">View all leads</Link>
          </motion.div>
        </motion.div>
      )}

      {activities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <h2 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.5rem', fontWeight: 600 }}>Recent Activity</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {activities.map((a, i) => (
              <motion.li
                key={a._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.05 }}
                style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.9375rem' }}
              >
                {a.description}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginLeft: '0.5rem' }}>
                  · {formatActivityDate(a.createdAt)}
                </span>
              </motion.li>
            ))}
          </ul>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ marginTop: '1rem' }}>
            <Link to="/crm/activities" className="btn btn-secondary">View all activity</Link>
          </motion.div>
        </motion.div>
      )}

      {upcomingTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card"
        >
          <h2 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.5rem', fontWeight: 600 }}>Upcoming Tasks</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {upcomingTasks.map((t, i) => (
              <motion.li
                key={t._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.05 }}
                style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.9375rem' }}
              >
                <Link to="/crm/tasks" style={{ fontWeight: 500 }}>{t.title}</Link>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginLeft: '0.5rem' }}>
                  · Due {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}
                </span>
              </motion.li>
            ))}
          </ul>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ marginTop: '1rem' }}>
            <Link to="/crm/tasks" className="btn btn-secondary">View all tasks</Link>
          </motion.div>
        </motion.div>
      )}

      {(!stats?.recentLeads?.length && !stats?.totalLeads && !stats?.totalCustomers && !activities.length && !upcomingTasks.length) && (
        <EmptyState
          icon="default"
          title="Welcome to ClientIQ"
          description="Add customers and leads to see your dashboard come to life."
          actionLabel="Add customer"
          actionTo="/crm/customers"
        />
      )}
    </div>
  );
}
