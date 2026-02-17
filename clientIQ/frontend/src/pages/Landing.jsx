import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/useAuth';
import { IconInfinity, IconUser, IconClipboard, IconCheck, IconActivity, IconChart } from '../components/Icons';

const features = [
  { icon: IconUser, title: 'Customers', desc: 'Manage contacts and build lasting relationships.' },
  { icon: IconClipboard, title: 'Leads & Pipeline', desc: 'Track deals from first contact to close.' },
  { icon: IconActivity, title: 'Activity Timeline', desc: 'See every touchpoint in one place.' },
  { icon: IconCheck, title: 'Tasks & Reminders', desc: 'Never miss a follow-up.' },
  { icon: IconChart, title: 'Reports & AI', desc: 'Insights and AI-powered summaries.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 14 },
  },
};

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="loading-spinner"
          style={{ borderColor: 'var(--black-main)', borderTopColor: 'var(--black-main)' }}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', overflow: 'hidden' }}>
      {/* Decorative background elements */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'var(--mint-green)',
            filter: 'blur(80px)',
          }}
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            opacity: [0.02, 0.05, 0.02],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'var(--black-main)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Top bar */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 50,
          background: 'rgba(250, 248, 245, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--cream-border)',
        }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--black-main)' }}>
            <IconInfinity size={28} strokeWidth={2} />
            <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>ClientIQ</span>
          </Link>
        </motion.div>
        {user ? (
          <motion.button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/crm/dashboard')}
            style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem' }}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            Dashboard →
          </motion.button>
        ) : (
          <motion.div style={{ display: 'flex', gap: '1rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <motion.span
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.25rem', display: 'inline-block' }}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign in
              </motion.span>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <motion.span
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem', display: 'inline-block' }}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Get started
              </motion.span>
            </Link>
          </motion.div>
        )}
      </motion.header>

      {/* Hero */}
      <section
        style={{
          minHeight: '70vh',
          padding: '88px 2rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ textAlign: 'center', maxWidth: 800 }}
        >
          <motion.div
            variants={itemVariants}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <IconInfinity size={56} strokeWidth={2} style={{ color: 'var(--black-main)' }} />
            </motion.div>
            <span style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.05em', color: 'var(--black-main)' }}>
              ClientIQ
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            style={{
              fontSize: 'clamp(2.75rem, 6.5vw, 4.5rem)',
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              margin: '0 0 1rem',
            }}
          >
            Smarter CRM for
            <br />
            <motion.span
              variants={itemVariants}
              style={{
                color: 'var(--black-main)',
                borderBottom: '4px solid var(--mint-green)',
                paddingBottom: '0.08em',
                display: 'inline-block',
              }}
            >
              modern teams
            </motion.span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            style={{
              fontSize: '1.35rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              margin: '0 auto 1.75rem',
              maxWidth: 560,
            }}
          >
            Manage customers, leads, and deals in one place. With AI-powered insights and a streamlined pipeline.
          </motion.p>

          {user ? (
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/crm/dashboard')}
                style={{ padding: '1.125rem 2.25rem', fontSize: '1.125rem' }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                Go to Dashboard →
              </motion.button>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <motion.span
                  className="btn btn-primary"
                  style={{ padding: '1.125rem 2.25rem', fontSize: '1.125rem', display: 'inline-block', textDecoration: 'none', color: '#fffefb' }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign in
                </motion.span>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <motion.span
                  className="btn btn-secondary"
                  style={{
                    padding: '1.125rem 2.25rem',
                    fontSize: '1.125rem',
                    display: 'inline-block',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '2px solid var(--black-main)',
                  }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get started
                </motion.span>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Features */}
      <section
        style={{
          padding: '2.5rem 2rem 3rem',
          maxWidth: 1200,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ type: 'spring', stiffness: 80, damping: 16 }}
          style={{
            textAlign: 'center',
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            fontWeight: 700,
            marginBottom: '2rem',
            color: 'var(--text-primary)',
          }}
        >
          Everything you need
        </motion.h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                type: 'spring',
                stiffness: 80,
                damping: 14,
                delay: i * 0.06,
              }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <motion.div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'var(--cream-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <f.icon size={26} strokeWidth={2} style={{ color: 'var(--black-main)' }} />
              </motion.div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{f.title}</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      {!user && (
        <section
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'var(--cream-accent)',
            borderTop: '1px solid var(--cream-border)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 80, damping: 16 }}
          >
            <p style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Ready to grow your business?
            </p>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <motion.span
                className="btn btn-primary"
                style={{ padding: '1rem 2rem', fontSize: '1.125rem', display: 'inline-block', textDecoration: 'none', color: '#fffefb' }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Create free account
              </motion.span>
            </Link>
          </motion.div>
        </section>
      )}

      {/* Footer */}
      <footer
        style={{
          padding: '2.5rem 2rem',
          borderTop: '1px solid var(--cream-border)',
          background: 'var(--bg-card)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconInfinity size={24} strokeWidth={2} style={{ color: 'var(--black-main)' }} />
            <span style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.5px', color: 'var(--black-main)' }}>
              ClientIQ
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: 400 }}>
            Smarter CRM for modern teams. Manage customers, leads, and deals in one place.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Sign in
            </Link>
            <Link to="/register" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Get started
            </Link>
            {user && (
              <Link to="/crm/dashboard" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Dashboard
              </Link>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} ClientIQ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
