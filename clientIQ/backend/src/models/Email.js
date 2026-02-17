import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    from: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    errorMessage: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

emailSchema.index({ customer: 1 });
emailSchema.index({ lead: 1 });
emailSchema.index({ createdBy: 1, createdAt: -1 });

const Email = mongoose.model('Email', emailSchema);
export default Email;
