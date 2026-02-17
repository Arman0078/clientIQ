import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTasks, createTask, updateTask, deleteTask, getCustomers, getLeads } from '../services/api';
import { Skeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export default function Tasks() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', customerId: '', leadId: '' });

  const fetchTasks = (p = page, f = filter) => {
    setLoading(true);
    const params = { page: p, limit: 15 };
    if (f === 'pending') params.completed = 'false';
    if (f === 'completed') params.completed = 'true';
    getTasks(params)
      .then((res) => {
        setTasks(res.data.tasks);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
    getCustomers({ limit: 500 }).then((r) => setCustomers(r.data.customers || [])).catch(() => {});
    getLeads({ limit: 500 }).then((r) => setLeads(r.data.leads || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchTasks(1, filter);
  }, [filter]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    createTask({
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || undefined,
      priority: form.priority,
      customerId: form.customerId || undefined,
      leadId: form.leadId || undefined,
    })
      .then(() => {
        setShowForm(false);
        setForm({ title: '', description: '', dueDate: '', priority: 'medium', customerId: '', leadId: '' });
        fetchTasks(1, filter);
        toast.success('Task created');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to create'))
      .finally(() => setSubmitting(false));
  };

  const handleToggle = (task) => {
    updateTask(task._id, { completed: !task.completed })
      .then(() => {
        fetchTasks(page, filter);
        toast.success(task.completed ? 'Task reopened' : 'Task completed');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to update'));
  };

  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    deleteTask(confirmDelete)
      .then(() => {
        setConfirmDelete(null);
        fetchTasks(page, filter);
        toast.success('Task deleted');
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to delete'));
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '–');

  return (
    <div className="container page-padding">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}
      >
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tasks</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 4 }}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <motion.button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Add task
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card"
            style={{ marginBottom: '1.5rem' }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>New Task</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Task title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Optional description"
                />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Due date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Customer</label>
                  <select value={form.customerId} onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}>
                    <option value="">None</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Lead</label>
                  <select value={form.leadId} onChange={(e) => setForm((f) => ({ ...f, leadId: e.target.value }))}>
                    <option value="">None</option>
                    {leads.map((l) => (
                      <option key={l._id} value={l._id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="card" style={{ padding: '1rem' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
              <Skeleton width={18} height={18} style={{ borderRadius: 4 }} />
              <Skeleton height={20} style={{ flex: 1 }} />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="tasks"
          title="No tasks yet"
          description="Add a task to stay on top of your work."
          actionLabel="+ Add task"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 0 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <AnimatePresence>
              {tasks.map((task, i) => (
                <motion.li
                  key={task._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggle(task)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 500, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{task.description}</p>
                    )}
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {task.customer?.name && `Customer: ${task.customer.name} · `}
                      {task.lead?.title && `Lead: ${task.lead.title} · `}
                      Due: {formatDate(task.dueDate)} · {task.priority}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    className="btn btn-danger"
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                    onClick={() => handleDelete(task._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete
                  </motion.button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', padding: '1rem' }}>
              <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => fetchTasks(page - 1, filter)}>Previous</button>
              <span style={{ padding: '0 1rem', alignSelf: 'center', color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
              <button type="button" className="btn btn-secondary" disabled={page >= totalPages} onClick={() => fetchTasks(page + 1, filter)}>Next</button>
            </div>
          )}
        </motion.div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete task"
        message="Are you sure you want to delete this task? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
