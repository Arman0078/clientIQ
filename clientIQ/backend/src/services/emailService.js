import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host || host === 'smtp.example.com') {
    throw new Error('SMTP not configured. Set SMTP_HOST in .env (e.g. smtp.gmail.com for Gmail)');
  }
  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  });
  return transporter;
};

export const sendEmail = async (to, subject, body, from = 'ClientIQ <noreply@clientiq.com>') => {
  const transport = getTransporter();
  const info = await transport.sendMail({
    from,
    to,
    subject,
    text: body.replace(/<[^>]*>/g, ''),
    html: body.includes('<') ? body : `<p>${body.replace(/\n/g, '<br>')}</p>`,
  });
  return info;
};
