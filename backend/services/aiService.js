const axios = require('axios');

const AI_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

exports.processAIDocument = async (type, rawText, companyName, customFields) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/generate-document`, {
      type,
      raw_text: rawText,
      company_name: companyName,
      custom_fields: customFields
    });
    return response.data;
  } catch (error) {
    console.error('AI Service Error:', error.message);
    throw new Error('Failed to process AI document');
  }
};

exports.editAIDocument = async (type, instruction, existingData, customFields) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/edit-document`, {
      type,
      instruction,
      existing_data: existingData,
      custom_fields: customFields
    });
    return response.data;
  } catch (error) {
    console.error('AI Service Edit Error:', error.message);
    throw new Error('Failed to edit AI document');
  }
};
