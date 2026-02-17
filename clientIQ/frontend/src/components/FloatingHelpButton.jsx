import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IconHelpCircle } from './Icons';
import FAQHelp from './FAQHelp';

export default function FloatingHelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Help & FAQ"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--black-main)',
          color: '#fffefb',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          zIndex: 999,
        }}
      >
        <IconHelpCircle size={28} strokeWidth={2} />
      </motion.button>
      <FAQHelp open={open} onClose={() => setOpen(false)} />
    </>
  );
}
