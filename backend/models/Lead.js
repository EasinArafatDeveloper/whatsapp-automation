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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
