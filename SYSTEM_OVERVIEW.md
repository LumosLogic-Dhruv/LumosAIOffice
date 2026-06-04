# QuotationMaker - AI Document Automation System

## 🚀 Overview
QuotationMaker is a comprehensive platform designed to streamline the creation and management of professional business documents. By leveraging Google Gemini AI, it transforms raw text requirements into structured, polished documents like quotations, invoices, and proposals in seconds.

## 🏗️ Architecture
The system follows a modern microservices-inspired architecture:

### 1. Frontend (React + TypeScript + Vite)
- **UI/UX:** Built with Tailwind CSS and Framer Motion for a sleek, responsive, and animated experience.
- **State Management:** React Context API for Authentication.
- **Validation:** Zod and React Hook Form for robust data handling.
- **Key Pages:** Dashboard, Company Profile, Document Creator (AI & Manual), Document History, and Interactive Previews.

### 2. Backend (Node.js + Express)
- **Database:** MongoDB (Mongoose) for flexible document storage.
- **File Storage:** Cloudinary integration for company logos and generated PDFs.
- **PDF Generation:** Puppeteer-based service to convert HTML templates into professional PDFs.
- **Security:** JWT-based authentication and Bcrypt for password hashing.

### 3. AI Service (Python + FastAPI)
- **Engine:** Google Gemini Pro (via `google-genai`).
- **Functionality:** 
  - `generate-document`: Parses raw user input into structured JSON for various document types.
  - `edit-document`: Applies AI-driven modifications to existing documents based on natural language instructions.

---

## ✨ Current Features
- **AI-Powered Generation:** Describe your project in plain language, and the AI handles the structure, items, and pricing logic.
- **Multi-Type Documents:** Support for Quotations, Invoices, Proposals, SOWs, NDAs, and Agreements.
- **Company Branding:** Customizable company profiles with logos, GST, address, and default terms.
- **Dynamic Editing:** Real-time document editing with AI assistance or manual overrides.
- **Professional PDF Export:** High-quality PDF generation with automated Cloudinary hosting.
- **Version Control:** Track changes and maintain history for every document.

---

## 🛠️ Planned Features & Missing Capabilities

### 1. Proper Manual Editor (Enhanced)
- **Goal:** Upgrade the current manual edit mode into a full-featured document builder.
- **Details:** 
  - Ability to add, remove, and reorder sections.
  - Dynamic table management: Add/remove rows and columns manually.
  - Customizable summary fields (Tax, Discount, Grand Total, etc.).
  - Rich text support for section content.
  - the Current AI genertion should be as it is just some new features 

### 2. Client Management (CRM)
- **Goal:** Move from "Client Name" strings to a full CRM.
- **Details:** Store client contact info, address, tax IDs, and document history per client.

### 3. Communication & Automation
- **Direct Emailing:** Send PDFs directly to clients with tracking (sent/opened).
- **Automated Follow-ups:** Reminders for pending quotations or unpaid invoices.

### 3. Financial Integration
- **Tax Engine:** Automated calculation of GST/VAT/Sales Tax based on client location. or manually set that 
- **Multi-Currency:** Support for international transactions with real-time conversion. or manually chaneg currency 

### 4. Advanced Document Features
- **E-Signatures:** Built-in digital signature support for NDAs and Agreements.
- **Product Catalog:** A reusable library of services and products to quickly build documents.
- **Template Library:** Multiple visual themes (Modern, Minimal, Corporate) for different business needs.

### 5. Analytics & Insights
- **Dashboard Metrics:** Total revenue, conversion rates (Quotation ⮕ Invoice), and top-selling services.
- **Exporting:** Export data to Excel/CSV for accounting software like Tally or QuickBooks.

### 6. Team & Collaboration
- **Multi-User Access:** RBAC (Role-Based Access Control) for teams (Admin, Manager, Viewer).
- **Collaboration Comments:** Internal notes and comments on document drafts.
- **Link Sharing:** The System User can also Share the link of the generated document to anyone and that user can see it without need of login in the system 

---

## 📈 Why QuotationMaker?
Most document tools are either too manual (Word/Excel) or too rigid. QuotationMaker bridges the gap by using **Generative AI** as a co-pilot, allowing business owners to focus on their clients while the system handles the administrative heavy lifting.
