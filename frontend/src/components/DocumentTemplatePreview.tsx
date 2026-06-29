import React from 'react';

const GENERIC_SECTIONS: Record<string, { sections: string[]; hasTable: boolean; hasSummary: boolean }> = {
  quotation:         { sections: ['Project Overview', 'Scope of Work', 'Pricing Breakdown'], hasTable: true,  hasSummary: true  },
  invoice:           { sections: ['Invoice Details', 'Services Rendered'],                   hasTable: true,  hasSummary: true  },
  proforma_invoice:  { sections: ['Proforma Details', 'Delivery Terms'],                     hasTable: true,  hasSummary: true  },
  proposal:          { sections: ['Executive Summary', 'Proposed Solution', 'Investment'],    hasTable: false, hasSummary: false },
  sow:               { sections: ['Project Overview', 'Scope & Deliverables'],               hasTable: true,  hasSummary: false },
  agreement:         { sections: ['Parties & Background', 'Services & Obligations', 'Terms'],hasTable: false, hasSummary: false },
  nda:               { sections: ['Definition of Confidential Info', 'Obligations', 'Duration'], hasTable: false, hasSummary: false },
  receipt:           { sections: ['Receipt Details'],                                         hasTable: true,  hasSummary: true  },
  timeline:          { sections: ['Project Overview', 'Phase Breakdown'],                    hasTable: true,  hasSummary: false },
  offer_letter:      { sections: ['Position & Joining Details', 'Compensation & Benefits', 'Terms of Employment'], hasTable: true,  hasSummary: false },
  policy:            { sections: ['Purpose & Scope', 'Policy Statement', 'Responsibilities', 'Compliance'], hasTable: false, hasSummary: false },
  experience_letter: { sections: ['Employment Confirmation', 'Roles & Responsibilities', 'Character Assessment'], hasTable: false, hasSummary: false },
  service_agreement: { sections: ['Description of Services', 'Fees & Payment Schedule', 'Confidentiality & IP', 'Governing Law'], hasTable: true, hasSummary: false },
};

// ── Generic document template preview ──────────────────────────────────────

const GenericPreview = ({ color, type }: { color: string; type: string }) => {
  const cfg = GENERIC_SECTIONS[type] || { sections: ['Overview', 'Details'], hasTable: true, hasSummary: true };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '8.5px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
      {/* Header band */}
      <div style={{ background: color, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'white' }}>
        <div>
          <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', marginBottom: '6px' }} />
          <div style={{ fontSize: '7px', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {type.replace(/_/g, ' ')}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '7.5px', opacity: 0.9 }}>
          <div style={{ fontWeight: 700, fontSize: '10px' }}>Your Company Name</div>
          <div style={{ opacity: 0.85 }}>123 Business Park, City</div>
          <div style={{ opacity: 0.85 }}>+91 98765 43210</div>
          <div style={{ opacity: 0.85 }}>contact@company.com</div>
        </div>
      </div>

      {/* Title row */}
      <div style={{ padding: '12px 18px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #f3f4f6' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: '15px', color: '#111827', letterSpacing: '-0.5px' }}>Document Title</div>
          <div style={{ fontSize: '6.5px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>Client: CLIENT NAME</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '6.5px', color: '#9ca3af', textTransform: 'uppercase' }}>Date Issued</div>
          <div style={{ fontWeight: 700, fontSize: '9px', color: '#111827' }}>01/01/2025</div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ padding: '10px 18px' }}>
        {cfg.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: '9px' }}>
            <div style={{ fontWeight: 800, fontSize: '8.5px', color: '#111827', borderLeft: `2px solid ${color}`, paddingLeft: '6px', marginBottom: '3px' }}>{s}</div>
            <div style={{ fontSize: '7px', color: '#6b7280', lineHeight: 1.6 }}>
              {i === 0
                ? 'This section provides an overview of the key details and objectives related to this document.'
                : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.'}
            </div>
          </div>
        ))}

        {cfg.hasTable && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '7px', border: '1px solid #f3f4f6', borderRadius: '6px', overflow: 'hidden' }}>
            <thead>
              <tr>
                {['Description', 'Qty', 'Rate', 'Amount'].map(h => (
                  <th key={h} style={{ background: color, color: 'white', padding: '5px 7px', textAlign: 'left', fontWeight: 700, fontSize: '6.5px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[['Professional Services', '2', '₹25,000', '₹50,000'], ['Additional Module', '1', '₹15,000', '₹15,000']].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 1 ? '#fafafa' : 'white' }}>
                  {row.map((c, j) => <td key={j} style={{ padding: '4px 7px', color: '#374151', fontWeight: j === 3 ? 700 : 400 }}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {cfg.hasSummary && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <div style={{ width: '140px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', padding: '8px' }}>
              {[['Subtotal', '₹65,000'], ['Tax (18%)', '₹11,700'], ['Total', '₹76,700']].map(([k, v], i) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: i < 2 ? '1px solid #e5e7eb' : 'none', fontSize: '7px' }}>
                  <span style={{ color: '#6b7280', textTransform: 'uppercase', fontSize: '6.5px' }}>{k}</span>
                  <span style={{ fontWeight: i === 2 ? 900 : 700, fontSize: i === 2 ? '9px' : '7px' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 18px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
        <div>
          <div style={{ fontSize: '6px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '3px' }}>Authorized Signatory</div>
          <div style={{ fontWeight: 700, fontSize: '8px', color: '#111827' }}>Your Company Name</div>
          <div style={{ width: '60px', height: '18px', border: '1px dashed #e5e7eb', borderRadius: '4px', marginTop: '4px', background: '#f9fafb' }} />
        </div>
        <div style={{ textAlign: 'right', maxWidth: '140px' }}>
          <div style={{ fontSize: '6px', color: '#d1d5db', textTransform: 'uppercase', marginBottom: '3px' }}>Terms &amp; Conditions</div>
          <div style={{ fontSize: '6.5px', color: '#9ca3af', lineHeight: 1.5 }}>All prices are valid for 30 days. Payment due within 7 days of invoice date.</div>
        </div>
      </div>
    </div>
  );
};

// ── Form 16 preview ─────────────────────────────────────────────────────────

const Form16Preview = () => (
  <div style={{ fontFamily: 'Times New Roman, serif', fontSize: '8px', background: 'white', border: '1px solid #ccc' }}>
    <div style={{ textAlign: 'center', padding: '10px 14px 6px', borderBottom: '1px solid #000' }}>
      <div style={{ fontSize: '17px', fontWeight: 'bold', letterSpacing: '2px' }}>FORM 16</div>
      <div style={{ fontSize: '7px', color: '#555' }}>[See rule 31(1)(a)]</div>
      <div style={{ fontSize: '10px', fontWeight: 'bold', textDecoration: 'underline', margin: '5px 0 2px' }}>PART A</div>
      <div style={{ fontSize: '7.5px' }}>Certificate under section 203 of the Income-tax Act, 1961 for Tax deducted at source on Salary</div>
    </div>

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px' }}>
      <tbody>
        <tr>
          <th style={{ border: '1px solid #000', padding: '3px 6px', background: '#f5f5f5', width: '50%', textAlign: 'left', fontWeight: 'bold' }}>Name and address of the Employer</th>
          <th style={{ border: '1px solid #000', padding: '3px 6px', background: '#f5f5f5', width: '50%', textAlign: 'left', fontWeight: 'bold' }}>Name and designation of the Employee</th>
        </tr>
        <tr>
          <td style={{ border: '1px solid #000', padding: '3px 6px' }}>Your Company Ltd<br />Business Address, City - 400001</td>
          <td style={{ border: '1px solid #000', padding: '3px 6px' }}>Employee Full Name<br />Software Engineer</td>
        </tr>
      </tbody>
    </table>

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7px' }}>
      <tbody>
        <tr>
          <th style={{ border: '1px solid #000', padding: '3px 5px', background: '#f5f5f5', textAlign: 'left', fontWeight: 'bold' }}>PAN of the Deductor</th>
          <th style={{ border: '1px solid #000', padding: '3px 5px', background: '#f5f5f5', textAlign: 'left', fontWeight: 'bold' }}>TAN of the Deductor</th>
          <th style={{ border: '1px solid #000', padding: '3px 5px', background: '#f5f5f5', textAlign: 'left', fontWeight: 'bold' }}>PAN of the Employee</th>
          <th style={{ border: '1px solid #000', padding: '3px 5px', background: '#f5f5f5', textAlign: 'center', fontWeight: 'bold' }}>AY</th>
        </tr>
        <tr>
          <td style={{ border: '1px solid #000', padding: '3px 5px', textAlign: 'center' }}>ABCD1234E</td>
          <td style={{ border: '1px solid #000', padding: '3px 5px', textAlign: 'center' }}>ABCD01234E</td>
          <td style={{ border: '1px solid #000', padding: '3px 5px', textAlign: 'center' }}>EFGH5678I</td>
          <td style={{ border: '1px solid #000', padding: '3px 5px', textAlign: 'center', fontWeight: 'bold' }}>2025-26</td>
        </tr>
      </tbody>
    </table>

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7px', marginTop: '3px' }}>
      <tbody>
        <tr>
          <th style={{ border: '1px solid #000', padding: '3px', background: '#f5f5f5', textAlign: 'center' }}>Quarter</th>
          <th style={{ border: '1px solid #000', padding: '3px', background: '#f5f5f5', textAlign: 'center' }}>Tax Deducted</th>
          <th style={{ border: '1px solid #000', padding: '3px', background: '#f5f5f5', textAlign: 'center' }}>Tax Deposited</th>
        </tr>
        {['Q1 — ₹27,623', 'Q2 — —', 'Q3 — —', 'Q4 — —'].map((q, i) => {
          const [label, val] = q.split(' — ');
          return (
            <tr key={i}>
              <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center' }}>{label}</td>
              <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right' }}>{val}</td>
              <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right' }}>{val}</td>
            </tr>
          );
        })}
        <tr style={{ background: '#f9f9f9', fontWeight: 'bold' }}>
          <td style={{ border: '1px solid #000', padding: '2px 4px' }}>Total</td>
          <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right' }}>₹27,623</td>
          <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right' }}>₹27,623</td>
        </tr>
      </tbody>
    </table>

    <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', padding: '5px', fontSize: '9px' }}>PART B</div>

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7px' }}>
      <tbody>
        <tr><td style={{ border: '1px solid #000', padding: '2px 5px', width: '55%', fontWeight: 'bold' }}>1. Gross Salary</td><td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '6.5px' }}>Rs.</td><td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '6.5px' }}>Rs.</td><td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '6.5px' }}>Rs.</td></tr>
        <tr style={{ background: '#f9f9f9' }}><td style={{ border: '1px solid #000', padding: '2px 5px 2px 14px' }}>(d) Total</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 'bold' }}>6,50,000</td><td style={{ border: '1px solid #000' }}></td></tr>
        <tr><td style={{ border: '1px solid #000', padding: '2px 5px' }}>2. Less: Exempt Allowances u/s 10</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right' }}>13,100</td><td style={{ border: '1px solid #000' }}></td></tr>
        <tr style={{ background: '#f9f9f9' }}><td style={{ border: '1px solid #000', padding: '2px 5px', fontWeight: 'bold' }}>6. Income chargeable under Salaries</td><td colSpan={2} style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 'bold' }}>6,25,699</td></tr>
        <tr><td style={{ border: '1px solid #000', padding: '2px 5px', fontWeight: 'bold' }}>8. Gross Total Income</td><td colSpan={2} style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 'bold' }}>6,31,714</td></tr>
        <tr><td style={{ border: '1px solid #000', padding: '2px 5px' }}>10. Total Deductions (Chapter VI-A)</td><td colSpan={2} style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right' }}>60,123</td></tr>
        <tr style={{ background: '#f9f9f9' }}><td style={{ border: '1px solid #000', padding: '2px 5px', fontWeight: 'bold' }}>11. Total Income</td><td colSpan={2} style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 'bold' }}>5,71,591</td></tr>
        <tr style={{ background: '#f0f0f0', fontWeight: 'bold' }}><td style={{ border: '1px solid #000', padding: '2px 5px', fontWeight: 'bold' }}>16. Net Tax Payable</td><td colSpan={2} style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'right', fontWeight: 'bold' }}>27,623</td></tr>
      </tbody>
    </table>
    <div style={{ padding: '6px 10px', fontSize: '6.5px', color: '#555', borderTop: '1px solid #ccc', lineHeight: 1.6 }}>
      <strong>Verification:</strong> I hereby certify that the information given above is true, complete and correct...<br />
      Place: ________ &nbsp;&nbsp; Date: ________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Signature: ______________________________
    </div>
  </div>
);

// ── GST Invoice preview ──────────────────────────────────────────────────────

const GSTInvoicePreview = () => (
  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', background: 'white', border: '1px solid #ccc' }}>
    <div style={{ background: '#1a1a2e', color: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: '13px' }}>Your Company</div>
        <div style={{ fontSize: '7px', opacity: 0.7, marginTop: '2px' }}>GSTIN: 27ABCDE1234F1Z5</div>
        <div style={{ fontSize: '7px', opacity: 0.7 }}>Mumbai, Maharashtra - 400001 | State Code: 27</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '1px' }}>TAX INVOICE</div>
        <div style={{ fontSize: '7px', opacity: 0.7 }}>Original for Recipient</div>
      </div>
    </div>

    <div style={{ background: '#f8f8f8', padding: '4px 14px', display: 'flex', gap: '18px', fontSize: '7.5px', borderBottom: '1px solid #ddd' }}>
      <span>Invoice No: <strong>INV-2025-001</strong></span>
      <span>Date: <strong>01/01/2025</strong></span>
      <span>Place of Supply: <strong>Maharashtra</strong></span>
      <span>Reverse Charge: <strong>No</strong></span>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #ccc' }}>
      <div style={{ padding: '8px 12px', borderRight: '1px solid #ccc' }}>
        <div style={{ fontSize: '6.5px', fontWeight: 700, color: '#777', textTransform: 'uppercase', marginBottom: '3px' }}>Bill From (Supplier)</div>
        <div style={{ fontWeight: 700, fontSize: '9px' }}>Your Company Ltd</div>
        <div style={{ fontSize: '7px', color: '#555', marginTop: '2px', lineHeight: 1.6 }}>123 Business Park, Mumbai - 400001<br /><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>GSTIN: 27ABCDE1234F1Z5</span></div>
      </div>
      <div style={{ padding: '8px 12px' }}>
        <div style={{ fontSize: '6.5px', fontWeight: 700, color: '#777', textTransform: 'uppercase', marginBottom: '3px' }}>Bill To (Recipient)</div>
        <div style={{ fontWeight: 700, fontSize: '9px' }}>Client Company Pvt Ltd</div>
        <div style={{ fontSize: '7px', color: '#555', marginTop: '2px', lineHeight: 1.6 }}>456 Commercial Road, Pune - 411001<br /><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>GSTIN: 27XYZAB5678G2H6</span></div>
      </div>
    </div>

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.5px', borderBottom: '1px solid #ccc' }}>
      <thead>
        <tr>
          {['#', 'Description', 'HSN/SAC', 'Qty', 'Rate', 'Taxable', 'CGST 9%', 'SGST 9%', 'Total'].map(h => (
            <th key={h} style={{ background: '#1a1a2e', color: 'white', padding: '4px 5px', textAlign: 'center', fontSize: '6px', fontWeight: 700 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[
          ['1', 'IT Consulting Services', '998314', '1', '₹50,000', '₹50,000', '₹4,500', '₹4,500', '₹59,000'],
          ['2', 'Software Development', '998313', '1', '₹1,00,000', '₹1,00,000', '₹9,000', '₹9,000', '₹1,18,000'],
        ].map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 1 ? '#fafafa' : 'white' }}>
            {row.map((c, j) => <td key={j} style={{ padding: '4px 5px', textAlign: j > 3 ? 'right' : 'center', borderBottom: '1px solid #eee', fontWeight: j === 8 ? 700 : 400 }}>{c}</td>)}
          </tr>
        ))}
        <tr style={{ background: '#f5f5f5', fontWeight: 700 }}>
          <td colSpan={5} style={{ padding: '4px 5px', textAlign: 'right', fontSize: '7px' }}>Total</td>
          <td style={{ padding: '4px 5px', textAlign: 'right', fontSize: '7px' }}>₹1,50,000</td>
          <td style={{ padding: '4px 5px', textAlign: 'right', fontSize: '7px' }}>₹13,500</td>
          <td style={{ padding: '4px 5px', textAlign: 'right', fontSize: '7px' }}>₹13,500</td>
          <td style={{ padding: '4px 5px', textAlign: 'right', fontSize: '7px' }}>₹1,77,000</td>
        </tr>
      </tbody>
    </table>

    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', alignItems: 'flex-end' }}>
      <div style={{ fontSize: '7px', color: '#666' }}>
        <div style={{ fontWeight: 700, marginBottom: '3px' }}>Bank Details</div>
        <div>Bank: HDFC Bank | A/C: XXXX XXXX 1234 | IFSC: HDFC0001234</div>
      </div>
      <div style={{ width: '160px', fontSize: '7.5px' }}>
        {[['Total Taxable', '₹1,50,000'], ['Total CGST', '₹13,500'], ['Total SGST', '₹13,500'], ['Grand Total', '₹1,77,000']].map(([k, v], i) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid #f0f0f0', fontWeight: i === 3 ? 900 : 400, fontSize: i === 3 ? '9px' : '7.5px', color: i === 3 ? '#1a1a2e' : 'inherit' }}>
            <span>{k}</span><span>{v}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={{ padding: '5px 14px', background: '#f9f9f9', fontSize: '7px', borderTop: '1px solid #eee' }}>
      Amount in Words: <strong>One Lakh Seventy Seven Thousand Rupees Only</strong> &nbsp;|&nbsp; <em>E &amp; O.E.</em>
    </div>
  </div>
);

// ── Salary Slip preview ──────────────────────────────────────────────────────

const SalarySlipPreview = () => (
  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', background: 'white', border: '1px solid #ccc' }}>
    <div style={{ background: '#1e293b', color: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: '13px' }}>Your Company</div>
        <div style={{ fontSize: '7px', opacity: 0.7, marginTop: '2px' }}>123 Business Park, Mumbai - 400001</div>
        <div style={{ fontSize: '7px', opacity: 0.7 }}>hr@yourcompany.com</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '1px' }}>SALARY SLIP</div>
        <div style={{ fontSize: '7px', opacity: 0.7 }}>January 2025</div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #ccc' }}>
      <div style={{ padding: '8px 12px', borderRight: '1px solid #ccc' }}>
        {[['Employee Name', 'John Doe'], ['Employee ID', 'EMP-001'], ['Designation', 'Software Engineer'], ['Department', 'Technology']].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px dotted #e5e7eb', fontSize: '7.5px' }}>
            <span style={{ color: '#6b7280' }}>{l}</span><span style={{ fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '8px 12px' }}>
        {[['PAN', 'ABCDE1234F'], ['Bank A/C', 'XXXX XXXX 1234'], ['IFSC', 'SBIN0001234'], ['UAN', '100123456789']].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px dotted #e5e7eb', fontSize: '7.5px' }}>
            <span style={{ color: '#6b7280' }}>{l}</span><span style={{ fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>

    <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #ccc' }}>
      {[['Days in Month', '31'], ['Days Worked', '29'], ['LOP Days', '0']].map(([l, v]) => (
        <div key={l} style={{ flex: 1, padding: '6px 12px', borderRight: '1px solid #ddd', textAlign: 'center' }}>
          <div style={{ fontSize: '6.5px', color: '#888', textTransform: 'uppercase' }}>{l}</div>
          <div style={{ fontWeight: 900, fontSize: '12px', color: '#1e293b', marginTop: '2px' }}>{v}</div>
        </div>
      ))}
    </div>

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px' }}>
      <thead>
        <tr>
          {['Earnings', 'Amount (₹)', 'Deductions', 'Amount (₹)'].map((h, i) => (
            <th key={h} style={{ background: '#f1f5f9', color: '#374151', padding: '5px 10px', textAlign: i % 2 === 1 ? 'right' : 'left', fontWeight: 700, fontSize: '6.5px', textTransform: 'uppercase', borderBottom: '1.5px solid #ccc' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[
          ['Basic Salary', '₹25,000', 'Provident Fund (12%)', '₹3,000'],
          ['HRA', '₹10,000', 'ESI (0.75%)', '₹338'],
          ['Conveyance Allowance', '₹1,600', 'Professional Tax', '₹200'],
          ['Special Allowance', '₹8,400', 'TDS', '₹2,500'],
        ].map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 1 ? '#fafafa' : 'white' }}>
            {row.map((c, j) => <td key={j} style={{ padding: '4px 10px', borderBottom: '1px solid #f0f0f0', textAlign: j % 2 === 1 ? 'right' : 'left', fontFamily: j % 2 === 1 ? 'monospace' : 'inherit' }}>{c}</td>)}
          </tr>
        ))}
        <tr style={{ background: '#f8fafc', borderTop: '1.5px solid #ccc' }}>
          <td style={{ padding: '5px 10px', fontWeight: 700, fontSize: '8px', borderBottom: '1.5px solid #ccc' }}>Gross Earnings</td>
          <td style={{ padding: '5px 10px', fontWeight: 700, textAlign: 'right', borderBottom: '1.5px solid #ccc', fontFamily: 'monospace' }}>₹45,000</td>
          <td style={{ padding: '5px 10px', fontWeight: 700, fontSize: '8px', borderBottom: '1.5px solid #ccc' }}>Total Deductions</td>
          <td style={{ padding: '5px 10px', fontWeight: 700, textAlign: 'right', borderBottom: '1.5px solid #ccc', fontFamily: 'monospace' }}>₹6,038</td>
        </tr>
      </tbody>
    </table>

    <div style={{ background: '#1e293b', color: 'white', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontWeight: 900, fontSize: '10px', letterSpacing: '0.5px' }}>NET PAY</div>
      <div style={{ fontWeight: 900, fontSize: '15px' }}>₹38,962</div>
    </div>
    <div style={{ padding: '5px 14px', background: '#f8fafc', fontSize: '7px', borderTop: '1px solid #e5e7eb' }}>
      Amount in Words: <strong>Thirty Eight Thousand Nine Hundred Sixty Two Rupees Only</strong>
    </div>
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 14px', fontSize: '7px', color: '#888', borderTop: '1px solid #f0f0f0' }}>
      This is a computer-generated salary slip. &nbsp;&nbsp;
      <div style={{ textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid #000', width: '100px', marginBottom: '3px' }} />
        Authorized Signatory
      </div>
    </div>
  </div>
);

// ── Main exported component ──────────────────────────────────────────────────

interface Props {
  type: string;
  brandColor?: string;
}

const DocumentTemplatePreview: React.FC<Props> = ({ type, brandColor = '#714B67' }) => {
  if (type === 'form_16') return <Form16Preview />;
  if (type === 'gst_invoice') return <GSTInvoicePreview />;
  if (type === 'salary_slip') return <SalarySlipPreview />;
  return <GenericPreview color={brandColor} type={type} />;
};

export default DocumentTemplatePreview;
