import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActivities } from '../services/api';
import { Skeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { ACTIVITY_ICON_MAP, IconCircle } from '../components/Icons';

const TYPE_LABELS = {
  customer_created: 'Customer created',
  customer_updated: 'Customer updated',
  customer_deleted: 'Customer deleted',
  lead_created: 'Lead created',
  lead_updated: 'Lead updated',
  lead_deleted: 'Lead deleted',
  lead_status_changed: 'Status changed',
  lead_note_added: 'Note added',
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString();
}

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [entityFilter, setEntityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchActivities = (p = page, entity = entityFilter) => {
    setLoading(true);
    const params = { page: p, limit: 15 };
    if (entity) params.entityType = entity;
    getActivities(params)
      .then((res) => {
        setActivities(res.data.activities);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    fetchActivities(1, entityFilter);
  }, [entityFilter]);

  return (
    <div className="container page-padding">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}
      >
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Activity
        </h1>
        <div className="form-group" style={{ marginBottom: 0, maxWidth: 200 }}>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem' }}
          >
            <option value="">All</option>
            <option value="Customer">Customers</option>
            <option value="Lead">Leads</option>
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid var(--cream-border)' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                <Skeleton height={20} style={{ width: '80%', marginBottom: '0.5rem' }} />
                <Skeleton height={14} style={{ width: '40%' }} />
              </div>
            ))}
          </div>
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          icon="activity"
          title="No activity yet"
          description="Create customers and leads to see your timeline here."
          actionLabel="View customers"
          actionTo="/crm/customers"
        />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ padding: 0 }}
          >
            <div style={{ position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid var(--cream-border)', marginLeft: '1rem' }}>
              <AnimatePresence>
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.03 }}
                    style={{
                      position: 'relative',
                      paddingBottom: '1.5rem',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: '-2.25rem',
                        top: '0.25rem',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: 'var(--black-main)',
                        border: '2px solid var(--bg-card)',
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: 4,
                          background: 'var(--cream-accent)',
                          border: '1px solid var(--cream-border)',
                          flexShrink: 0,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {(() => {
                          const IconComponent = ACTIVITY_ICON_MAP[activity.type] || IconCircle;
                          return <IconComponent size={16} strokeWidth={2} />;
                        })()}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {activity.description}
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {activity.createdBy?.name || 'You'} · {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
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
                onClick={() => fetchActivities(page - 1, entityFilter)}
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
                onClick={() => fetchActivities(page + 1, entityFilter)}
                whileHover={{ scale: page >= totalPages ? 1 : 1.05 }}
                whileTap={{ scale: page >= totalPages ? 1 : 0.95 }}
              >
                Next
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
