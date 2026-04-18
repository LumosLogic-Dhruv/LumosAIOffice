const mongoose = require('mongoose');

const CostItemSchema = new mongoose.Schema({
  item: String,
  price: Number
});

const QuotationSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  projectName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  features: [String],
  costBreakdown: [CostItemSchema],
  totalCost: Number,
  overview: String,
  timeline: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quotation', QuotationSchema);
