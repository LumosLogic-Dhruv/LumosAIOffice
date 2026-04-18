const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

router.post('/create', quotationController.createQuotation);
router.get('/all', quotationController.getAllQuotations);
router.get('/:id', quotationController.getQuotationById);
router.put('/:id', quotationController.updateQuotation);
router.delete('/:id', quotationController.deleteQuotation);
router.post('/download/:id', quotationController.downloadPDF);

// AI processing route
router.post('/ai/process', quotationController.processAI);

module.exports = router;
