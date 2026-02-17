import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '../components/Skeleton';
import {
  getRevenueReport,
  getFunnelReport,
  getSummaryReport,
  exportLeadsCsv,
  exportCustomersCsv,
} from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const statusColors = {
  New: '#64748b',
  Contacted: '#475569',
  Qualified: '#34d399',
  Closed: '#94a3b8',
  Lost: '#f87171',
};

export default function Reports() {
  const [revenue, setRevenue] = useState({ data: [], totalRevenue: 0, period: 30 });
  const [funnel, setFunnel] = useState([]);
  const [summary, setSummary] = useState(null);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [revRes, funRes, sumRes] = await Promise.all([
          getRevenueReport(period).then((r) => r.data),
          getFunnelReport().then((r) => r.data),
          getSummaryReport().then((r) => r.data),
        ]);
        setRevenue(revRes);
        setFunnel(funRes);
        setSummary(sumRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  const handleExportLeads = async () => {
    setExporting('leads');
    try {
      const res = await exportLeadsCsv();
      downloadBlob(res.data, 'leads-export.csv');
    } catch (e) {
      console.error(e);
    } finally {
      setExporting('');
    }
  };

  const handleExportCustomers = async () => {
    setExporting('customers');
    try {
      const res = await exportCustomersCsv();
      downloadBlob(res.data, 'customers-export.csv');
    } catch (e) {
      console.error(e);
    } finally {
      setExporting('');
    }
  };

  const maxRev = Math.max(1, ...revenue.data.map((d) => d.total));

  if (loading) {
    return (
      <div className="container" style={{ padding: '2.5rem 2rem' }}>
        <Skeleton height={40} width={280} style={{ marginBottom: '2rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <Skeleton height={32} style={{ margin: '0 auto 0.5rem', width: 60 }} />
              <Skeleton height={16} style={{ width: 80, margin: '0 auto' }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <Skeleton height={120} />
        </div>
        <div className="card">
          <Skeleton height={200} />
        </div>
      </div>
    );
  }

  return (
    <div className="container page-padding">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={itemVariants}
          className="page-title"
          style={{ marginTop: 0, marginBottom: '2rem', fontWeight: 700 }}
        >
          Reports & Analytics
        </motion.h1>

        {/* Summary cards */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <motion.div className="card" whileHover={{ y: -4 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--black-main)' }}>
              {summary?.totalCustomers ?? 0}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Customers</div>
          </motion.div>
          <motion.div className="card" whileHover={{ y: -4 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--black-main)' }}>
              {summary?.totalLeads ?? 0}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Leads</div>
          </motion.div>
          <motion.div className="card" whileHover={{ y: -4 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--mint-green)' }}>
              ₹{(summary?.totalRevenue ?? 0).toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Total Revenue</div>
          </motion.div>
          <motion.div className="card" whileHover={{ y: -4 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--black-main)' }}>
              {summary?.closedCount ?? 0}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Closed Deals</div>
          </motion.div>
        </motion.div>

        {/* Revenue chart */}
        <motion.div variants={itemVariants} className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Revenue by Period</h2>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--cream-border)',
                background: 'var(--bg-card)',
                fontSize: '0.875rem',
              }}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          <div style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
            Total: ₹{(revenue.totalRevenue ?? 0).toLocaleString()}
          </div>
          {revenue.data.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', minHeight: 120 }}>
                {revenue.data.map((d, i) => (
                  <motion.div
                    key={d._id}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(8, (d.total / maxRev) * 100)}%` }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                    style={{
                      flex: 1,
                      minWidth: 24,
                      background: 'var(--black-main)',
                      borderRadius: '4px 4px 0 0',
                      position: 'relative',
                    }}
                    title={`${d._id}: ₹${d.total.toLocaleString()} (${d.count} deals)`}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{revenue.data[0]?._id}</span>
                <span>{revenue.data[revenue.data.length - 1]?._id}</span>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No closed deals in this period.</p>
          )}
        </motion.div>

        {/* Conversion funnel - Pie + bars */}
        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 600 }}>Leads Distribution</h2>
            {funnel.some((s) => s.count > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={funnel.filter((s) => s.count > 0)}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                    label={({ name, percent }) => (percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : '')}
                    labelLine={false}
                    animationBegin={200}
                    animationDuration={600}
                  >
                    {funnel.map((entry) => (
                      <Cell key={entry._id} fill={statusColors[entry._id] || '#404040'} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} leads${props?.payload?.value ? ` · ₹${props.payload.value.toLocaleString()}` : ''}`,
                      name,
                    ]}
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--cream-border)',
                      borderRadius: 8,
                      boxShadow: 'var(--shadow-soft)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-secondary)', margin: 0, padding: '2rem 0' }}>No leads yet.</p>
            )}
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.25rem', fontWeight: 600 }}>Conversion Funnel</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {funnel.map((stage, i) => {
                const maxCount = Math.max(1, ...funnel.map((s) => s.count));
                const pct = (stage.count / maxCount) * 100;
                return (
                  <div key={stage._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: 90, fontSize: '0.875rem', fontWeight: 500 }}>{stage._id}</span>
                    <div style={{ flex: 1, height: 28, background: 'var(--cream-accent)', borderRadius: 6, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                        style={{
                          height: '100%',
                          background: statusColors[stage._id] || 'var(--black-muted)',
                          borderRadius: 6,
                        }}
                      />
                    </div>
                    <span style={{ width: 50, textAlign: 'right', fontSize: '0.875rem', fontWeight: 600 }}>{stage.count}</span>
                    {stage.value > 0 && (
                      <span style={{ width: 70, textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        ₹{stage.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Export */}
        <motion.div variants={itemVariants} className="card">
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 600 }}>Export Data</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <motion.button
              type="button"
              className="btn btn-secondary"
              onClick={handleExportLeads}
              disabled={!!exporting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {exporting === 'leads' ? 'Exporting...' : 'Export Leads (CSV)'}
            </motion.button>
            <motion.button
              type="button"
              className="btn btn-secondary"
              onClick={handleExportCustomers}
              disabled={!!exporting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {exporting === 'customers' ? 'Exporting...' : 'Export Customers (CSV)'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
