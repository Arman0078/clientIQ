import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLeads, getCustomers, createLead, updateLead, deleteLead } from '../services/api';
import LeadForm from '../components/LeadForm';
import EmailModal from '../components/EmailModal';
import SummaryModal from '../components/SummaryModal';
import ConfirmModal from '../components/ConfirmModal';
import { Skeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'];
const statusColors = {
  New: 'var(--black-muted)',
  Contacted: 'var(--black-main)',
  Qualified: 'var(--mint-green)',
  Closed: '#94a3b8',
  Lost: 'var(--soft-red)',
};

export default function Pipeline() {
  const toast = useToast();
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailLead, setEmailLead] = useState(null);
  const [summaryLead, setSummaryLead] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  const fetchLeads = () => {
    setLoading(true);
    getLeads({ limit: 500 })
      .then((res) => setLeads(res.data.leads || []))
      .catch(() => toast.error('Failed to load leads'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
    getCustomers({ limit: 500 }).then((res) => setCustomers(res.data.customers || [])).catch(() => {});
  }, []);

  const leadsByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s);
    return acc;
  }, {});

  const handleCreate = (data) => {
    setSubmitting(true);
    createLead(data)
      .then(() => {
        setShowForm(false);
        fetchLeads();
        toast.success('Lead created');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Create failed'))
      .finally(() => setSubmitting(false));
  };

  const handleUpdate = (data) => {
    if (!editing) return;
    setSubmitting(true);
    updateLead(editing._id, data)
      .then(() => {
        setEditing(null);
        fetchLeads();
        toast.success('Lead updated');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Update failed'))
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    deleteLead(confirmDelete)
      .then(() => {
        setConfirmDelete(null);
        fetchLeads();
        toast.success('Lead deleted');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Delete failed'));
  };

  const handleDragStart = (e, lead) => {
    setDraggingId(lead._id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead._id);
    e.dataTransfer.setData('application/json', JSON.stringify({ id: lead._id, status: lead.status }));
    e.target.style.opacity = '0.6';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggingId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    const lead = leads.find((l) => l._id === id);
    if (!lead || lead.status === newStatus) return;
    updateLead(id, { status: newStatus })
      .then(() => {
        fetchLeads();
        toast.success('Status updated');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Update failed'));
  };

  const columnTotal = (status) =>
    leadsByStatus[status]?.reduce((s, l) => s + (l.value || 0), 0) ?? 0;

  if (loading) {
    return (
      <div className="container page-padding">
        <Skeleton height={40} width={200} style={{ marginBottom: '1.5rem' }} />
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'hidden' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ flex: '0 0 280px', minWidth: 280 }}>
              <Skeleton height={48} style={{ borderRadius: '6px 6px 0 0', marginBottom: 0 }} />
              <div style={{ padding: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--cream-border)', borderTop: 'none', borderRadius: '0 0 6px 6px' }}>
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} height={80} style={{ marginBottom: '0.75rem' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container page-padding">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}
      >
        <h1 className="page-title" style={{ margin: 0, fontWeight: 700 }}>Deals Pipeline</h1>
        <motion.button
          type="button"
          className="btn btn-primary"
          onClick={() => { setShowForm(true); setEditing(null); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Add deal
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showForm && !editing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card"
            style={{ marginBottom: '1.5rem' }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>New Lead</h2>
            <LeadForm customers={customers} onSubmit={handleCreate} onCancel={() => setShowForm(false)} submitting={submitting} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card"
            style={{ marginBottom: '1.5rem' }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>Edit Lead</h2>
            <LeadForm lead={editing} customers={customers} onSubmit={handleUpdate} onCancel={() => setEditing(null)} submitting={submitting} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pipeline-columns"
        style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          minHeight: 400,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {STATUSES.map((status, colIndex) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: colIndex * 0.05 }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
            className="pipeline-column"
            style={{
              flex: '0 0 280px',
              minWidth: 280,
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--cream-border)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 220px)',
            }}
          >
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--cream-border)',
                background: statusColors[status] || 'var(--black-muted)',
                color: '#fff',
                borderRadius: '6px 6px 0 0',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {status}
              <span style={{ marginLeft: '0.5rem', opacity: 0.9, fontWeight: 500 }}>
                ({leadsByStatus[status]?.length ?? 0})
              </span>
              {columnTotal(status) > 0 && (
                <div style={{ fontSize: '0.8125rem', marginTop: '0.25rem', opacity: 0.9 }}>
                  ₹{columnTotal(status).toLocaleString()}
                </div>
              )}
            </div>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {(leadsByStatus[status] || []).map((lead) => (
                <motion.div
                  key={lead._id}
                  layout
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                  onDragEnd={handleDragEnd}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: draggingId === lead._id ? 0.7 : 1,
                    scale: 1,
                  }}
                  whileHover={{ scale: 1.02 }}
                  className="card"
                  style={{
                    padding: '1rem',
                    cursor: 'grab',
                    border: '1px solid var(--cream-border)',
                    background: 'var(--bg-card)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'var(--cream-accent)',
                        flexShrink: 0,
                      }}
                    >
                      {(lead.image || lead.customer?.image) ? (
                        <img src={lead.image || lead.customer?.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {lead.title?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{lead.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{lead.customer?.name || '–'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {lead.value != null && lead.value > 0 && (
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--mint-green)' }}>
                        ₹{Number(lead.value).toLocaleString()}
                      </span>
                    )}
                    {lead.winProbability != null && lead.winProbability > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--cream-accent)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                        {lead.winProbability}% win
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <motion.button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={(e) => { e.stopPropagation(); setEditing(lead); setShowForm(false); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={(e) => { e.stopPropagation(); setSummaryLead(lead); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Summary
                    </motion.button>
                    <motion.button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={(e) => { e.stopPropagation(); setEmailLead(lead); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Email
                    </motion.button>
                    <motion.button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(lead._id); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {emailLead && (
        <EmailModal
          to={emailLead.customer?.email}
          leadId={emailLead._id}
          customerId={emailLead.customer?._id}
          onClose={() => setEmailLead(null)}
          onSent={() => fetchLeads()}
        />
      )}
      {summaryLead && (
        <SummaryModal
          leadId={summaryLead._id}
          customerId={summaryLead.customer?._id}
          leadTitle={summaryLead.title}
          customerName={summaryLead.customer?.name}
          onClose={() => setSummaryLead(null)}
        />
      )}
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete lead"
        message="Are you sure you want to delete this lead? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
