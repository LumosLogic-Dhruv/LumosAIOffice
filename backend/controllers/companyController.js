const Company = require('../models/Company');
const { cloudinary } = require('../config/cloudinary');

exports.getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      req.body,
      { new: true }
    );
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLogo = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);

    // Delete old logo from Cloudinary if exists
    if (company.cloudinaryLogoPublicId) {
      await cloudinary.uploader.destroy(company.cloudinaryLogoPublicId);
    }

    // New logo details from multer-storage-cloudinary
    company.logoUrl = req.file.path;
    company.cloudinaryLogoPublicId = req.file.filename;
    
    await company.save();
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addCustomField = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    company.customFields.push(req.body);
    await company.save();
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeCustomField = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    company.customFields = company.customFields.filter(
      (field) => field._id.toString() !== req.params.fieldId
    );
    await company.save();
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
