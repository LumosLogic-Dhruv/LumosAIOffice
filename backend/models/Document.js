const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  pdfUrl: { type: String },
  cloudinaryPdfPublicId: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

const DocumentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  type: { 
    type: String, 
    required: true,
    enum: [
      'quotation', 'invoice', 'proforma_invoice', 'receipt', 
      'proposal', 'sow', 'timeline', 'agreement', 'nda'
    ]
  },
  title: { type: String, required: true },
  clientName: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  pdfUrl: { type: String },
  cloudinaryPdfPublicId: { type: String },
  versionHistory: [VersionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
DocumentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Document', DocumentSchema);
