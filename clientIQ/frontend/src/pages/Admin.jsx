import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { getAdminStats } from '../services/api';
import { SkeletonDashboard } from '../components/Skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
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

const CHART_COLORS = {
  New: '#64748b',
  Contacted: '#475569',
  Qualified: '#34d399',
  Closed: '#94a3b8',
  Lost: '#f87171',
};

const CUSTOM_LABEL = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load admin stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonDashboard />;

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="error-msg">{error}</p>
        </motion.div>
      </div>
    );
  }

  const o = stats?.overview || {};
  const last7 = stats?.last7Days || {};
  const leadsByStatus = stats?.leadsByStatus || {};
  const funnel = stats?.funnel || [];

  const pieData = Object.entries(leadsByStatus).map(([name, value]) => ({ name, value }));
  const last7BarData = [
    { label: 'Users', value: last7.newUsers ?? 0, fill: '#1a1a1a' },
    { label: 'Customers', value: last7.newCustomers ?? 0, fill: '#34d399' },
    { label: 'Leads', value: last7.newLeads ?? 0, fill: '#94a3b8' },
  ];
  const funnelBarData = funnel.map((f) => ({
    name: f._id,
    count: f.count,
    value: f.value || 0,
    fill: CHART_COLORS[f._id] || '#404040',
  }));

  return (
    <div className="container page-padding">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}
      >
        Admin Dashboard
      </motion.h1>
      <motion.p
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}
      >
        Platform-wide ClientIQ statistics
      </motion.p>

      {/* Overview cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}
      >
        {[
          { label: 'Users', value: o.totalUsers ?? 0, accent: '#1a1a1a' },
          { label: 'Customers', value: o.totalCustomers ?? 0, accent: '#34d399' },
          { label: 'Leads', value: o.totalLeads ?? 0, accent: '#94a3b8' },
          { label: 'Activities', value: o.totalActivities ?? 0, accent: '#404040' },
          { label: 'Emails', value: o.totalEmails ?? 0, accent: '#1a1a1a' },
          { label: 'Tasks', value: o.totalTasks ?? 0, accent: '#34d399' },
          { label: 'Done', value: o.tasksCompleted ?? 0, accent: '#34d399' },
          { label: 'Revenue', value: `₹${(o.totalRevenue ?? 0).toLocaleString()}`, accent: '#34d399' },
        ].map((item) => (
          <motion.div
            key={item.label}
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -4 }}
            className="card"
            style={{
              textAlign: 'center',
              padding: '1.25rem',
              borderLeft: `4px solid ${item.accent}`,
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: item.accent }}>{item.value}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{item.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}
      >
        {/* Pie chart - Leads by Status */}
        {pieData.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="card"
            style={{ padding: '1.5rem', minHeight: 320 }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Leads by Status</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={CUSTOM_LABEL}
                  labelLine={false}
                  animationBegin={200}
                  animationDuration={800}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[entry.name] || '#404040'} stroke="none" />
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              {pieData.map((d) => (
                <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: CHART_COLORS[d.name] }} />
                  {d.name}: {d.value}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bar chart - Last 7 Days */}
        <motion.div variants={itemVariants} className="card" style={{ padding: '1.5rem', minHeight: 320 }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7BarData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="label" width={80} tick={{ fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} animationBegin={300} animationDuration={600} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--cream-border)',
                  borderRadius: 8,
                  boxShadow: 'var(--shadow-soft)',
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Funnel bar chart */}
        {funnelBarData.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="card"
            style={{ padding: '1.5rem', minHeight: 320, gridColumn: pieData.length ? '1 / -1' : undefined }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Lead Funnel</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${value} leads`, 'Count']}
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--cream-border)',
                    borderRadius: 8,
                    boxShadow: 'var(--shadow-soft)',
                  }}
                />
                <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]} animationBegin={400} animationDuration={600}>
                {funnelBarData.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </motion.div>

      {/* Recent activity */}
      {stats?.recentActivities?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Recent Platform Activity</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {stats.recentActivities.map((a) => (
              <li
                key={a._id}
                style={{
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border-light)',
                  fontSize: '0.9375rem',
                }}
              >
                {a.description}
                {a.createdBy && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>by {a.createdBy}</span>
                )}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginLeft: '0.5rem' }}>
                  · {formatActivityDate(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
