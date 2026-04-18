const puppeteer = require('puppeteer');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

exports.generatePDF = async (htmlContent, fileName) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    printBackground: true
  });

  await browser.close();

  // Upload to Cloudinary
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'ai-office-pdfs',
        public_id: fileName,
        format: 'pdf'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(pdfBuffer);
  });
};
