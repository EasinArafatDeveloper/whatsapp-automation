const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    trim: true,
  },
  reply: {
    type: String,
    required: true,
  },
});

const businessSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      default: 'My Business',
      trim: true,
    },
    agentName: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    products: {
      type: String,
      default: '',
    },
    faq: {
      type: String,
      default: '',
    },
    policies: {
      type: String,
      default: '',
    },
    tone: {
      type: String,
      default: 'friendly and professional',
    },
    accountType: {
      type: String,
      enum: ['business', 'influencer', 'freelancer', 'personal'],
      default: 'business',
    },
    toneMode: {
      type: String,
      enum: ['auto', 'friendly', 'professional', 'casual_fun'],
      default: 'auto',
    },
    customInstructions: {
      type: String,
      default: '',
    },
    aiEnabled: {
      type: Boolean,
      default: true,
    },
    templates: [templateSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Business', businessSchema);
