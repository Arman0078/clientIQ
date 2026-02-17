import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { summarizeContact } from '../services/api';
import { IconFileText } from './Icons';

export default function SummaryModal({ customerId, leadId, customerName, leadTitle, onClose }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!customerId && !leadId) return;
    setLoading(true);
    setError('');
    summarizeContact({ customerId: customerId || undefined, leadId: leadId || undefined })
      .then(({ data }) => setSummary(data.summary || ''))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load summary');
      })
      .finally(() => setLoading(false));
  }, [customerId, leadId]);

  const title = leadTitle || customerName || 'Contact Summary';

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <IconFileText size={24} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>AI Summary: {title}</h2>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '2rem', color: 'var(--text-secondary)' }}>
              <div className="loading-spinner" style={{ borderColor: 'var(--black-main)', borderTopColor: 'var(--black-main)' }} />
              <span>Generating summary...</span>
            </div>
          ) : error ? (
            <p className="error-msg">{error}</p>
          ) : (
            <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {summary}
            </p>
          )}
          <div style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
