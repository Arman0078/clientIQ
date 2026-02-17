import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendEmail as apiSendEmail, draftEmail as apiDraftEmail } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function EmailModal({ to, customerId, leadId, onClose, onSent }) {
  const toast = useToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!to?.trim()) {
      setError('No recipient email address');
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setError('Subject and body are required');
      return;
    }
    setSubmitting(true);
    try {
      await apiSendEmail({
        to: to || '',
        subject: subject.trim(),
        body: body.trim(),
        customerId: customerId || undefined,
        leadId: leadId || undefined,
      });
      toast.success('Email sent');
      onSent?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraftWithAI = async () => {
    if (!customerId && !leadId) {
      toast.error('No contact selected');
      return;
    }
    setDrafting(true);
    setError('');
    try {
      const { data } = await apiDraftEmail({ customerId: customerId || undefined, leadId: leadId || undefined });
      setSubject(data.subject || '');
      setBody(data.body || '');
      toast.success('Draft generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate draft');
    } finally {
      setDrafting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="card"
          style={{ maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto' }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Send Email</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>To</label>
              <input type="email" value={to || ''} readOnly style={{ background: 'var(--bg-main)', cursor: 'not-allowed' }} />
            </div>
            <div className="form-group form-group-row">
              <div style={{ flex: 1 }}>
                <label>Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" required />
              </div>
              <motion.button
                type="button"
                className="btn btn-secondary"
                onClick={handleDraftWithAI}
                disabled={drafting || (!customerId && !leadId)}
                style={{ whiteSpace: 'nowrap', padding: '0.625rem 1rem' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {drafting ? 'Drafting...' : 'Draft with AI'}
              </motion.button>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Your message..." required />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
