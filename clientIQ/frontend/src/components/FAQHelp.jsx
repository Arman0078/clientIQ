import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconHelpCircle } from './Icons';

const FAQ_ITEMS = [
  {
    q: 'How do I get started with ClientIQ?',
    a: 'After signing up, go to Dashboard for an overview. Add your first customer from the Customers page, then create leads and move them through the Pipeline. Use Tasks to set reminders and Activity to track all touchpoints.',
  },
  {
    q: 'How do I add a new customer?',
    a: 'Go to Customers and click "Add customer". Fill in name, email, phone, and company. You can add more details later. Each customer can have multiple leads and activities linked to them.',
  },
  {
    q: 'What is the difference between Customers and Leads?',
    a: 'Customers are your contacts or companies. Leads are potential deals or opportunities—each lead belongs to a customer and has a status (New, Contacted, Qualified, Proposal, Negotiation, Won, Lost). Use Leads to track the sales process.',
  },
  {
    q: 'How does the Pipeline work?',
    a: 'The Pipeline shows your leads as cards in columns by status. Drag and drop cards between columns to update status. Click a card to view or edit the lead. Add new leads from the Leads page—they appear in the Pipeline automatically.',
  },
  {
    q: 'How do I create and manage tasks?',
    a: 'Go to Tasks and click "Add task". Set a title, due date, and link it to a lead or customer. Mark tasks complete when done. Overdue tasks are highlighted so you never miss a follow-up.',
  },
  {
    q: 'What does the Activity timeline show?',
    a: 'Activity shows a chronological log of everything: new customers, lead updates, status changes, notes, emails, and completed tasks. Use it to see the full history of any customer or lead at a glance.',
  },
  {
    q: 'How do I use Reports?',
    a: 'Reports shows charts and metrics: lead conversion by status, pipeline value, and activity over time. Use it to track performance and spot trends. Admin users get additional team and user statistics.',
  },
  {
    q: 'What AI features are available?',
    a: 'ClientIQ can draft emails and generate contact summaries. When viewing a customer or lead, look for "Draft email" or "AI summary" options. These use your existing data to save time on outreach and research.',
  },
  {
    q: 'How do I delete a lead or customer?',
    a: 'Open the lead or customer and click the delete option (trash icon). You will be asked to confirm. Deletion is permanent—related activities and tasks may be affected.',
  },
];

const WELCOME_MSG = "Hi! I'm your ClientIQ helper. Click a question below to get the answer.";

export default function FAQHelp({ open, onClose }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'bot', text: WELCOME_MSG }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendQuestion = (idx) => {
    const item = FAQ_ITEMS[idx];
    if (!item) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: item.q },
      { role: 'bot', text: item.a },
    ]);
  };

  return (
    <AnimatePresence>
      {open && (
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
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{
              maxWidth: 480,
              width: '100%',
              height: 'min(600px, 85vh)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: 0,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--cream-border)',
                flexShrink: 0,
                background: 'var(--bg-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--cream-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconHelpCircle size={20} style={{ color: 'var(--black-main)' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>ClientIQ Helper</h2>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Choose a question</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <IconX size={22} />
              </button>
            </div>

            {/* Chat messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: 'var(--bg-main)',
              }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '90%',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 12,
                        fontSize: '0.875rem',
                        lineHeight: 1.55,
                        background: msg.role === 'user' ? 'var(--black-main)' : 'var(--bg-card)',
                        color: msg.role === 'user' ? '#fffefb' : 'var(--text-primary)',
                        border: msg.role === 'bot' ? '1px solid var(--cream-border)' : 'none',
                        boxShadow: msg.role === 'bot' ? 'var(--shadow-soft)' : 'none',
                      }}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Fixed question options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Choose a question
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {FAQ_ITEMS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendQuestion(idx)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8125rem',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--cream-border)',
                        borderRadius: 8,
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                        maxWidth: '100%',
                      }}
                    >
                      {item.q.length > 50 ? item.q.slice(0, 50) + '…' : item.q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
