import mongoose from 'mongoose';

const activityTypes = [
  'customer_created',
  'customer_updated',
  'customer_deleted',
  'lead_created',
  'lead_updated',
  'lead_deleted',
  'lead_status_changed',
  'lead_note_added',
  'email_sent',
  'task_created',
  'task_completed',
];

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: activityTypes,
      required: true,
    },
    entityType: {
      type: String,
      enum: ['Customer', 'Lead', 'Email', 'Task'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'entityType',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

activitySchema.index({ entityType: 1, entityId: 1 });
activitySchema.index({ createdBy: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
export { activityTypes };
