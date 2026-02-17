import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/useAuth';
import { updateProfile } from '../services/api';
import ImageUpload from '../components/ImageUpload';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await updateProfile({ name: name.trim(), avatar: avatar || '' });
      updateUser({ name: data.name, avatar: data.avatar });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: 480 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 style={{ marginTop: 0, marginBottom: '2rem', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Profile Settings
        </h1>
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your name"
            />
          </div>
          <div className="form-group">
            <ImageUpload
              label="Profile photo"
              value={avatar}
              onChange={setAvatar}
              size={96}
              shape="circle"
            />
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="error-msg"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ color: 'var(--mint-green)', marginBottom: '1rem' }}
              >
                {success}
              </motion.p>
            )}
          </AnimatePresence>
          <motion.button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={submitting}
            whileHover={submitting ? {} : { scale: 1.02 }}
            whileTap={submitting ? {} : { scale: 0.98 }}
          >
            {submitting ? (
              <>
                <span className="loading-spinner" style={{ marginRight: '0.5rem' }}></span>
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
