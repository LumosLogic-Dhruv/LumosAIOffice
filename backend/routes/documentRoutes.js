const express = require('express');
const router = express.Router();
const { 
  createDocument, 
  getDocuments, 
  getDocumentById, 
  updateDocument,
  getDocumentHistory,
  processAI,
  editAI,
  generatePDF
} = require('../controllers/documentController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createDocument);
router.get('/', auth, getDocuments);
router.post('/process-ai', auth, processAI);
router.post('/:id/edit-ai', auth, editAI);
router.post('/:id/generate-pdf', auth, generatePDF);
router.get('/:id', auth, getDocumentById);
router.put('/:id', auth, updateDocument);
router.get('/:id/history', auth, getDocumentHistory);

module.exports = router;
