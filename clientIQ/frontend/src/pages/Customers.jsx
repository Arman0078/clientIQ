import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';
import CustomerForm from '../components/CustomerForm';
import EmailModal from '../components/EmailModal';
import SummaryModal from '../components/SummaryModal';
import ConfirmModal from '../components/ConfirmModal';
import { SkeletonTable } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export default function Customers() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [emailCustomer, setEmailCustomer] = useState(null);
  const [summaryCustomer, setSummaryCustomer] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = (p = page, s = search) => {
    setLoading(true);
    getCustomers({ page: p, limit: 10, search: s })
      .then((res) => {
        setCustomers(res.data.customers);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(1, search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleCreate = (data) => {
    setSubmitting(true);
    createCustomer(data)
      .then(() => {
        setShowForm(false);
        fetchCustomers(1, search);
        toast.success('Customer created');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Create failed'))
      .finally(() => setSubmitting(false));
  };

  const handleUpdate = (data) => {
    if (!editing) return;
    setSubmitting(true);
    updateCustomer(editing._id, data)
      .then(() => {
        setEditing(null);
        fetchCustomers(page, search);
        toast.success('Customer updated');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Update failed'))
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    deleteCustomer(confirmDelete)
      .then(() => {
        setConfirmDelete(null);
        fetchCustomers(page, search);
        toast.success('Customer deleted');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Delete failed'));
  };

  return (
    <div className="container page-padding">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}
      >
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Customers
        </h1>
        <motion.button
          type="button"
          className="btn btn-primary"
          onClick={() => { setShowForm(true); setEditing(null); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Add customer
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
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>New Customer</h2>
            <CustomerForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} submitting={submitting} />
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
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>Edit Customer</h2>
            <CustomerForm customer={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} submitting={submitting} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card"
        style={{ marginBottom: '1rem' }}
      >
        <div className="form-group" style={{ marginBottom: 0, maxWidth: 400 }}>
          <label>Search Customers</label>
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {loading ? (
        <SkeletonTable rows={8} />
      ) : customers.length === 0 ? (
        <EmptyState
          icon="customers"
          title={search ? 'No matches' : 'No customers yet'}
          description={search ? 'Try a different search term.' : 'Add your first customer to start building your CRM.'}
          actionLabel={search ? undefined : '+ Add customer'}
          onAction={search ? undefined : () => { setShowForm(true); setEditing(null); }}
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
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Company</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {customers.map((c, index) => (
                    <motion.tr
                      key={c._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ background: '#f8fafc' }}
                      style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}
                    >
                      <td data-label="Photo" style={{ padding: '1rem', width: 48 }}>
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
                          {c.image ? (
                            <img src={c.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{c.name?.charAt(0).toUpperCase() || '?'}</span>
                          )}
                        </div>
                      </td>
                      <td data-label="Name" style={{ padding: '1rem', fontWeight: 500 }}>{c.name}</td>
                      <td data-label="Email" style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{c.email}</td>
                      <td data-label="Phone" style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{c.phone || '–'}</td>
                      <td data-label="Company" style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{c.company || '–'}</td>
                      <td data-label="Actions" style={{ padding: '1rem' }}>
                        <motion.button
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginRight: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                          onClick={() => { setEditing(c); setShowForm(false); }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginRight: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                          onClick={() => setSummaryCustomer(c)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Summary
                        </motion.button>
                        <motion.button
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginRight: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                          onClick={() => setEmailCustomer(c)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Email
                        </motion.button>
                        <motion.button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                          onClick={() => handleDelete(c._id)}
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
                onClick={() => fetchCustomers(page - 1, search)}
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
                onClick={() => fetchCustomers(page + 1, search)}
                whileHover={{ scale: page >= totalPages ? 1 : 1.05 }}
                whileTap={{ scale: page >= totalPages ? 1 : 0.95 }}
              >
                Next
              </motion.button>
            </motion.div>
          )}
        </>
      )}

      {emailCustomer && (
        <EmailModal
          to={emailCustomer.email}
          customerId={emailCustomer._id}
          onClose={() => setEmailCustomer(null)}
          onSent={() => fetchCustomers(page, search)}
        />
      )}
      {summaryCustomer && (
        <SummaryModal
          customerId={summaryCustomer._id}
          customerName={summaryCustomer.name}
          onClose={() => setSummaryCustomer(null)}
        />
      )}
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete customer"
        message="Are you sure you want to delete this customer? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
