import React from 'react';

export function Skeleton({ width, height, style, className }) {
  return (
    <div
      className={className}
      style={{
        width: width || '100%',
        height: height || 20,
        background: 'linear-gradient(90deg, var(--cream-accent) 25%, var(--cream-border) 50%, var(--cream-accent) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        borderRadius: 'var(--radius-sm)',
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <Skeleton height={32} style={{ marginBottom: '1rem' }} />
      <Skeleton height={20} style={{ marginBottom: '0.5rem', width: '80%' }} />
      <Skeleton height={20} style={{ width: '60%' }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Skeleton height={24} style={{ flex: 1 }} />
          <Skeleton height={24} style={{ flex: 1 }} />
          <Skeleton height={24} style={{ flex: 1 }} />
          <Skeleton height={24} style={{ flex: 1 }} />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: '1rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <Skeleton height={24} style={{ flex: 1 }} />
          <Skeleton height={24} style={{ flex: 1 }} />
          <Skeleton height={24} style={{ flex: 1 }} />
          <Skeleton height={24} style={{ flex: 1 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="container" style={{ padding: '2.5rem 2rem' }}>
      <Skeleton height={40} width={200} style={{ marginBottom: '2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
