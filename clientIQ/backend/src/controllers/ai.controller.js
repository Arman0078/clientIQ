import mongoose from 'mongoose';
import { google } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import Customer from '../models/Customer.js';
import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';
import Email from '../models/Email.js';
import Task from '../models/Task.js';

function isValidObjectId(id) {
  return id && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
}

async function getContactContext(customerId, leadId) {
  const customer = customerId && isValidObjectId(customerId)
    ? await Customer.findById(customerId).lean()
    : null;
  const lead = leadId && isValidObjectId(leadId)
    ? await Lead.findById(leadId).populate('customer', 'name email company').lean()
    : null;
  const cid = customer?._id || lead?.customer?._id;
  const lid = lead?._id;

  const orConditions = [
    ...(cid ? [{ entityType: 'Customer', entityId: cid }] : []),
    ...(lid ? [{ entityType: 'Lead', entityId: lid }] : []),
  ].filter(Boolean);

  const [activities, emails, tasks] = orConditions.length > 0
    ? await Promise.all([
        Activity.find({ $or: orConditions }).sort({ createdAt: -1 }).limit(15).lean(),
        Email.find({
          $or: [
            ...(cid ? [{ customer: cid }] : []),
            ...(lid ? [{ lead: lid }] : []),
          ].filter(Boolean),
        }).sort({ createdAt: -1 }).limit(5).lean(),
        Task.find({
          $or: [
            ...(cid ? [{ customer: cid }] : []),
            ...(lid ? [{ lead: lid }] : []),
          ].filter(Boolean),
        }).sort({ dueDate: 1 }).limit(10).lean(),
      ])
    : [[], [], []];

  return {
    customer: customer || lead?.customer,
    lead,
    activities: activities.map((a) => ({ type: a.type, description: a.description, date: a.createdAt })),
    emails: emails.map((e) => ({ to: e.to, subject: e.subject, date: e.createdAt })),
    tasks: tasks.map((t) => ({ title: t.title, completed: t.completed, dueDate: t.dueDate })),
    leadNotes: lead?.notes?.map((n) => n.text) || [],
  };
}

function buildContextString(ctx) {
  const parts = [];
  if (ctx.customer) {
    parts.push(`Customer: ${ctx.customer.name} (${ctx.customer.email})${ctx.customer.company ? `, Company: ${ctx.customer.company}` : ''}`);
  }
  if (ctx.lead) {
    parts.push(`Lead: ${ctx.lead.title}, Status: ${ctx.lead.status}, Value: ₹${ctx.lead.value || 0}`);
  }
  if (ctx.leadNotes?.length) {
    parts.push(`Lead notes: ${ctx.leadNotes.join('; ')}`);
  }
  if (ctx.activities?.length) {
    parts.push(`Recent activity: ${ctx.activities.map((a) => `${a.description} (${new Date(a.date).toLocaleDateString()})`).join('. ')}`);
  }
  if (ctx.emails?.length) {
    parts.push(`Recent emails: ${ctx.emails.map((e) => `${e.subject} to ${e.to}`).join('; ')}`);
  }
  if (ctx.tasks?.length) {
    parts.push(`Tasks: ${ctx.tasks.map((t) => `${t.title}${t.completed ? ' (done)' : ''}`).join('; ')}`);
  }
  return parts.join('\n');
}

export const draftEmail = async (req, res) => {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return res.status(503).json({ message: 'AI not configured. Set GOOGLE_GENERATIVE_AI_API_KEY in .env' });
    }
    const { customerId, leadId } = req.body;
    if (!customerId && !leadId) {
      return res.status(400).json({ message: 'customerId or leadId required' });
    }

    const ctx = await getContactContext(customerId, leadId);
    const contextStr = buildContextString(ctx);
    const recipient = ctx.customer?.name || ctx.lead?.title || 'Contact';

    const { output } = await generateText({
      model: google('gemini-2.5-flash'),
      output: Output.object({
        schema: z.object({
          subject: z.string().describe('Short, professional email subject line'),
          body: z.string().describe('Professional email body, 2-4 paragraphs'),
        }),
      }),
      system: 'You are a helpful CRM assistant. Draft professional, friendly sales/relationship emails. Be concise and actionable.',
      prompt: `Draft a follow-up email to ${recipient} based on this CRM context:\n\n${contextStr}\n\nGenerate a subject line and email body.`,
    });

    res.json({ subject: output.subject, body: output.body });
  } catch (error) {
    console.error('[AI draftEmail]', error);
    res.status(500).json({ message: error.message || 'AI draft failed' });
  }
};

export const summarizeContact = async (req, res) => {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return res.status(503).json({ message: 'AI not configured. Set GOOGLE_GENERATIVE_AI_API_KEY in .env' });
    }
    const { customerId, leadId } = req.body;
    if (!customerId && !leadId) {
      return res.status(400).json({ message: 'customerId or leadId required' });
    }

    const ctx = await getContactContext(customerId, leadId);
    const contextStr = buildContextString(ctx);

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: 'You are a CRM assistant. Summarize contact history in 2-4 concise sentences. Highlight key facts, last contact, and suggested next action.',
      prompt: `Summarize this contact/lead:\n\n${contextStr}`,
    });

    res.json({ summary: text });
  } catch (error) {
    console.error('[AI summarizeContact]', error);
    res.status(500).json({ message: error.message || 'AI summary failed' });
  }
};
