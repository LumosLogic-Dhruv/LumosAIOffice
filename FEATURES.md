# DocuFlow AI — Feature Documentation

> A comprehensive overview of current features and a roadmap of high-value features to implement next.

---

## Current Features

### Document Management
- **AI Document Generation** — Describe a deal in plain language; Gemini 2.5 Flash generates a fully structured document (sections, tables, summary).
- **9 Document Types** — Quotation, Invoice, Proforma Invoice, Proposal, SOW, Agreement, NDA, Receipt, Timeline.
- **Manual Editing** — Inline edit any field (title, client, sections, table cells, terms) directly on the preview page.
- **AI Smart Editor** — Post-generation refinement via natural language instructions ("Add 18% GST", "Make tone formal").
- **Version History** — Every save creates a snapshot; owners can browse and compare previous versions.
- **PDF Generation & Download** — Auto-generated PDF stored on Cloudinary; downloadable or viewable in-browser.
- **Document Duplication** — One-click copy of any document.
- **Document Deletion** — Permanent delete with cascade cleanup.

### Sharing & Permissions
- **Public Share Links** — Generate a tokenised URL that lets anyone view a read-only document (no login required).
- **Edit Access Control** — Per-document permission toggle: *All Members Can Edit* vs *Owner Only*. Set from the document's "Edit Access" sidebar panel.

### Team & Workspace
- **Invite System** — Owner generates a unique invite code; employees register via `/register?invite=<code>`.
- **Role-Based Access** — Two roles: `admin` (owner) and `member`. Owners manage the workspace; members collaborate.
- **Member Management** — Owner can remove members at any time.
- **Activity Log** — Real-time audit trail visible to the owner showing who viewed, edited, AI-edited, shared, duplicated, or deleted each document.

### CRM — Clients
- **Client Profiles** — Store name, email, phone, address, GSTIN, and notes.
- **Quick-attach** — Select a client when creating a document to auto-fill client fields.

### Product Catalog
- **Catalog Items** — Manage products/services with name, description, unit, rate, and category.
- **AI Context** — Catalog data is passed to the AI prompt so generated documents can reference real prices and items.

### Company Profile
- **Profile Management** — Company name, email, phone, address, website, GST number.
- **Logo Upload** — Upload a company logo; it appears automatically on every generated document.
- **Custom Fields** — Define bespoke fields (text/number) injected into AI prompts for domain-specific output.
- **Default Terms** — Set company-wide T&C that appear on all new documents.

### Platform Admin Panel (separate app)
- **User Overview** — View all users across all companies; promote or delete accounts.
- **Company Overview** — Manage all registered companies.
- **Document Browser** — Inline PDF viewer for all documents across the platform.

---

## Suggested Features to Implement Next

These are ranked roughly by impact and feasibility for a document-automation SaaS.

### High Priority

| Feature | Description | Why |
|---|---|---|
| **Email Send from App** | Send a document directly to the client's email with a branded PDF attached — no download required. | Eliminates the copy-paste step; feels like a complete workflow. |
| **E-Signature Integration** | Let clients sign a document online (DocuSign/HelloSign/native canvas) before the deal is final. | Converts DocuFlow into a deal-closing tool, not just a generator. |
| **Client Portal** | Give each client a private link to view all documents shared with them, download PDFs, and sign. | High perceived value; differentiates from simple PDF tools. |
| **Document Expiry** | Auto-expire quotations after N days and notify the client and owner. | Standard for professional quotes; builds urgency. |
| **Multi-language Support** | Generate documents in any language the user specifies (e.g., Hindi, Arabic). | Gemini already supports this; just requires a prompt flag and UI toggle. |
| **Bulk Export** | Select multiple documents and download them as a ZIP of PDFs. | Common admin request, especially at month-end. |
| **Document Templates** | Save a partially filled document as a reusable template for future similar deals. | Saves time for repeat customers or standard projects. |

### Medium Priority

| Feature | Description | Why |
|---|---|---|
| **Dashboard Analytics** | Charts: documents created per month, types breakdown, average value, client activity. | Owners want to see business trends at a glance. |
| **Payment Status Tracking** | Mark invoices/receipts as Paid / Partial / Unpaid and track outstanding amounts. | Moves DocuFlow into light AR management territory. |
| **Approval Workflow** | Multi-step approval chain before a document is sent (e.g., salesperson → manager → CFO). | Required for mid-size businesses with sign-off requirements. |
| **Webhook / Zapier Integration** | Trigger external automations when a document is created, shared, signed, or paid. | Connects DocuFlow to CRMs, Slack, accounting tools, etc. |
| **Recurring Documents** | Auto-generate monthly invoices for retainer clients. | Recurring revenue visibility; saves manual work. |
| **Document Comments** | Internal threaded comments on a document visible only to team members. | Replaces email back-and-forth about changes needed. |
| **Currency & Tax Configurator** | Per-document currency selector (USD, EUR, GBP, INR, AED) and multi-tax line support. | Essential for international business. |
| **Two-Factor Authentication** | TOTP / OTP login for accounts. | Security hygiene; increasingly expected by business users. |

### Lower Priority / Future

| Feature | Description | Why |
|---|---|---|
| **Mobile App (PWA)** | Progressive web app so owners can generate and approve documents from a phone. | Mobile-first usage is growing even for B2B tools. |
| **Audit Log Export** | Export activity logs to CSV/Excel for compliance or accounting. | Requested by finance teams and auditors. |
| **White-label / Custom Domain** | Allow businesses to host DocuFlow at `docs.theircompany.com` with their branding. | Opens up reseller / agency channel. |
| **AI Auto-fill from CRM** | When a client is selected, AI pre-fills sections using past deal history. | Reduces time-to-quote significantly for repeat business. |
| **OCR — Upload & Convert** | Scan a paper document or existing PDF and convert it to an editable DocuFlow document. | Useful for migrating legacy contracts. |
| **Stripe / Razorpay Payment Links** | Embed a payment button in an invoice; client pays directly from the document. | Closes the loop between quote → invoice → payment. |
| **Granular Role Permissions** | Fine-grained permissions (e.g., member can create but not delete, or view only certain document types). | Required as teams grow. |

---

## Architecture Notes

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v3 → Firebase Hosting (`aidocs-lumoslogic`)
- **Backend**: Python FastAPI → Google Cloud Run (`docflowai`, `asia-south1`)
- **Database**: Convex (`stoic-weasel-322`, eu-west-1)
- **File Storage**: Cloudinary
- **AI**: Google Gemini 2.5 Flash
- **Brand Color**: `#714B67`
