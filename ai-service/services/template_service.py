from datetime import datetime

# Static CSS kept as a plain string so curly braces need no escaping
_CSS = """
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

.doc-intro { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
.doc-title-box h1 { font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -1px; color: #111827; line-height: 1; }
.client-info { font-size: 10px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
.client-name { color: #111827; }

.date-box { text-align: right; }
.date-label { font-size: 9px; color: #9ca3af; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
.date-value { font-size: 14px; font-weight: 900; color: #111827; margin: 0; }

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

.table-container { margin-bottom: 25px; }
.table-title { font-size: 14px; font-weight: 900; color: #111827; margin-bottom: 10px; }
table { width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; border: 1px solid #f3f4f6; }
th { background-color: #714B67; color: white; padding: 10px; text-align: left; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
td { padding: 10px; font-size: 11px; color: #374151; border-bottom: 1px solid #f3f4f6; font-weight: 700; }
tr:last-child td { border-bottom: none; }

.summary-wrapper { display: flex; justify-content: flex-end; margin-top: 20px; }
.summary-card { width: 220px; background-color: #f9fafb; padding: 15px; border-radius: 15px; border: 1px solid #f3f4f6; }
.summary-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
.summary-row:last-child { border-bottom: none; }
.summary-label { font-size: 9px; font-weight: 900; color: #6b7280; text-transform: uppercase; }
.summary-value { font-size: 14px; font-weight: 900; color: #111827; }

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
"""


def generate_html(company: dict, document: dict) -> str:
    name = company.get("name", "")
    logo_url = company.get("logoUrl")
    address = company.get("address", "")
    phone = company.get("phone", "")
    email = company.get("email", "")
    website = company.get("website", "")
    default_terms = company.get("defaultTerms", "")

    title = document.get("title", "")
    client_name = document.get("clientName", "")
    data = document.get("data") or {}
    created_at = document.get("createdAt")
    doc_type = document.get("type", "").replace("_", " ")

    # Format creation date
    if isinstance(created_at, datetime):
        date_str = f"{created_at.month}/{created_at.day}/{created_at.year}"
    else:
        date_str = str(created_at) if created_at else ""

    # Sections
    sections_html = "".join(
        f"""
        <div class="section">
          <h3 class="section-heading">{s.get('heading', '')}</h3>
          <p class="section-content">{s.get('content', '')}</p>
        </div>
        """
        for s in data.get("sections", [])
    )

    # Tables
    tables_html = "".join(
        f"""
        <div class="table-container">
          <h3 class="table-title">{t.get('title', '')}</h3>
          <table>
            <thead>
              <tr>{"".join(f"<th>{h}</th>" for h in t.get("headers", []))}</tr>
            </thead>
            <tbody>
              {"".join(
                  f"<tr>{''.join(f'<td>{c}</td>' for c in row)}</tr>"
                  for row in t.get("rows", [])
              )}
            </tbody>
          </table>
        </div>
        """
        for t in data.get("tables", [])
    )

    # Summary
    summary = data.get("summary") or {}
    summary_rows = "".join(
        f'<div class="summary-row">'
        f'<span class="summary-label">{k}</span>'
        f'<span class="summary-value">{v}</span>'
        f"</div>"
        for k, v in summary.items()
    )
    summary_html = (
        f'<div class="summary-wrapper"><div class="summary-card">{summary_rows}</div></div>'
        if summary
        else ""
    )

    # Footer details
    terms = data.get("terms") or default_terms or "All payments are non-refundable. Validity of this document is 30 days from the date of issue."
    logo_html = f'<img src="{logo_url}" class="logo" />' if logo_url else f'<h2 class="company-name">{name}</h2>'
    website_html = f"<p>{website}</p>" if website else ""

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>{_CSS}</style>
</head>
<body>
  <div class="header">
    <div>
      {logo_html}
      <div class="doc-type">{doc_type}</div>
    </div>
    <div class="company-info">
      <h3>{name}</h3>
      <p>{address}</p>
      <p>{phone}</p>
      <p>{email}</p>
      {website_html}
    </div>
  </div>

  <div class="doc-intro">
    <div class="doc-title-box">
      <h1>{title}</h1>
      <div class="client-info">Client: <span class="client-name">{client_name}</span></div>
    </div>
    <div class="date-box">
      <div class="date-label">Date Issued</div>
      <div class="date-value">{date_str}</div>
    </div>
  </div>

  <div class="content">
    {sections_html}
    {tables_html}
    {summary_html}
  </div>

  <div class="footer">
    <div class="signatory-box">
      <div class="signatory-label">Authorized Signatory</div>
      <div class="signatory-name">{name}</div>
      <div class="stamp-placeholder">Stamp / Sign</div>
    </div>
    <div class="terms-box">
      <div class="terms-label">Terms &amp; Conditions</div>
      <div class="terms-content">{terms}</div>
    </div>
  </div>
</body>
</html>"""
