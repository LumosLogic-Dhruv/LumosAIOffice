exports.generateHTML = (company, document) => {
  const { name, logoUrl, address, phone, email, website, defaultTerms } = company;
  const { title, clientName, data, createdAt } = document;

  const sectionsHTML = data.sections ? data.sections.map(s => `
    <div class="section">
      <h3 class="section-heading">${s.heading}</h3>
      <p class="section-content">${s.content}</p>
    </div>
  `).join('') : '';

  const tablesHTML = data.tables ? data.tables.map(t => `
    <div class="table-container">
      <h3 class="table-title">${t.title}</h3>
      <table>
        <thead>
          <tr>${t.headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${t.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>
  `).join('') : '';

  const summaryHTML = data.summary ? `
    <div class="summary-wrapper">
      <div class="summary-card">
        ${Object.entries(data.summary).map(([k, v]) => `
          <div class="summary-row">
            <span class="summary-label">${k}</span>
            <span class="summary-value">${v}</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        * { box-sizing: border-box; }
        
        body { 
          font-family: 'Inter', sans-serif; 
          color: #1a1a1a; 
          line-height: 1.4; 
          margin: 0; 
          padding: 20px;
          background: white;
          font-size: 12px;
        }

        /* Header Branding */
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          background-color: #714B67;
          padding: 30px;
          margin: -20px -20px 30px -20px;
        }
        .logo { max-height: 60px; max-width: 180px; object-fit: contain; background-color: rgba(255,255,255,0.1); padding: 5px; border-radius: 10px; }
        .company-name { font-size: 20px; font-weight: 900; color: white; margin: 0; }
        .doc-type { font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
        
        .company-info { text-align: right; }
        .company-info h3 { font-size: 14px; font-weight: 900; margin: 0 0 2px 0; color: white; }
        .company-info p { font-size: 10px; color: rgba(255,255,255,0.8); margin: 1px 0; font-weight: 500; }

        /* Document Info */
        .doc-intro { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
        .doc-title-box h1 { font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -1px; color: #111827; line-height: 1; }
        .client-info { font-size: 10px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
        .client-name { color: #111827; }
        
        .date-box { text-align: right; }
        .date-label { font-size: 9px; color: #9ca3af; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
        .date-value { font-size: 14px; font-weight: 900; color: #111827; margin: 0; }

        /* Sections */
        .section { margin-bottom: 25px; }
        .section-heading { 
          font-size: 16px; 
          font-weight: 900; 
          color: #111827; 
          border-left: 3px solid #714B67; 
          padding-left: 10px; 
          margin-bottom: 8px; 
        }
        .section-content { font-size: 12px; color: #4b5563; white-space: pre-wrap; margin: 0; }

        /* Tables */
        .table-container { margin-bottom: 25px; }
        .table-title { font-size: 14px; font-weight: 900; color: #111827; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; border: 1px solid #f3f4f6; }
        th { background-color: #714B67; color: white; padding: 10px; text-align: left; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 10px; font-size: 11px; color: #374151; border-bottom: 1px solid #f3f4f6; font-weight: 700; }
        tr:last-child td { border-bottom: none; }

        /* Summary */
        .summary-wrapper { display: flex; justify-content: flex-end; margin-top: 20px; }
        .summary-card { width: 220px; background-color: #f9fafb; padding: 15px; border-radius: 15px; border: 1px solid #f3f4f6; }
        .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
        .summary-row:last-child { border-bottom: none; }
        .summary-label { font-size: 9px; font-weight: 900; color: #6b7280; text-transform: uppercase; }
        .summary-value { font-size: 14px; font-weight: 900; color: #111827; }

        /* Footer */
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: flex-end; }
        .signatory-box { margin-bottom: 5px; }
        .signatory-label { font-size: 9px; font-weight: 900; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; }
        .signatory-name { font-size: 14px; font-weight: 900; color: #111827; margin-bottom: 10px; }
        .stamp-placeholder { 
          width: 120px; 
          height: 50px; 
          background-color: #f9fafb; 
          border: 1px dashed #e5e7eb; 
          border-radius: 10px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #d1d5db; 
          font-size: 8px; 
          font-weight: 900; 
          text-transform: uppercase; 
        }
        
        .terms-box { text-align: right; max-width: 250px; }
        .terms-label { font-size: 8px; font-weight: 900; color: #d1d5db; text-transform: uppercase; margin-bottom: 5px; }
        .terms-content { font-size: 9px; color: #9ca3af; line-height: 1.3; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          ${logoUrl ? `<img src="${logoUrl}" class="logo" />` : `<h2 class="company-name">${name}</h2>`}
          <div class="doc-type">${document.type.replace('_', ' ')}</div>
        </div>
        <div class="company-info">
          <h3>${name}</h3>
          <p>${address || ''}</p>
          <p>${phone || ''}</p>
          <p>${email || ''}</p>
          ${website ? `<p>${website}</p>` : ''}
        </div>
      </div>

      <div class="doc-intro">
        <div class="doc-title-box">
          <h1>${title}</h1>
          <div class="client-info">Client: <span class="client-name">${clientName}</span></div>
        </div>
        <div class="date-box">
          <div class="date-label">Date Issued</div>
          <div class="date-value">${new Date(createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div class="content">
        ${sectionsHTML}
        ${tablesHTML}
        ${summaryHTML}
      </div>

      <div class="footer">
        <div class="signatory-box">
          <div class="signatory-label">Authorized Signatory</div>
          <div class="signatory-name">${name}</div>
          <div class="stamp-placeholder">Stamp / Sign</div>
        </div>
        <div class="terms-box">
          <div class="terms-label">Terms & Conditions</div>
          <div class="terms-content">
            ${data.terms || defaultTerms || 'All payments are non-refundable. Validity of this document is 30 days from the date of issue.'}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
