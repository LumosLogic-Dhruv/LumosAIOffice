const Document = require('../models/Document');
const Company = require('../models/Company');
const aiService = require('../services/aiService');
const pdfService = require('../services/pdfService');
const templateService = require('../services/templateService');
const { cloudinary } = require('../config/cloudinary');

const DEFAULT_TERMS = {
  quotation: 'All prices are valid for 30 days. 50% advance payment is required to initiate the project. Balance 50% upon completion.',
  invoice: 'Payment is due within 7 days of the invoice date. A late fee of 2% per month may apply to overdue balances.',
  proforma_invoice: 'This is a proforma invoice for your reference. Final invoice will be generated upon receipt of payment.',
  receipt: 'Thank you for your payment. This is an official receipt of the transaction.',
  proposal: 'This proposal is valid for 15 days. Detailed deliverables and timelines will be finalized upon acceptance.',
  sow: 'Work will be performed as per the scope defined. Any additional requirements will be treated as a separate change request.',
  agreement: 'This agreement is subject to the terms of the signed master contract. Governing law: Republic of India.',
  nda: 'All information disclosed remains strictly confidential. This obligation persists for 3 years from the date of disclosure.',
  timeline: 'Timelines are estimates based on current capacity. Delays in feedback or assets may shift the final delivery date.'
};

// Helper to update PDF in Cloudinary
const syncPDF = async (company, document) => {
  try {
    // 1. Delete old PDF if it exists
    if (document.cloudinaryPdfPublicId) {
      await cloudinary.uploader.destroy(document.cloudinaryPdfPublicId, { resource_type: 'image' });
    }

    // 2. Generate and upload new PDF
    const htmlContent = templateService.generateHTML(company, document);
    const fileName = `${document.type}_${document._id}_${Date.now()}`;
    const result = await pdfService.generatePDF(htmlContent, fileName);

    // 3. Update document with new details
    document.pdfUrl = result.secure_url;
    document.cloudinaryPdfPublicId = result.public_id;
    await document.save();
  } catch (error) {
    console.error('PDF Sync Error:', error.message);
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id, 
      companyId: req.user.companyId 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const company = await Company.findById(req.user.companyId);
    await syncPDF(company, document);

    res.json({ pdfUrl: document.pdfUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processAI = async (req, res) => {
  try {
    const { type, rawText } = req.body;
    const company = await Company.findById(req.user.companyId);
    
    const aiData = await aiService.processAIDocument(
      type, 
      rawText, 
      company.name, 
      company.customFields
    );

    // Inject default terms if not provided by AI
    if (!aiData.terms) {
      aiData.terms = DEFAULT_TERMS[type] || company.defaultTerms;
    }
    
    res.json(aiData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editAI = async (req, res) => {
  try {
    const { instruction } = req.body;
    const document = await Document.findOne({ 
      _id: req.params.id, 
      companyId: req.user.companyId 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const company = await Company.findById(req.user.companyId);
    
    const updatedData = await aiService.editAIDocument(
      document.type,
      instruction,
      document.data,
      company.customFields
    );

    // Save as new version
    document.versionHistory.push({
      data: document.data,
      pdfUrl: document.pdfUrl,
      cloudinaryPdfPublicId: document.cloudinaryPdfPublicId,
      updatedAt: document.updatedAt
    });

    document.data = updatedData;
    await document.save();

    // Auto-sync PDF after AI update
    await syncPDF(company, document);

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const { type, title, clientName, data } = req.body;

    // Ensure data has default terms
    if (!data.terms) {
      const company = await Company.findById(req.user.companyId);
      data.terms = DEFAULT_TERMS[type] || company.defaultTerms;
    }

    const document = await Document.create({
      companyId: req.user.companyId,
      type,
      title,
      clientName,
      data
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ companyId: req.user.companyId })
      .sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id, 
      companyId: req.user.companyId 
    });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id, 
      companyId: req.user.companyId 
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Move current state to history before update
    document.versionHistory.push({
      data: document.data,
      pdfUrl: document.pdfUrl,
      cloudinaryPdfPublicId: document.cloudinaryPdfPublicId,
      updatedAt: document.updatedAt
    });

    // Update with new data
    document.data = req.body.data || document.data;
    document.title = req.body.title || document.title;
    document.clientName = req.body.clientName || document.clientName;
    document.pdfUrl = req.body.pdfUrl || document.pdfUrl;
    document.cloudinaryPdfPublicId = req.body.cloudinaryPdfPublicId || document.cloudinaryPdfPublicId;

    await document.save();

    const company = await Company.findById(req.user.companyId);
    await syncPDF(company, document);

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocumentHistory = async (req, res) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id, 
      companyId: req.user.companyId 
    }).select('versionHistory');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document.versionHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
