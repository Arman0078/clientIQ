import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLeads, getCustomers, createLead, updateLead, deleteLead, addLeadNote } from '../services/api';
import LeadForm from '../components/LeadForm';
import EmailModal from '../components/EmailModal';
import SummaryModal from '../components/SummaryModal';
import ConfirmModal from '../components/ConfirmModal';
import { SkeletonTable } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'];
const statusColors = { New: '#404040', Contacted: '#1a1a1a', Qualified: '#34d399', Closed: '#94a3b8', Lost: '#f87171' };
const statusBgColors = { New: 'rgba(26, 26, 26, 0.08)', Contacted: 'rgba(26, 26, 26, 0.12)', Qualified: 'rgba(52, 211, 153, 0.2)', Closed: 'rgba(148, 163, 184, 0.2)', Lost: 'rgba(248, 113, 113, 0.2)' };

export default function Leads() {
  const toast = useToast();
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [noteLeadId, setNoteLeadId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [emailLead, setEmailLead] = useState(null);
  const [summaryLead, setSummaryLead] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchLeads = (p = page, status = statusFilter) => {
    setLoading(true);
    getLeads({ page: p, limit: 10, status: status || undefined })
      .then((res) => {
        setLeads(res.data.leads);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch(() => toast.error('Failed to load leads'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
    getCustomers({ limit: 500 }).then((res) => setCustomers(res.data.customers || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchLeads(1, statusFilter);
  }, [statusFilter]);

  const handleCreate = (data) => {
    setSubmitting(true);
    createLead(data)
      .then(() => {
        setShowForm(false);
        fetchLeads(1, statusFilter);
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
        fetchLeads(page, statusFilter);
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
        fetchLeads(page, statusFilter);
        toast.success('Lead deleted');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Delete failed'));
  };

  const handleStatusChange = (lead, newStatus) => {
    updateLead(lead._id, { status: newStatus })
      .then(() => fetchLeads(page, statusFilter))
      .catch((err) => toast.error(err.response?.data?.message || 'Update failed'));
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteLeadId || !noteText.trim()) return;
    addLeadNote(noteLeadId, noteText.trim())
      .then(() => {
        setNoteLeadId(null);
        setNoteText('');
        fetchLeads(page, statusFilter);
        toast.success('Note added');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to add note'));
  };

  return (
    <div className="container page-padding">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}
      >
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Leads
        </h1>
        <motion.button
          type="button"
          className="btn btn-primary"
          onClick={() => { setShowForm(true); setEditing(null); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Add lead
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
        className="card"
        style={{ marginBottom: '1rem' }}
      >
        <div className="form-group" style={{ marginBottom: 0, maxWidth: 300 }}>
          <label>Filter by Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {loading ? (
        <SkeletonTable rows={8} />
      ) : leads.length === 0 ? (
        <EmptyState
          icon="leads"
          title={statusFilter ? 'No leads in this status' : 'No leads yet'}
          description={statusFilter ? `No leads with status "${statusFilter}". Try another filter.` : 'Add your first lead to start tracking deals.'}
          actionLabel={statusFilter ? undefined : '+ Add lead'}
          onAction={statusFilter ? undefined : () => { setShowForm(true); setEditing(null); }}
        />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card table-responsive"
            style={{ overflowX: 'auto', padding: 0 }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', width: 48 }}></th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Title</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Customer</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Value</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {leads.map((lead, index) => (
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ background: '#f8fafc' }}
                      style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}
                    >
                      <td data-label="Image" style={{ padding: '1rem', width: 48 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: 'var(--cream-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {(lead.image || lead.customer?.image) ? (
                            <img src={lead.image || lead.customer?.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{lead.title?.charAt(0).toUpperCase() || '?'}</span>
                          )}
                        </div>
                      </td>
                      <td data-label="Title" style={{ padding: '1rem', fontWeight: 500 }}>{lead.title}</td>
                      <td data-label="Customer" style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{lead.customer?.name || '–'}</td>
                      <td data-label="Status" style={{ padding: '1rem' }}>
                        <motion.select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead, e.target.value)}
                          whileFocus={{ scale: 1.02 }}
                          style={{
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.875rem',
                            borderRadius: 4,
                            border: `2px solid ${statusColors[lead.status] || 'var(--border-light)'}`,
                            background: statusBgColors[lead.status] || 'var(--bg-main)',
                            color: statusColors[lead.status] || 'var(--text-primary)',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </motion.select>
                      </td>
                      <td data-label="Value" style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {lead.value != null ? `₹${Number(lead.value).toLocaleString()}` : '–'}
                      </td>
                      <td data-label="Actions" style={{ padding: '1rem' }}>
                        <motion.button
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginRight: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                          onClick={() => { setEditing(lead); setShowForm(false); }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginRight: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                          onClick={() => setSummaryLead(lead)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Summary
                        </motion.button>
                        <motion.button
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginRight: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                          onClick={() => setNoteLeadId(lead._id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Note
                        </motion.button>
                        <motion.button
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginRight: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                          onClick={() => setEmailLead(lead)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Email
                        </motion.button>
                        <motion.button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                          onClick={() => handleDelete(lead._id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Delete
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          <AnimatePresence>
            {noteLeadId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="card"
                style={{ marginTop: '1.5rem' }}
              >
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Add Note</h3>
                <form onSubmit={handleAddNote}>
                  <div className="form-group">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={3}
                      placeholder="Enter note text..."
                      required
                      autoFocus
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <motion.button
                      type="submit"
                      className="btn btn-primary"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Add Note
                    </motion.button>
                    <motion.button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => { setNoteLeadId(null); setNoteText(''); }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1.5rem', justifyContent: 'center' }}
            >
              <motion.button
                type="button"
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => fetchLeads(page - 1, statusFilter)}
                whileHover={{ scale: page <= 1 ? 1 : 1.05 }}
                whileTap={{ scale: page <= 1 ? 1 : 0.95 }}
              >
                Previous
              </motion.button>
              <span style={{ padding: '0 1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Page {page} of {totalPages} ({total} total)
              </span>
              <motion.button
                type="button"
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => fetchLeads(page + 1, statusFilter)}
                whileHover={{ scale: page >= totalPages ? 1 : 1.05 }}
                whileTap={{ scale: page >= totalPages ? 1 : 0.95 }}
              >
                Next
              </motion.button>
            </motion.div>
          )}
        </>
      )}

      {emailLead && (
        <EmailModal
          to={emailLead.customer?.email}
          leadId={emailLead._id}
          customerId={emailLead.customer?._id}
          onClose={() => setEmailLead(null)}
          onSent={() => fetchLeads(page, statusFilter)}
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
