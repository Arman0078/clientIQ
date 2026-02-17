import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/useAuth';
import { IconInfinity, IconMenu, IconX } from './Icons';

const NAV_BREAKPOINT = 900;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isWide, setIsWide] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= NAV_BREAKPOINT : true));

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= NAV_BREAKPOINT);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isWide) setMobileOpen(false);
  }, [isWide]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/crm/dashboard', label: 'Dashboard' },
    { to: '/crm/customers', label: 'Customers' },
    { to: '/crm/leads', label: 'Leads' },
    { to: '/crm/pipeline', label: 'Pipeline' },
    { to: '/crm/activities', label: 'Activity' },
    { to: '/crm/tasks', label: 'Tasks' },
    { to: '/crm/reports', label: 'Reports' },
    { to: '/crm/settings', label: 'Settings' },
    ...(user?.role === 'admin' ? [{ to: '/crm/admin', label: 'Admin' }] : []),
  ];

  const linkStyle = (to) => ({
    color: location.pathname === to ? 'var(--black-main)' : 'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight: location.pathname === to ? 600 : 500,
    padding: '0.625rem 1rem',
    borderRadius: '6px',
    background: location.pathname === to ? 'var(--cream-accent)' : 'transparent',
    boxShadow: location.pathname === to ? 'inset 0 -2px 0 0 var(--black-main)' : 'none',
    transition: 'all 0.2s ease',
    display: 'block',
  });

  const navContent = (
    <>
      {navLinks.map((link) => (
        <Link key={link.to} to={link.to} style={linkStyle(link.to)} onClick={() => setMobileOpen(false)}>
          {link.label}
        </Link>
      ))}
      <Link to="/crm/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid var(--border-light)', marginTop: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'var(--black-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.name?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{user?.name}</span>
      </Link>
      <button type="button" onClick={handleLogout} className="btn btn-secondary" style={{ margin: '0.5rem 1rem', width: 'calc(100% - 2rem)' }}>
        Logout
      </button>
    </>
  );

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      style={{
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        padding: '0.75rem 0',
        boxShadow: 'var(--shadow-soft)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', position: 'relative' }}>
        <Link to="/crm/dashboard" style={{ color: 'var(--black-main)', fontWeight: 700, fontSize: '1.25rem', textDecoration: 'none', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <IconInfinity size={24} strokeWidth={2} />
          <span className="nav-brand-text">ClientIQ</span>
        </Link>

        {isWide ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} style={linkStyle(link.to)}>
                {link.label}
              </Link>
            ))}
            <Link to="/crm/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--black-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{user?.name}</span>
            </Link>
            <motion.button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="btn btn-secondary"
              style={{ padding: '0.5rem', minWidth: 44, minHeight: 44 }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <IconX size={22} /> : <IconMenu size={22} />}
            </button>
            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.75rem)',
                    left: '1rem',
                    right: '1rem',
                    background: 'var(--bg-card)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 0' }}>
                    {navContent}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.nav>
  );
}
