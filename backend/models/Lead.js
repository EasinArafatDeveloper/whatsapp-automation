const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerNumber: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      default: 'Valued Customer',
    },
    summary: {
      type: String,
      default: 'Customer Inquiry',
    },
    intentLabel: {
      type: String,
      default: '💬 General Inquiry',
    },
    priority: {
      type: String,
      enum: ['New', 'Warm Lead', 'Hot Lead', 'Urgent'],
      default: 'New',
    },
    location: {
      type: String,
      default: 'Not specified',
    },
    details: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Confirmed', 'Closed'],
      default: 'New',
    },
    lastMessage: {
      type: String,
      default: '',
    },
    messageCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Compound index: unique lead per user+customerNumber, plus fast sort by user+updatedAt
leadSchema.index({ user: 1, customerNumber: 1 }, { unique: true });
leadSchema.index({ user: 1, updatedAt: -1 });
leadSchema.index({ user: 1, priority: 1 });

module.exports = mongoose.model('Lead', leadSchema);
