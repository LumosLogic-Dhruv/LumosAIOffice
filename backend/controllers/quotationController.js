const Quotation = require('../models/Quotation');
const aiService = require('../services/aiService');
const pdfService = require('../services/pdfService');

exports.createQuotation = async (req, res) => {
  try {
    const quotation = new Quotation(req.body);
    await quotation.save();
    res.status(201).json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteQuotation = async (req, res) => {
  try {
    await Quotation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quotation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processAI = async (req, res) => {
  try {
    const { rawText } = req.body;
    const result = await aiService.processRequirement(rawText);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    const pdfBuffer = await pdfService.generateQuotationPDF(quotation);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=quotation-${quotation._id}.pdf`,
      'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};
