import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ICON_MAP } from './Icons';

export default function EmptyState({ icon, title, description, actionLabel, actionTo, onAction, compact }) {
  const iconKey = icon || 'default';
  const IconComponent = ICON_MAP[iconKey] || ICON_MAP.default;
  const iconSize = compact ? 48 : 64;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{
        textAlign: 'center',
        padding: compact ? '2rem' : '3rem 2rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        style={{
          marginBottom: '1rem',
          lineHeight: 1,
          opacity: 0.5,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconComponent size={iconSize} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
      </motion.div>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
        {description}
      </p>
      {(actionLabel && (actionTo || onAction)) && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: '1.5rem' }}
        >
          {actionTo ? (
            <Link to={actionTo} className="btn btn-primary">
              {actionLabel}
            </Link>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
