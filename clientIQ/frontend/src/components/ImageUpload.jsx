import React, { useState, useRef, useId } from 'react';
import { motion } from 'framer-motion';
import { IconPlus, IconX } from './Icons';
import { uploadToCloudinary } from '../utils/cloudinary';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_SIZE_MB = 5;

export default function ImageUpload({ value, onChange, label = 'Image', size = 96, shape = 'circle', forRegister = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const inputId = useId();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Max size ${MAX_SIZE_MB}MB`);
      return;
    }
    if (!ACCEPT.split(',').some((t) => file.type === t.trim())) {
      setError('Use JPEG, PNG, WebP or GIF');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, { forRegister });
      onChange?.(url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = () => onChange?.('');

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div
          style={{
            width: size,
            height: size,
            borderRadius: shape === 'circle' ? '50%' : 'var(--radius-md)',
            overflow: 'hidden',
            background: 'var(--cream-accent)',
            border: '2px dashed var(--cream-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {value ? (
            <img
              src={value}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : uploading ? (
            <span className="loading-spinner" style={{ borderColor: 'var(--black-main)' }} />
          ) : (
            <IconPlus size={24} style={{ color: 'var(--text-muted)' }} />
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleFile}
            disabled={uploading}
            style={{ display: 'none' }}
            id={inputId}
          />
          <motion.label
            htmlFor={inputId}
            className="btn btn-secondary"
            style={{ cursor: uploading ? 'not-allowed' : 'pointer', padding: '0.5rem 1rem', fontSize: '0.875rem', margin: 0 }}
            whileHover={uploading ? {} : { scale: 1.02 }}
            whileTap={uploading ? {} : { scale: 0.98 }}
          >
            {uploading ? 'Uploading...' : value ? 'Change' : 'Upload'}
          </motion.label>
          {value && (
            <motion.button
              type="button"
              className="btn btn-secondary"
              onClick={remove}
              disabled={uploading}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconX size={16} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
              Remove
            </motion.button>
          )}
        </div>
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
