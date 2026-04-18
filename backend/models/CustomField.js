const mongoose = require('mongoose');

const CustomFieldSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  fieldName: { type: String, required: true },
  fieldType: { type: String, enum: ['text', 'number', 'date'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CustomField', CustomFieldSchema);
