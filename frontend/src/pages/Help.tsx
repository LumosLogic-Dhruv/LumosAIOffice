import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const BRAND = '#714B67';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const FAQ_SECTIONS: FAQSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I create my first document?',
        answer:
          'Click "Create Document" in the sidebar to open the document builder. Choose a document type (Quotation, Invoice, etc.), fill in client details, add your line items from the catalog or manually, and click Generate. Your AI-powered document will be ready in seconds.',
      },
      {
        question: 'Can I invite team members?',
        answer:
          'Yes. Navigate to the Team page from the sidebar. Click "Invite Member", enter their email address, and assign them a role (Admin or Member). They will receive an email invitation to join your workspace.',
      },
      {
        question: 'How do I set my company branding?',
        answer:
          'Go to Company Profile in the sidebar. There you can upload your company logo, set your business name, email, address, and customize your brand color theme. These details are automatically applied to all documents you generate.',
      },
    ],
  },
  {
    title: 'Documents',
    items: [
      {
        question: 'What document types are supported?',
        answer:
          'DocuFlow AI supports Quotations, Proforma Invoices, GST Invoices, Purchase Orders, Work Orders, Salary Slips, Form 16, Experience Letters, Offer Letters, NDAs, and more. New templates are added regularly.',
      },
      {
        question: 'How does AI generation work?',
        answer:
          'When you provide client details, select items from your catalog, and choose a document type, our AI model composes a professionally formatted document with accurate line items, totals, tax calculations, and standard terms. You can review and edit the result before saving or sending.',
      },
      {
        question: 'Can I edit documents manually?',
        answer:
          'Yes. After a document is generated you can edit any field — line items, quantities, rates, terms, and notes — directly in the document editor. Changes are saved immediately and version history is tracked.',
      },
      {
        question: 'How do I share a document?',
        answer:
          'Open any document and click the Share button. You will get a unique shareable link that you can send to your client. They can view and download the document without needing a DocuFlow account. You can also send it directly via email from the document page.',
      },
    ],
  },
  {
    title: 'E-Signature',
    items: [
      {
        question: 'How do e-signatures work?',
        answer:
          'When you send a document for signature, your client receives a secure link. They open the document, review it, and draw or type their signature in the designated field. The signed document is timestamped and stored securely. You are notified once they sign.',
      },
      {
        question: 'Are e-signatures legally binding in India?',
        answer:
          'Yes. Under the Information Technology Act, 2000, electronic signatures are legally valid in India for most commercial contracts. DocuFlow AI uses audit trails, timestamps, and IP logging to ensure signatures are enforceable. For highly regulated transactions (e.g., property deeds), consult a legal advisor.',
      },
    ],
  },
  {
    title: 'Billing & Account',
    items: [
      {
        question: 'How do I change my password?',
        answer:
          'Go to Company Profile in the sidebar and scroll down to the Security section. Enter your current password and your new password (minimum 8 characters), then click Update Password. If you have forgotten your current password, sign out and use the "Forgot Password" link on the login page.',
      },
      {
        question: 'How do I delete my account?',
        answer:
          'Go to Company Profile, scroll to the Danger Zone section, and click "Delete Account". You will be asked to type DELETE to confirm. This permanently removes your account, all documents, clients, and catalog data. This action cannot be undone, so please export any data you need first.',
      },
    ],
  },
];

const AccordionItem = ({ question, answer }: FAQItem) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 px-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-800">{question}</span>
        {open
          ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

const Help = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#F3EDF1' }}
        >
          <HelpCircle size={18} style={{ color: BRAND }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Help & FAQ</h1>
          <p className="text-xs text-gray-400 mt-0.5">Answers to common questions about DocuFlow AI</p>
        </div>
      </div>

      {/* FAQ Sections */}
      {FAQ_SECTIONS.map((section) => (
        <div key={section.title} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Section header */}
          <div
            className="px-5 py-3 border-b border-gray-100"
            style={{ backgroundColor: '#FAFAFA' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: BRAND }}>
              {section.title}
            </h2>
          </div>

          {/* Items */}
          <div>
            {section.items.map((item) => (
              <AccordionItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      ))}

      {/* Contact footer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">Still have questions?</p>
          <p className="text-xs text-gray-400 mt-0.5">Our support team is happy to help.</p>
        </div>
        <a
          href="mailto:support@lumoslogic.com"
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
          style={{ backgroundColor: BRAND }}
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default Help;
