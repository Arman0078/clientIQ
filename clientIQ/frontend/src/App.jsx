import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/useAuth';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Leads from './pages/Leads';
import Activities from './pages/Activities';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import Pipeline from './pages/Pipeline';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import FloatingHelpButton from './components/FloatingHelpButton';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
        </motion.div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/crm/dashboard" replace />;
  return (
    <>
      <Navbar />
      <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}>
        {children}
      </motion.div>
    </>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
        </motion.div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
        </motion.div>
      </div>
    );
  }
  if (user) return <Navigate to="/crm/dashboard" replace />;
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  
  return (
    <>
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/crm/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/crm/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
        <Route path="/crm/leads" element={<PrivateRoute><Leads /></PrivateRoute>} />
        <Route path="/crm/activities" element={<PrivateRoute><Activities /></PrivateRoute>} />
        <Route path="/crm/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
        <Route path="/crm/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/crm/pipeline" element={<PrivateRoute><Pipeline /></PrivateRoute>} />
        <Route path="/crm/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/crm/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
    <FloatingHelpButton />
    </>
  );
}
