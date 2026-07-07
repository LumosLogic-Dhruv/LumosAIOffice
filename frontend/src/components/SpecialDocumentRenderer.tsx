import React from 'react';

// ─── Shared helpers ───────────────────────────────────────────────────────────

const Table = ({ style, children }: { style?: React.CSSProperties; children: React.ReactNode }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', ...style }}>{children}</table>
);
const TH = ({ children, style, colSpan }: { children?: React.ReactNode; style?: React.CSSProperties; colSpan?: number }) => (
  <th colSpan={colSpan} style={{ border: '1px solid #000', padding: '4px 7px', background: '#f2f2f2', fontWeight: 'bold', textAlign: 'left', verticalAlign: 'top', ...style }}>{children}</th>
);
const TD = ({ children, style, colSpan }: { children?: React.ReactNode; style?: React.CSSProperties; colSpan?: number }) => (
  <td style={{ border: '1px solid #000', padding: '4px 7px', verticalAlign: 'top', ...style }} colSpan={colSpan}>{children}</td>
);

// ─── FORM 16 ──────────────────────────────────────────────────────────────────

export const Form16Renderer: React.FC<{ data: any; company: any; document: any }> = ({ data, company, document }) => {
  const sd = data?.specialData || {};

  const employerName = sd.employerName || company?.name || '';
  const employerAddress = sd.employerAddress || company?.address || '';
  const employeeName = sd.employeeName || document?.clientName || '';
  const employeeDesignation = sd.employeeDesignation || '';
  const panDeductor = sd.panDeductor || '';
  const tanDeductor = sd.tanDeductor || '';
  const panEmployee = sd.panEmployee || '';
  const citTds = sd.citTds || '';
  const assessmentYear = sd.assessmentYear || '';
  const periodFrom = sd.periodFrom || '';
  const periodTo = sd.periodTo || '';

  const quarters: any[] = sd.quarters || [
    { q: 'Quarter 1', receipt: '', deducted: '', deposited: '' },
    { q: 'Quarter 2', receipt: '', deducted: '', deposited: '' },
    { q: 'Quarter 3', receipt: '', deducted: '', deposited: '' },
    { q: 'Quarter 4', receipt: '', deducted: '', deposited: '' },
  ];
  const totalDeducted = sd.totalDeducted || '';
  const totalDeposited = sd.totalDeposited || '';

  // Part B
  const s17_1 = sd.salary17_1 || '-';
  const s17_2 = sd.perquisites17_2 || '-';
  const s17_3 = sd.profitsInLieu17_3 || '-';
  const grossSal = sd.grossSalaryTotal || '-';
  const exemptAllowances: any[] = sd.exemptAllowances || [];
  const totalExempt = sd.totalExempt || '-';
  const balance = sd.balance || '-';
  const entertain = sd.entertainmentAllowance || '-';
  const taxEmp = sd.taxOnEmployment || '-';
  const aggDed = sd.aggregateDeductions || '-';
  const incSal = sd.incomeUnderSalaries || '-';
  const otherIncome: any[] = sd.otherIncome || [];
  const totalOther = sd.totalOtherIncome || '-';
  const gti = sd.grossTotalIncome || '-';

  const ded80C: any[] = sd.deductions80C || [];
  const t80cG = sd.total80CGross || '-';
  const t80cD = sd.total80CDeductible || '-';
  const s80ccc = sd.section80CCC || '-';
  const s80ccd = sd.section80CCD || '-';
  const otherVIA: any[] = sd.otherVIA || [];
  const totalVIA = sd.totalVIA || '-';
  const totalIncome = sd.totalIncome || '-';
  const taxIncome = sd.taxOnIncome || '-';
  const eduCess = sd.educationCess || '-';
  const taxPayable = sd.taxPayable || '-';
  const relief = sd.reliefU89 || '0';
  const netTax = sd.netTaxPayable || '-';

  const signatory = sd.signatoryName || company?.name || '';
  const designation = sd.designation || '';
  const place = sd.place || company?.address || '';

  const f = { fontFamily: "'Times New Roman', Georgia, serif", fontSize: '11px', color: '#000', lineHeight: 1.5 };
  const cellShade = { background: '#f9f9f9' as const };
  const bold = { fontWeight: 'bold' as const };
  const center = { textAlign: 'center' as const };
  const right = { textAlign: 'right' as const, fontFamily: 'monospace' };
  const i1 = { paddingLeft: '20px' };
  const i2 = { paddingLeft: '36px' };
  const i3 = { paddingLeft: '52px' };

  return (
    <div style={{ ...f, padding: '24px', background: '#fff', maxWidth: '800px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '3px' }}>FORM 16</div>
        <div style={{ fontSize: '11px', color: '#555' }}>[See rule 31(1)(a)]</div>
        <div style={{ fontSize: '14px', fontWeight: 'bold', textDecoration: 'underline', margin: '8px 0 4px' }}>PART A</div>
        <div style={{ fontSize: '11px' }}>Certificate under section 203 of the Income-tax Act, 1961 for Tax deducted at source on Salary</div>
      </div>

      {/* Employer / Employee */}
      <Table style={{ marginTop: '10px' }}>
        <tbody>
          <tr><TH>Name and address of the Employer</TH><TH>Name and designation of the Employee</TH></tr>
          <tr>
            <TD>{employerName}<br />{employerAddress}</TD>
            <TD>{employeeName}<br />{employeeDesignation}</TD>
          </tr>
        </tbody>
      </Table>

      {/* PAN / TAN */}
      <Table style={{ marginTop: '2px' }}>
        <tbody>
          <tr>
            <TH style={{ width: '33%' }}>PAN of the Deductor</TH>
            <TH style={{ width: '34%' }}>TAN of the Deductor</TH>
            <TH style={{ width: '33%' }}>PAN of the Employee</TH>
          </tr>
          <tr>
            <TD style={center}>{panDeductor}</TD>
            <TD style={center}>{tanDeductor}</TD>
            <TD style={center}>{panEmployee}</TD>
          </tr>
        </tbody>
      </Table>

      {/* CIT / AY / Period */}
      <Table style={{ marginTop: '2px' }}>
        <tbody>
          <tr>
            <TH colSpan={2}>CIT (TDS)</TH>
            <TH style={center}>Assessment Year</TH>
            <TH>Period From</TH>
            <TH>Period To</TH>
          </tr>
          <tr>
            <TD colSpan={2}>{citTds}</TD>
            <TD style={{ ...center, ...bold }}>{assessmentYear}</TD>
            <TD>{periodFrom}</TD>
            <TD>{periodTo}</TD>
          </tr>
        </tbody>
      </Table>

      {/* Quarterly TDS */}
      <div style={{ ...bold, margin: '8px 0 4px', fontSize: '11px' }}>Summary of tax deducted at source</div>
      <Table>
        <thead>
          <tr>
            <TH style={{ width: '12%', ...center }}>Quarter</TH>
            <TH style={{ width: '42%' }}>Receipt Numbers of original statements</TH>
            <TH style={{ width: '23%', ...center }}>Amount of tax deducted</TH>
            <TH style={{ width: '23%', ...center }}>Amount of tax deposited / remitted</TH>
          </tr>
        </thead>
        <tbody>
          {quarters.map((q: any, i: number) => (
            <tr key={i}>
              <TD style={center}>{q.q}</TD>
              <TD>{q.receipt}</TD>
              <TD style={right}>{q.deducted}</TD>
              <TD style={right}>{q.deposited}</TD>
            </tr>
          ))}
          <tr style={cellShade}>
            <TD style={bold}>Total</TD><TD />
            <TD style={{ ...right, ...bold }}>{totalDeducted}</TD>
            <TD style={{ ...right, ...bold }}>{totalDeposited}</TD>
          </tr>
        </tbody>
      </Table>

      {/* PART B */}
      <div style={{ ...center, ...bold, textDecoration: 'underline', fontSize: '14px', margin: '14px 0 4px' }}>PART B (Refer Note 1)</div>
      <div style={{ ...center, fontSize: '11px', marginBottom: '8px' }}>Details of Salary Paid and any other income and tax deducted</div>

      <Table>
        <thead>
          <tr>
            <TH style={{ width: '52%' }} />
            <TH style={{ ...center, width: '16%' }}>Rs.</TH>
            <TH style={{ ...center, width: '16%' }}>Rs.</TH>
            <TH style={{ ...center, width: '16%' }}>Rs.</TH>
          </tr>
        </thead>
        <tbody>
          <tr><TD colSpan={4} style={bold}>1.&nbsp; Gross Salary</TD></tr>
          <tr><TD style={i1}>(a) Salary as per provisions contained in sec. 17(1)</TD><TD style={right}>{s17_1}</TD><TD /><TD /></tr>
          <tr><TD style={i1}>(b) Value of perquisites u/s 17(2)</TD><TD style={right}>{s17_2}</TD><TD /><TD /></tr>
          <tr><TD style={i1}>(c) Profits in lieu of salary under section 17(3)</TD><TD style={right}>{s17_3}</TD><TD /><TD /></tr>
          <tr style={cellShade}><TD style={{ ...i1, ...bold }}>(d) Total</TD><TD /><TD style={{ ...right, ...bold }}>{grossSal}</TD><TD /></tr>

          <tr><TD colSpan={4} style={bold}>2.&nbsp; Less: Allowances to the extent exempt U/s 10</TD></tr>
          {exemptAllowances.map((a: any, i: number) => (
            <tr key={i}><TD style={i2}>{a.name}</TD><TD style={right}>{a.amount}</TD><TD /><TD /></tr>
          ))}
          <tr style={cellShade}><TD /><TD /><TD style={{ ...right, ...bold }}>{totalExempt}</TD><TD /></tr>

          <tr style={cellShade}><TD style={bold}>3.&nbsp; Balance (1-2)</TD><TD /><TD /><TD style={{ ...right, ...bold }}>{balance}</TD></tr>

          <tr><TD colSpan={4} style={bold}>4.&nbsp; Deductions:</TD></tr>
          <tr><TD style={i1}>(a) Entertainment allowance</TD><TD style={right}>{entertain}</TD><TD /><TD /></tr>
          <tr><TD style={i1}>(b) Tax on employment</TD><TD style={right}>{taxEmp}</TD><TD /><TD /></tr>

          <tr style={cellShade}><TD style={bold}>5.&nbsp; Aggregate of 4(a) and (b)</TD><TD /><TD style={{ ...right, ...bold }}>{aggDed}</TD><TD /></tr>
          <tr style={cellShade}><TD style={bold}>6.&nbsp; Income chargeable under the head 'Salaries' (3-5)</TD><TD /><TD /><TD style={{ ...right, ...bold }}>{incSal}</TD></tr>

          <tr><TD colSpan={4} style={bold}>7.&nbsp; Add: Any other income reported by the employee</TD></tr>
          {otherIncome.map((o: any, i: number) => (
            <tr key={i}><TD style={i2}>{o.name}</TD><TD style={right}>{o.amount}</TD><TD /><TD /></tr>
          ))}
          <tr style={cellShade}><TD /><TD /><TD style={{ ...right, ...bold }}>{totalOther}</TD><TD /></tr>

          <tr style={cellShade}><TD style={bold}>8.&nbsp; Gross Total Income (6+7)</TD><TD /><TD /><TD style={{ ...right, ...bold }}>{gti}</TD></tr>
        </tbody>
      </Table>

      {/* Deductions Chapter VI-A */}
      <Table style={{ marginTop: '4px' }}>
        <thead>
          <tr>
            <TH style={{ width: '52%' }} />
            <TH style={{ ...center, width: '16%' }}>Rs.</TH>
            <TH style={{ ...center, width: '16%' }}>Rs.</TH>
            <TH style={{ ...center, width: '16%' }}>Rs.</TH>
          </tr>
        </thead>
        <tbody>
          <tr><TD colSpan={4} style={bold}>9.&nbsp; Deductions under Chapter VI A</TD></tr>
          <tr><TD style={{ ...i1, ...bold }}>(A) Sections 80C, 80CCC and 80CCD</TD><TD /><TD /><TD /></tr>
          <tr><TD style={{ ...i2, ...bold }}>(a) Section 80C</TD><TD style={{ ...center, ...bold }}>Gross Amount</TD><TD style={{ ...center, ...bold }}>Deductible Amount</TD><TD /></tr>
          {ded80C.map((d: any, i: number) => (
            <tr key={i}><TD style={i3}>{d.name}</TD><TD style={right}>{d.gross}</TD><TD style={right}>{d.deductible}</TD><TD /></tr>
          ))}
          <tr><TD /><TD style={{ ...right, ...bold }}>{t80cG}</TD><TD style={{ ...right, ...bold }}>{t80cD}</TD><TD /></tr>
          <tr><TD style={i2}>(b) Section 80 CCC</TD><TD style={right}>{s80ccc}</TD><TD /><TD /></tr>
          <tr><TD style={i2}>(c) Section 80 CCD</TD><TD style={right}>{s80ccd}</TD><TD /><TD /></tr>

          <tr><TD style={{ ...i1, ...bold }}>(B) Other sections (e.g. 80E, 80G etc.)</TD><TD style={{ ...center, ...bold }}>Gross Amount</TD><TD style={{ ...center, ...bold }}>Qualifying Amount</TD><TD style={{ ...center, ...bold }}>Deductible Amount</TD></tr>
          {otherVIA.length > 0 ? otherVIA.map((v: any, i: number) => (
            <tr key={i}><TD style={i2}>{v.name}</TD><TD style={right}>{v.gross}</TD><TD style={right}>{v.qualifying}</TD><TD style={right}>{v.deductible}</TD></tr>
          )) : <tr><TD style={i2}>—</TD><TD style={right}>—</TD><TD style={right}>—</TD><TD style={right}>—</TD></tr>}

          <tr style={cellShade}><TD style={bold}>10. Aggregate of deductible amount under Chapter VI A</TD><TD /><TD /><TD style={{ ...right, ...bold }}>{totalVIA}</TD></tr>
          <tr style={cellShade}><TD style={bold}>11. Total Income (8-10)</TD><TD /><TD /><TD style={{ ...right, ...bold }}>{totalIncome}</TD></tr>
          <tr><TD>12. Tax on total income</TD><TD /><TD /><TD style={right}>{taxIncome}</TD></tr>
          <tr><TD>13. Education cess @ 4% (on tax computed at S.No. 12)</TD><TD /><TD /><TD style={right}>{eduCess}</TD></tr>
          <tr style={cellShade}><TD style={bold}>14. Tax Payable (12+13)</TD><TD /><TD /><TD style={{ ...right, ...bold }}>{taxPayable}</TD></tr>
          <tr><TD>15. Less: Relief under section 89</TD><TD /><TD /><TD style={right}>{relief}</TD></tr>
          <tr style={{ background: '#e8e8e8' as const }}><TD style={bold}>16. Net Tax Payable (14-15)</TD><TD /><TD /><TD style={{ ...right, ...bold, fontSize: '12px' }}>{netTax}</TD></tr>
        </tbody>
      </Table>

      {/* Verification */}
      <div style={{ border: '1px solid #000', padding: '12px', marginTop: '14px', fontSize: '11px', lineHeight: 1.8 }}>
        <strong>Verification</strong><br /><br />
        I, {signatory || '___________________________'}, son / daughter of _____________________ working in the capacity of {designation || '____________________'} (designation) do hereby certify that a sum of Rs.&nbsp;{netTax} has been deducted and deposited to the credit of the Central Government. I further certify that the information given above is true, complete and correct and is based on the books of account, documents, TDS statements and other available records.
      </div>

      {/* Signature row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', fontSize: '11px' }}>
        <div>Place: {place}<br /><br />Date: ___________</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', width: '220px', marginBottom: '4px', marginTop: '40px' }} />
          Signature of person responsible for deduction of tax<br />
          Designation: {designation}<br />
          Full Name: {signatory}
        </div>
      </div>
    </div>
  );
};

// ─── GST INVOICE ──────────────────────────────────────────────────────────────

export const GSTInvoiceRenderer: React.FC<{ data: any; company: any; document: any }> = ({ data, company, document }) => {
  const sd = data?.specialData || {};

  const supplierName = sd.supplierName || company?.name || '';
  const supplierGstin = sd.supplierGstin || company?.gstNumber || '';
  const supplierAddress = sd.supplierAddress || company?.address || '';
  const supplierState = sd.supplierStateCode || '';
  const invoiceNo = sd.invoiceNo || document?.title || '';
  const invoiceDate = sd.invoiceDate || '';
  const placeOfSupply = sd.placeOfSupply || '';
  const reverseCharge = sd.reverseCharge || 'No';
  const recipientName = sd.recipientName || document?.clientName || '';
  const recipientGstin = sd.recipientGstin || '';
  const recipientAddress = sd.recipientAddress || '';
  const recipientState = sd.recipientStateCode || '';
  const items: any[] = sd.items || [];
  const totalTaxable = sd.totalTaxableValue || '';
  const totalCGST = sd.totalCGST || '';
  const totalSGST = sd.totalSGST || '';
  const totalIGST = sd.totalIGST || '';
  const totalGST = sd.totalGST || '';
  const grandTotal = sd.grandTotal || '';
  const amountWords = sd.amountInWords || '';
  const bankName = sd.bankName || '';
  const accountNo = sd.accountNo || '';
  const ifsc = sd.ifscCode || '';

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', background: '#fff', border: '2px solid #000', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: '18px' }}>{supplierName}</div>
          <div style={{ fontSize: '10px', opacity: 0.75, marginTop: '3px' }}>GSTIN: {supplierGstin}</div>
          <div style={{ fontSize: '10px', opacity: 0.75 }}>{supplierAddress}{supplierState && ` | State Code: ${supplierState}`}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '2px' }}>TAX INVOICE</div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>Original for Recipient</div>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: '24px', padding: '8px 16px', background: '#f8f8f8', borderBottom: '1px solid #ddd', fontSize: '11px' }}>
        <span>Invoice No: <strong>{invoiceNo}</strong></span>
        <span>Date: <strong>{invoiceDate}</strong></span>
        <span>Place of Supply: <strong>{placeOfSupply}</strong></span>
        <span>Reverse Charge: <strong>{reverseCharge}</strong></span>
      </div>

      {/* Parties */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #ccc' }}>
        <div style={{ padding: '12px 16px', borderRight: '1px solid #ccc' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#777', textTransform: 'uppercase', marginBottom: '5px' }}>Bill From (Supplier)</div>
          <div style={{ fontWeight: 900, fontSize: '13px' }}>{supplierName}</div>
          <div style={{ fontSize: '10px', color: '#444', marginTop: '2px', lineHeight: 1.7 }}>{supplierAddress}</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '11px', color: '#1a1a2e', marginTop: '3px' }}>GSTIN: {supplierGstin}</div>
        </div>
        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#777', textTransform: 'uppercase', marginBottom: '5px' }}>Bill To (Recipient)</div>
          <div style={{ fontWeight: 900, fontSize: '13px' }}>{recipientName}</div>
          <div style={{ fontSize: '10px', color: '#444', marginTop: '2px', lineHeight: 1.7 }}>{recipientAddress}{recipientState && ` | State: ${recipientState}`}</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '11px', color: '#1a1a2e', marginTop: '3px' }}>{recipientGstin ? `GSTIN: ${recipientGstin}` : 'Unregistered'}</div>
        </div>
      </div>

      {/* Items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', borderTop: '1px solid #ccc' }}>
        <thead>
          <tr>
            {['#', 'Description', 'HSN/SAC', 'Qty', 'Unit', 'Rate (₹)', 'Taxable Value', 'CGST%', 'CGST Amt', 'SGST%', 'SGST Amt', 'IGST%', 'IGST Amt'].map(h => (
              <th key={h} style={{ background: '#1a1a2e', color: '#fff', padding: '7px 6px', textAlign: 'center', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => (
            <tr key={i} style={{ background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
              <td style={{ padding: '6px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{i + 1}</td>
              <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{item.desc}</td>
              <td style={{ padding: '6px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.hsn}</td>
              <td style={{ padding: '6px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.qty}</td>
              <td style={{ padding: '6px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.unit}</td>
              <td style={{ padding: '6px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{item.rate}</td>
              <td style={{ padding: '6px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{item.taxableValue}</td>
              <td style={{ padding: '6px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.cgstRate}%</td>
              <td style={{ padding: '6px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{item.cgstAmt}</td>
              <td style={{ padding: '6px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.sgstRate}%</td>
              <td style={{ padding: '6px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{item.sgstAmt}</td>
              <td style={{ padding: '6px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.igstRate}%</td>
              <td style={{ padding: '6px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{item.igstAmt}</td>
            </tr>
          ))}
          <tr style={{ background: '#f5f5f5' }}>
            <td colSpan={6} style={{ padding: '7px 6px', textAlign: 'right', fontWeight: 700 }}>Total</td>
            <td style={{ padding: '7px 6px', textAlign: 'right', fontWeight: 700 }}>{totalTaxable}</td>
            <td colSpan={2} style={{ padding: '7px 6px', textAlign: 'right', fontWeight: 700 }}>{totalCGST}</td>
            <td colSpan={2} style={{ padding: '7px 6px', textAlign: 'right', fontWeight: 700 }}>{totalSGST}</td>
            <td colSpan={2} style={{ padding: '7px 6px', textAlign: 'right', fontWeight: 700 }}>{totalIGST}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax summary + bank */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', borderTop: '1px solid #ccc' }}>
        {(bankName || accountNo) ? (
          <div style={{ padding: '12px 16px', borderRight: '1px solid #ccc', fontSize: '10px' }}>
            <div style={{ fontSize: '9px', fontWeight: 900, color: '#777', textTransform: 'uppercase', marginBottom: '6px' }}>Bank Details</div>
            <div>Bank: <strong>{bankName}</strong></div>
            <div>A/C No: <strong>{accountNo}</strong></div>
            <div>IFSC: <strong>{ifsc}</strong></div>
          </div>
        ) : <div />}
        <div style={{ padding: '10px 16px' }}>
          {[['Total Taxable Value', totalTaxable], ['Total CGST', totalCGST], ['Total SGST', totalSGST], ['Total IGST', totalIGST], ['Total GST', totalGST]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f0f0f0', fontSize: '10px' }}>
              <span>{k}</span><span>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '14px', background: '#f0f0f0', margin: '0 -16px', padding: '6px 16px' }}>
            <span>Grand Total</span><span>₹ {grandTotal}</span>
          </div>
        </div>
      </div>

      {amountWords && (
        <div style={{ padding: '8px 16px', background: '#f9f9f9', fontSize: '10px', borderTop: '1px solid #ccc' }}>
          Amount in Words: <strong>{amountWords}</strong>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '14px 16px', borderTop: '1px solid #ccc', fontSize: '10px' }}>
        <div style={{ fontSize: '9px', color: '#999', fontStyle: 'italic' }}>E &amp; O.E. — This is a computer-generated invoice.</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', width: '180px', marginBottom: '4px', marginTop: '32px' }} />
          Authorized Signatory for {supplierName}
        </div>
      </div>
    </div>
  );
};

// ─── SALARY SLIP ──────────────────────────────────────────────────────────────

export const SalarySlipRenderer: React.FC<{ data: any; company: any; document: any }> = ({ data, company, document }) => {
  const sd = data?.specialData || {};

  const coName = company?.name || '';
  const coAddress = company?.address || '';
  const coEmail = company?.email || '';

  const empName = sd.employeeName || document?.clientName || '';
  const empId = sd.employeeId || '';
  const designation = sd.designation || '';
  const department = sd.department || '';
  const pan = sd.pan || '';
  const bankAcc = sd.bankAccount || '';
  const ifsc = sd.ifsc || '';
  const uan = sd.uan || '';
  const month = sd.month || '';
  const year = sd.year || '';
  const daysInMonth = sd.daysInMonth || '';
  const daysWorked = sd.daysWorked || '';
  const lop = sd.lopDays || '0';

  const earnings: any[] = sd.earnings || [];
  const deductions: any[] = sd.deductions || [];
  const gross = sd.grossEarnings || '';
  const totalDed = sd.totalDeductions || '';
  const netPay = sd.netPay || '';
  const netWords = sd.netPayWords || '';

  const maxRows = Math.max(earnings.length, deductions.length);
  const rows = Array.from({ length: maxRows }, (_, i) => ({
    earn: earnings[i] || { name: '', amount: '' },
    ded: deductions[i] || { name: '', amount: '' },
  }));

  const slateHeader = { background: '#1e293b', color: '#fff' };
  const cellStyle = { padding: '5px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '11px' };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', background: '#fff', border: '1.5px solid #ccc', maxWidth: '780px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ ...slateHeader, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: '18px' }}>{coName}</div>
          <div style={{ fontSize: '10px', opacity: 0.75, marginTop: '3px' }}>{coAddress}</div>
          <div style={{ fontSize: '10px', opacity: 0.75 }}>{coEmail}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '1px' }}>SALARY SLIP</div>
          <div style={{ fontSize: '11px', opacity: 0.75 }}>{month} {year}</div>
        </div>
      </div>

      {/* Employee details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1.5px solid #ccc' }}>
        <div style={{ padding: '10px 14px', borderRight: '1px solid #ccc' }}>
          {[['Employee Name', empName], ['Employee ID', empId], ['Designation', designation], ['Department', department]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dotted #e5e7eb', fontSize: '10px' }}>
              <span style={{ color: '#6b7280' }}>{l}</span><span style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 14px' }}>
          {[['PAN', pan], ['Bank Account', bankAcc], ['IFSC Code', ifsc], ['UAN', uan]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dotted #e5e7eb', fontSize: '10px' }}>
              <span style={{ color: '#6b7280' }}>{l}</span><span style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid #ccc', background: '#f8fafc' }}>
        {[['Days in Month', daysInMonth], ['Days Worked', daysWorked], ['LOP Days', lop]].map(([l, v]) => (
          <div key={l} style={{ flex: 1, padding: '8px 14px', borderRight: '1px solid #ddd', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
            <div style={{ fontWeight: 900, fontSize: '16px', color: '#1e293b', marginTop: '2px' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Payroll table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Earnings', 'Amount (₹)', 'Deductions', 'Amount (₹)'].map((h, i) => (
              <th key={h} style={{ background: '#f1f5f9', color: '#374151', padding: '8px 12px', textAlign: i % 2 === 1 ? 'right' : 'left', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #ccc' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ earn, ded }, i) => (
            <tr key={i} style={{ background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
              <td style={cellStyle}>{earn.name}</td>
              <td style={{ ...cellStyle, textAlign: 'right', fontFamily: 'monospace' }}>{earn.amount ? `₹ ${earn.amount}` : ''}</td>
              <td style={cellStyle}>{ded.name}</td>
              <td style={{ ...cellStyle, textAlign: 'right', fontFamily: 'monospace' }}>{ded.amount ? `₹ ${ded.amount}` : ''}</td>
            </tr>
          ))}
          <tr style={{ background: '#f8fafc', borderTop: '1.5px solid #ccc', borderBottom: '1.5px solid #ccc' }}>
            <td style={{ padding: '7px 12px', fontWeight: 900, fontSize: '11px' }}>Gross Earnings</td>
            <td style={{ padding: '7px 12px', fontWeight: 900, textAlign: 'right', fontFamily: 'monospace' }}>₹ {gross}</td>
            <td style={{ padding: '7px 12px', fontWeight: 900, fontSize: '11px' }}>Total Deductions</td>
            <td style={{ padding: '7px 12px', fontWeight: 900, textAlign: 'right', fontFamily: 'monospace' }}>₹ {totalDed}</td>
          </tr>
        </tbody>
      </table>

      {/* Net pay */}
      <div style={{ ...slateHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
        <div style={{ fontWeight: 900, fontSize: '13px', letterSpacing: '1px' }}>NET PAY</div>
        <div style={{ fontWeight: 900, fontSize: '20px' }}>₹ {netPay}</div>
      </div>

      {netWords && (
        <div style={{ padding: '8px 14px', fontSize: '10px', background: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
          Amount in Words: <strong>{netWords}</strong>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '12px 14px', borderTop: '1.5px solid #ccc', fontSize: '10px', color: '#888' }}>
        <div>This is a computer-generated salary slip and does not require a signature.</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', width: '160px', marginBottom: '4px', marginTop: '28px' }} />
          Authorized Signatory<br />{coName}
        </div>
      </div>
    </div>
  );
};
