import Email from '../models/Email.js';
import { sendEmail } from '../services/emailService.js';
import { logActivity } from '../utils/logActivity.js';

export const sendEmailToContact = async (req, res) => {
  try {
    const { to, subject, body, customerId, leadId } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ message: 'To, subject, and body are required' });
    }
    const from = `ClientIQ <${req.user.email}>`;
    await sendEmail(to, subject, body, from);

    const email = await Email.create({
      to,
      from,
      subject,
      body,
      customer: customerId || undefined,
      lead: leadId || undefined,
      status: 'sent',
      createdBy: req.user._id,
    });
    await logActivity('email_sent', 'Email', email._id, `Sent email to ${to}: ${subject}`, req.user._id);
    res.status(201).json(email);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getEmails = async (req, res) => {
  try {
    const { customerId, leadId } = req.query;
    const pageNum = Math.max(1, parseInt(req.query.page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const filter = { createdBy: req.user._id };
    if (customerId) filter.customer = customerId;
    if (leadId) filter.lead = leadId;
    const skip = (pageNum - 1) * limitNum;
    const [emails, total] = await Promise.all([
      Email.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Email.countDocuments(filter),
    ]);
    res.json({ emails, page: pageNum, totalPages: Math.ceil(total / limitNum), total });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
