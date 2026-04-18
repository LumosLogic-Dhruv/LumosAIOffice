const mongoose = require('mongoose');

const CustomFieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldType: { type: String, enum: ['text', 'number', 'date'], required: true }
});

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logoUrl: { type: String },
  cloudinaryLogoPublicId: { type: String },
  address: { type: String },
  phone: { type: String },
  email: { type: String, required: true },
  website: { type: String },
  gstNumber: { type: String },
  defaultTerms: { type: String },
  defaultNotes: { type: String },
  customFields: [CustomFieldSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', CompanySchema);
