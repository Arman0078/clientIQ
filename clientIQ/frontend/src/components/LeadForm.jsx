import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ImageUpload from './ImageUpload';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'];

export default function LeadForm({ lead, customers = [], users = [], onSubmit, onCancel, submitting }) {
  const [title, setTitle] = useState('');
  const [customer, setCustomer] = useState('');
  const [status, setStatus] = useState('New');
  const [value, setValue] = useState('');
  const [winProbability, setWinProbability] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [image, setImage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lead) {
      setTitle(lead.title || '');
      setCustomer(lead.customer?._id || lead.customer || '');
      setStatus(lead.status || 'New');
      setValue(lead.value ?? '');
      setWinProbability(lead.winProbability ?? '');
      setAssignedTo(lead.assignedTo?._id || lead.assignedTo || '');
      setImage(lead.image || '');
    }
    setErrors({});
  }, [lead]);

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!customer) next.customer = 'Please select a customer';
    const wp = winProbability === '' ? null : Number(winProbability);
    if (wp != null && (isNaN(wp) || wp < 0 || wp > 100)) next.winProbability = 'Enter 0–100';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      title: title.trim(),
      customer: customer || undefined,
      status,
      value: value === '' ? 0 : Number(value),
      winProbability: winProbability === '' ? undefined : Number(winProbability),
      assignedTo: assignedTo || undefined,
      image: image || undefined,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="form-group"
      >
        <label>Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((prev) => ({ ...prev, title: undefined })); }}
          placeholder="Lead title"
          className={errors.title ? 'input-error' : ''}
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="form-group"
      >
        <label>Customer *</label>
        <select
          value={customer}
          onChange={(e) => { setCustomer(e.target.value); if (errors.customer) setErrors((prev) => ({ ...prev, customer: undefined })); }}
          className={errors.customer ? 'input-error' : ''}
        >
          <option value="">Select customer</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>{c.name} – {c.email}</option>
          ))}
        </select>
        {errors.customer && <span className="field-error">{errors.customer}</span>}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="form-group"
      >
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="form-group"
      >
        <label>Value (₹)</label>
        <input type="number" min={0} step={0.01} value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="form-group"
      >
        <label>Win Probability (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={winProbability}
          onChange={(e) => { setWinProbability(e.target.value); if (errors.winProbability) setErrors((prev) => ({ ...prev, winProbability: undefined })); }}
          placeholder="0–100"
          className={errors.winProbability ? 'input-error' : ''}
        />
        {errors.winProbability && <span className="field-error">{errors.winProbability}</span>}
      </motion.div>
      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
        >
          <ImageUpload label="Image" value={image} onChange={setImage} size={80} shape="rounded" />
        </motion.div>
      {users.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="form-group"
        >
          <label>Assigned to</label>
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}
      >
        <motion.button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          whileHover={{ scale: submitting ? 1 : 1.02 }}
          whileTap={{ scale: submitting ? 1 : 0.98 }}
        >
          {submitting ? (
            <>
              <span className="loading-spinner" style={{ marginRight: '0.5rem' }}></span>
              Saving...
            </>
          ) : (
            lead ? 'Update Lead' : 'Create Lead'
          )}
        </motion.button>
        {onCancel && (
          <motion.button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        )}
      </motion.div>
    </form>
  );
}
