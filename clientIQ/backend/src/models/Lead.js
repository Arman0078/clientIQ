import mongoose from 'mongoose';

const leadStatuses = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'];

const leadNoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const leadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lead title is required'],
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    status: {
      type: String,
      enum: leadStatuses,
      default: 'New',
    },
    value: {
      type: Number,
      default: 0,
    },
    winProbability: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    notes: [leadNoteSchema],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
export { leadStatuses };
