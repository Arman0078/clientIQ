import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ImageUpload from './ImageUpload';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CustomerForm({ customer, onSubmit, onCancel, submitting }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setCompany(customer.company || '');
      setNotes(customer.notes || '');
      setImage(customer.image || '');
    }
    setErrors({});
  }, [customer]);

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(email)) next.email = 'Enter a valid email address';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim(), company: company.trim(), notes: notes.trim(), image: image || '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="form-group"
      >
        <label>Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((prev) => ({ ...prev, name: undefined })); }}
          placeholder="Customer name"
          className={errors.name ? 'input-error' : ''}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="form-group"
      >
        <label>Email *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((prev) => ({ ...prev, email: undefined })); }}
          placeholder="customer@example.com"
          className={errors.email ? 'input-error' : ''}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="form-group"
      >
        <label>Phone</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="form-group"
      >
        <label>Company</label>
        <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <ImageUpload label="Photo" value={image} onChange={setImage} size={80} shape="circle" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="form-group"
      >
        <label>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Additional notes..." />
      </motion.div>
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
            customer ? 'Update Customer' : 'Create Customer'
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
