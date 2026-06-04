# QuotationMaker - Technical Documentation & Feature Specification

## 📑 1. System Overview
QuotationMaker is an AI-first document automation platform. It bridges the gap between generic word processors and rigid ERP systems by using LLMs (Large Language Models) to understand business requirements and generate structured, professional documents.

---

## 🛠️ 2. Technical Architecture

### 🛡️ Core Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite.
- **Backend:** Node.js (Express), MongoDB (Mongoose), Puppeteer (PDF Engine).
- **AI Engine:** Python (FastAPI), Google Gemini Pro, Pydantic.
- **Storage:** Cloudinary (Logo & PDF hosting).

### 🔄 Data Flow
1. **Request:** User submits raw text (AI Mode) or fills a form (Manual Mode).
2. **Intelligence:** The Python AI Service parses the input into a structured JSON schema based on the document type (e.g., Quotation vs NDA).
3. **Persistence:** Backend validates and saves the document in MongoDB, creating a new entry in `versionHistory`.
4. **Rendering:** The `pdfService` triggers Puppeteer to render a custom HTML template with the document data and company branding.
5. **Delivery:** The PDF is uploaded to Cloudinary, and the user receives a secure link for viewing/downloading.

---

## ✨ 3. Feature Matrix

### 🟢 Phase 1: Core AI & Document Management (Implemented)
- **AI Generation:** Transform "Need a website for ₹50k" into a 5-section professional quotation.
- **AI Refinement:** Natural language instructions to "Add a 10% discount" or "Make it more formal".
- **Dynamic Templates:** Automatic branding with company logos and details.
- **Version Control:** Automatic snapshots of every edit, allowing users to restore previous versions.
- **PDF Engine:** High-fidelity conversion of web views into print-ready documents.

### 🟡 Phase 2: Enhanced Manual Control (In-Progress)
- **Block-Based Editor:** Users can add/remove sections, reorder content blocks, and insert custom tables.
- **Interactive Tables:** Excel-like functionality within the document to add rows, columns, and auto-calculate subtotals.
- **Rich Text Support:** Support for bold, italics, and lists within document sections.

### 🔵 Phase 3: Financial & Global Integration (Agreed)
- **Smart Tax Engine:**
  - Automated calculation of GST/VAT based on the client's location and tax ID.
  - Item-wise vs. Total-wise tax application.
- **Multi-Currency System:**
  - Support for USD, EUR, INR, etc., with real-time exchange rate fetching.
  - Localization of date and number formats (e.g., ₹1,00,000 vs $100,000.00).

---

## 🗄️ 4. Data Models (Simplified)

### **Document Model**
```json
{
  "title": "String",
  "type": "Enum (quotation, invoice, etc.)",
  "clientName": "String",
  "data": {
    "sections": [{ "heading": "String", "content": "String" }],
    "tables": [{ "title": "String", "headers": [], "rows": [[]] }],
    "summary": { "Subtotal": "Number", "Tax": "Number", "Total": "Number" },
    "terms": "String"
  },
  "pdfUrl": "String (Cloudinary)",
  "versionHistory": "Array of Previous States"
}
```

### **Company Model**
```json
{
  "name": "String",
  "logoUrl": "String",
  "address": "String",
  "gstNumber": "String",
  "defaultTerms": "String",
  "customFields": "Array for specialized business data"
}
```

---

## 🚦 5. Implementation Roadmap (Execution Plan)

1. **Week 1:** Implementation of the **Enhanced Manual Editor** (React Drag-and-Drop + Dynamic Tables).
2. **Week 2:** Integration of **Razorpay/Stripe API** and Webhooks for payment status tracking.
3. **Week 3:** Deployment of the **Global Tax Engine** and Multi-Currency support.
4. **Week 4:** Final QA, PDF template refinement for financial data, and Beta Launch.

---

## 🏁 6. Conclusion
QuotationMaker is designed to be the "Canva for Business Documents"—where the design is handled by AI, and the business logic is handled by a robust financial engine.
