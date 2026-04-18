const express = require('express');
const router = express.Router();
const { 
  getCompanyProfile, 
  updateCompanyProfile, 
  updateLogo,
  addCustomField,
  removeCustomField
} = require('../controllers/companyController');
const { auth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', auth, getCompanyProfile);
router.put('/update', auth, updateCompanyProfile);
router.put('/logo', auth, upload.single('logo'), updateLogo);
router.post('/custom-fields', auth, addCustomField);
router.delete('/custom-fields/:fieldId', auth, removeCustomField);

module.exports = router;
