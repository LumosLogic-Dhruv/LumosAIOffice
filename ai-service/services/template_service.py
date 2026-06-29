from datetime import datetime
from itertools import zip_longest

# ─────────────────────────────────────────────────────────────────────────────
# GENERIC TEMPLATE  (used for all standard business documents)
# ─────────────────────────────────────────────────────────────────────────────

_CSS_BASE = """
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
  background-color: BRAND_PRIMARY;
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
  border-left: 3px solid BRAND_PRIMARY;
  padding-left: 10px;
  margin-bottom: 8px;
}
.section-content { font-size: 12px; color: #4b5563; white-space: pre-wrap; margin: 0; }

.table-container { margin-bottom: 25px; }
.table-title { font-size: 14px; font-weight: 900; color: #111827; margin-bottom: 10px; }
table { width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; border: 1px solid #f3f4f6; }
th { background-color: BRAND_PRIMARY; color: white; padding: 10px; text-align: left; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
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
  width: 120px; height: 50px; background-color: #f9fafb; border: 1px dashed #e5e7eb;
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  color: #d1d5db; font-size: 8px; font-weight: 900; text-transform: uppercase;
}

.terms-box { text-align: right; max-width: 250px; }
.terms-label { font-size: 8px; font-weight: 900; color: #d1d5db; text-transform: uppercase; margin-bottom: 5px; }
.terms-content { font-size: 9px; color: #9ca3af; line-height: 1.3; font-weight: 700; }

.esig-block { margin: 30px 0 10px 0; padding: 16px 20px; border: 1.5px solid #e5e7eb; border-radius: 12px; background: #f9fafb; }
.esig-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.esig-badge { font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 100px; }
.esig-title { font-size: 9px; font-weight: 900; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
.esig-image { max-width: 180px; max-height: 70px; object-fit: contain; display: block; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
.esig-details { font-size: 10px; color: #6b7280; line-height: 1.8; }
.esig-label { font-weight: 900; color: #374151; }
"""


def _get_css(primary: str = "#714B67") -> str:
    return _CSS_BASE.replace("BRAND_PRIMARY", primary)


def _esig_block(e_sig: dict) -> str:
    if not e_sig:
        return ""
    ts = e_sig.get("signedAt", 0)
    dt = datetime.fromtimestamp(ts / 1000) if ts else datetime.now()
    return f"""
    <div class="esig-block">
      <div class="esig-header">
        <span class="esig-badge">&#10003; Digitally Signed</span>
        <span class="esig-title">E-Signature</span>
      </div>
      <img src="{e_sig.get('signatureImage', '')}" class="esig-image" alt="Signature" />
      <div class="esig-details">
        <div><span class="esig-label">Name:</span>&nbsp;{e_sig.get('signerName', '')}</div>
        <div><span class="esig-label">Contact:</span>&nbsp;{e_sig.get('signerContact', '')}</div>
        <div><span class="esig-label">Signed on:</span>&nbsp;{dt.strftime('%d %B %Y, %I:%M %p')}</div>
      </div>
    </div>"""


def _generic_html(company: dict, document: dict) -> str:
    name = company.get("name", "")
    logo_url = company.get("logoUrl")
    address = company.get("address", "")
    phone = company.get("phone", "")
    email = company.get("email", "")
    website = company.get("website", "")
    default_terms = company.get("defaultTerms", "")

    color_theme = company.get("colorTheme") or {}
    brand_primary = color_theme.get("primary1") or "#714B67"
    css = _get_css(brand_primary)

    title = document.get("title", "")
    client_name = document.get("clientName", "")
    data = document.get("data") or {}
    created_at = document.get("createdAt")
    doc_type = document.get("type", "").replace("_", " ")

    if isinstance(created_at, datetime):
        date_str = f"{created_at.month}/{created_at.day}/{created_at.year}"
    else:
        date_str = str(created_at) if created_at else ""

    sections_html = "".join(
        f'<div class="section"><h3 class="section-heading">{s.get("heading","")}</h3>'
        f'<p class="section-content">{s.get("content","")}</p></div>'
        for s in data.get("sections", [])
    )

    tables_parts = []
    for t in data.get("tables", []):
        headers_html = "".join(f"<th>{h}</th>" for h in t.get("headers", []))
        rows_html = ""
        for row in t.get("rows", []):
            cells_html = "".join(f"<td>{c}</td>" for c in row)
            rows_html += f"<tr>{cells_html}</tr>"
        tables_parts.append(
            f'<div class="table-container">'
            f'<h3 class="table-title">{t.get("title","")}</h3>'
            f'<table><thead><tr>{headers_html}</tr></thead>'
            f'<tbody>{rows_html}</tbody></table></div>'
        )
    tables_html = "".join(tables_parts)

    summary = data.get("summary") or {}
    summary_rows = "".join(
        f'<div class="summary-row"><span class="summary-label">{k}</span>'
        f'<span class="summary-value">{v}</span></div>'
        for k, v in summary.items()
    )
    summary_html = (
        f'<div class="summary-wrapper"><div class="summary-card">{summary_rows}</div></div>'
        if summary else ""
    )

    sig_html = _esig_block(document.get("eSignature"))
    terms = data.get("terms") or default_terms or "All payments are non-refundable. Validity of this document is 30 days from the date of issue."
    logo_html = f'<img src="{logo_url}" class="logo" />' if logo_url else f'<h2 class="company-name">{name}</h2>'
    website_html = f"<p>{website}</p>" if website else ""

    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>{css}</style></head>
<body>
  <div class="header">
    <div>{logo_html}<div class="doc-type">{doc_type}</div></div>
    <div class="company-info"><h3>{name}</h3><p>{address}</p><p>{phone}</p><p>{email}</p>{website_html}</div>
  </div>
  <div class="doc-intro">
    <div class="doc-title-box"><h1>{title}</h1><div class="client-info">Client: <span class="client-name">{client_name}</span></div></div>
    <div class="date-box"><div class="date-label">Date Issued</div><div class="date-value">{date_str}</div></div>
  </div>
  <div class="content">{sections_html}{tables_html}{summary_html}{sig_html}</div>
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
</body></html>"""


# ─────────────────────────────────────────────────────────────────────────────
# FORM 16  — Official Indian Income Tax TDS Certificate
# ─────────────────────────────────────────────────────────────────────────────

_FORM16_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Times New Roman', 'Noto Serif', serif; font-size: 10px; color: #000; background: #fff; padding: 18px; line-height: 1.5; }
.page { max-width: 790px; margin: 0 auto; }
.top-meta { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.f16-title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 2px; letter-spacing: 2px; }
.f16-rule { text-align: center; font-size: 10px; margin-bottom: 8px; }
.f16-part { text-align: center; font-size: 13px; font-weight: bold; text-decoration: underline; margin: 10px 0 4px; }
.f16-subtitle { text-align: center; font-size: 10px; margin-bottom: 10px; }
table { border-collapse: collapse; width: 100%; margin-bottom: 5px; font-size: 10px; }
td, th { border: 1px solid #000; padding: 4px 7px; vertical-align: top; }
th { font-weight: bold; background: #f2f2f2; }
.center { text-align: center; }
.right { text-align: right; }
.bold { font-weight: bold; }
.amount { text-align: right; font-family: 'Courier New', monospace; }
.i1 { padding-left: 16px; }
.i2 { padding-left: 30px; }
.i3 { padding-left: 44px; }
.shade { background: #f9f9f9; }
.note-row td { font-size: 9px; font-style: italic; border-left: none; border-right: none; border-bottom: none; padding: 3px 4px; }
.page-note { text-align: right; font-size: 10px; margin: 5px 0; }
.verification { font-size: 10px; line-height: 1.8; padding: 10px; border: 1px solid #000; margin-top: 10px; }
.sig-row { display: flex; justify-content: space-between; margin-top: 20px; font-size: 10px; }
.sig-right { text-align: center; }
.sig-line { border-top: 1px solid #000; width: 220px; margin: 38px auto 4px; }
.esig-inline { margin-top: 12px; padding: 8px; border: 1px solid #aaa; background: #f9fff9; font-size: 9px; }
.esig-inline img { max-height: 50px; display: block; margin-bottom: 4px; }
"""


def _form16_html(company: dict, document: dict) -> str:
    data = document.get("data") or {}
    sd = data.get("specialData") or {}

    employer_name = sd.get("employerName") or company.get("name", "")
    employer_address = sd.get("employerAddress") or company.get("address", "")
    employee_name = sd.get("employeeName") or document.get("clientName", "")
    employee_designation = sd.get("employeeDesignation", "")
    pan_deductor = sd.get("panDeductor", "")
    tan_deductor = sd.get("tanDeductor", "")
    pan_employee = sd.get("panEmployee", "")
    cit_tds = sd.get("citTds", "CIT (TDS)")
    assessment_year = sd.get("assessmentYear", "")
    period_from = sd.get("periodFrom", "")
    period_to = sd.get("periodTo", "")

    quarters = sd.get("quarters") or [
        {"q": "Quarter 1", "receipt": "", "deducted": "", "deposited": ""},
        {"q": "Quarter 2", "receipt": "", "deducted": "", "deposited": ""},
        {"q": "Quarter 3", "receipt": "", "deducted": "", "deposited": ""},
        {"q": "Quarter 4", "receipt": "", "deducted": "", "deposited": ""},
    ]
    quarter_rows = "".join(
        f"<tr><td>{q.get('q','')}</td><td>{q.get('receipt','')}</td>"
        f"<td class='amount'>{q.get('deducted','')}</td>"
        f"<td class='amount'>{q.get('deposited','')}</td></tr>"
        for q in quarters
    )
    total_deducted = sd.get("totalDeducted", "")
    total_deposited = sd.get("totalDeposited", "")

    # Part B fields
    s17_1 = sd.get("salary17_1", "-")
    s17_2 = sd.get("perquisites17_2", "-")
    s17_3 = sd.get("profitsInLieu17_3", "-")
    gross_sal = sd.get("grossSalaryTotal", "-")

    exempt_rows = "".join(
        f"<tr><td class='i2'>{a.get('name','')}</td>"
        f"<td class='amount'>{a.get('amount','')}</td><td></td><td></td></tr>"
        for a in (sd.get("exemptAllowances") or [])
    )
    total_exempt = sd.get("totalExempt", "-")
    balance = sd.get("balance", "-")
    entertain = sd.get("entertainmentAllowance", "-")
    tax_emp = sd.get("taxOnEmployment", "-")
    agg_ded = sd.get("aggregateDeductions", "-")
    inc_sal = sd.get("incomeUnderSalaries", "-")

    other_income_rows = "".join(
        f"<tr><td class='i2'>{i.get('name','')}</td>"
        f"<td class='amount'>{i.get('amount','')}</td><td></td><td></td></tr>"
        for i in (sd.get("otherIncome") or [])
    )
    total_other = sd.get("totalOtherIncome", "-")
    gti = sd.get("grossTotalIncome", "-")

    ded80c_rows = "".join(
        f"<tr><td class='i3'>{d.get('name','')}</td>"
        f"<td class='amount'>{d.get('gross','')}</td>"
        f"<td class='amount'>{d.get('deductible','')}</td><td></td></tr>"
        for d in (sd.get("deductions80C") or [])
    )
    t80c_g = sd.get("total80CGross", "-")
    t80c_d = sd.get("total80CDeductible", "-")
    s80ccc = sd.get("section80CCC", "-")
    s80ccd = sd.get("section80CCD", "-")

    other_via = sd.get("otherVIA") or []
    via_rows = "".join(
        f"<tr><td class='i2'>{v.get('name','')}</td>"
        f"<td class='amount'>{v.get('gross','')}</td>"
        f"<td class='amount'>{v.get('qualifying','')}</td>"
        f"<td class='amount'>{v.get('deductible','')}</td></tr>"
        for v in other_via
    ) or "<tr><td class='i2'>-</td><td class='amount'>-</td><td class='amount'>-</td><td class='amount'>-</td></tr>"

    total_via = sd.get("totalVIA", "-")
    total_income = sd.get("totalIncome", "-")
    tax_income = sd.get("taxOnIncome", "-")
    edu_cess = sd.get("educationCess", "-")
    tax_payable = sd.get("taxPayable", "-")
    relief = sd.get("reliefU89", "0")
    net_tax = sd.get("netTaxPayable", "-")
    place = sd.get("place") or company.get("address", "")
    signatory = sd.get("signatoryName", "")
    designation = sd.get("designation", "")

    logo_url = company.get("logoUrl", "")
    logo_html = f'<img src="{logo_url}" style="max-height:40px;max-width:120px;object-fit:contain;" />' if logo_url else ""
    date_str = datetime.now().strftime("%d/%m/%Y")
    e_sig = document.get("eSignature")
    esig_html = ""
    if e_sig:
        dt = datetime.fromtimestamp(e_sig.get("signedAt", 0) / 1000)
        esig_html = f"""<div class="esig-inline">
          <strong>&#10003; Digitally Signed</strong><br/>
          <img src="{e_sig.get('signatureImage','')}" />
          Name: {e_sig.get('signerName','')} | Contact: {e_sig.get('signerContact','')} | Date: {dt.strftime('%d %B %Y %I:%M %p')}
        </div>"""

    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>{_FORM16_CSS}</style></head>
<body><div class="page">

  <div class="top-meta">
    <div>{logo_html}</div>
    <div style="font-size:9px;color:#555;">Date: {date_str}</div>
  </div>

  <div class="f16-title">FORM 16</div>
  <div class="f16-rule">[See rule 31(1)(a)]</div>
  <div class="f16-part">PART A</div>
  <div class="f16-subtitle">Certificate under section 203 of the Income-tax Act, 1961 for Tax deducted at source on Salary</div>

  <table>
    <tr><th style="width:50%">Name and address of the Employer</th><th style="width:50%">Name and designation of the Employee</th></tr>
    <tr><td>{employer_name}<br/>{employer_address}</td><td>{employee_name}<br/>{employee_designation}</td></tr>
  </table>

  <table>
    <tr><th style="width:33%">PAN of the Deductor</th><th style="width:34%">TAN of the Deductor</th><th style="width:33%">PAN of the Employee</th></tr>
    <tr><td class="center">{pan_deductor}</td><td class="center">{tan_deductor}</td><td class="center">{pan_employee}</td></tr>
  </table>

  <table>
    <tr><th colspan="2">CIT (TDS)</th><th class="center">Assessment Year</th><th>Period From</th><th>Period To</th></tr>
    <tr><td colspan="2">{cit_tds}</td><td class="center bold">{assessment_year}</td><td>{period_from}</td><td>{period_to}</td></tr>
  </table>

  <div class="f16-subtitle bold" style="text-align:left;font-weight:bold;margin:6px 0 2px;">Summary of tax deducted at source</div>
  <table>
    <tr>
      <th class="center" style="width:12%">Quarter</th>
      <th style="width:42%">Receipt Numbers of original statements of TDS under sub-section (3) of section 200</th>
      <th class="center" style="width:23%">Amount of tax deducted in respect of the employee</th>
      <th class="center" style="width:23%">Amount of tax deposited/remitted in respect of the employee</th>
    </tr>
    {quarter_rows}
    <tr class="shade bold">
      <td class="bold">Total</td><td></td>
      <td class="amount bold">{total_deducted}</td>
      <td class="amount bold">{total_deposited}</td>
    </tr>
  </table>

  <div class="page-note">&#8230;&#8230;&#8230;.2</div>

  <div class="f16-part">PART B (Refer Note 1)</div>
  <div class="f16-subtitle">Details of Salary Paid and any other income and tax deducted</div>

  <table>
    <col style="width:52%"/><col style="width:16%"/><col style="width:16%"/><col style="width:16%"/>
    <tr><th></th><th class="center">Rs.</th><th class="center">Rs.</th><th class="center">Rs.</th></tr>

    <tr><td colspan="4" class="bold">1.&nbsp; Gross Salary</td></tr>
    <tr><td class="i1">(a) Salary as per provisions contained in sec. 17(1)</td><td class="amount">{s17_1}</td><td></td><td></td></tr>
    <tr><td class="i1">(b) Value of perquisites u/s 17(2) (as per Form No. 12BB, wherever applicable)</td><td class="amount">{s17_2}</td><td></td><td></td></tr>
    <tr><td class="i1">(c) Profits in lieu of salary under section 17(3) (as per Form No. 12BB, wherever applicable)</td><td class="amount">{s17_3}</td><td></td><td></td></tr>
    <tr class="shade"><td class="i1 bold">(d) Total</td><td></td><td class="amount bold">{gross_sal}</td><td></td></tr>

    <tr><td colspan="4" class="bold">2.&nbsp; Less: Allowance to the extent exempt U/s 10</td></tr>
    {exempt_rows}
    <tr class="shade"><td></td><td></td><td class="amount bold">{total_exempt}</td><td></td></tr>

    <tr class="shade"><td class="bold">3.&nbsp; Balance (1-2)</td><td></td><td></td><td class="amount bold">{balance}</td></tr>

    <tr><td colspan="4" class="bold">4.&nbsp; Deductions:</td></tr>
    <tr><td class="i1">(a) Entertainment allowance</td><td class="amount">{entertain}</td><td></td><td></td></tr>
    <tr><td class="i1">(b) Tax on employment</td><td class="amount">{tax_emp}</td><td></td><td></td></tr>

    <tr class="shade"><td class="bold">5.&nbsp; Aggregate of 4(a) and (b)</td><td></td><td class="amount bold">{agg_ded}</td><td></td></tr>
    <tr class="shade"><td class="bold">6.&nbsp; Income chargeable under the head 'Salaries' (3-5)</td><td></td><td></td><td class="amount bold">{inc_sal}</td></tr>

    <tr><td colspan="4" class="bold">7.&nbsp; Add: Any other income reported by the employee</td></tr>
    {other_income_rows}
    <tr class="shade"><td></td><td></td><td class="amount bold">{total_other}</td><td></td></tr>

    <tr class="shade"><td class="bold">8.&nbsp; Gross Total Income (6+7)</td><td></td><td></td><td class="amount bold">{gti}</td></tr>
  </table>

  <div class="page-note">&#8230;&#8230;&#8230;.2 (Cont.)</div>

  <table>
    <col style="width:52%"/><col style="width:16%"/><col style="width:16%"/><col style="width:16%"/>
    <tr><th></th><th class="center">Rs.</th><th class="center">Rs.</th><th class="center">Rs.</th></tr>

    <tr><td colspan="4" class="bold">9.&nbsp; Deductions under Chapter VI A</td></tr>
    <tr><td class="i1 bold">(A) sections 80C, 80CCC and 80CCD</td><td></td><td></td><td></td></tr>
    <tr><td class="i2 bold">(a) Section 80C</td><td class="center bold">Gross Amount</td><td class="center bold">Deductible Amount</td><td></td></tr>
    {ded80c_rows}
    <tr><td></td><td class="amount bold">{t80c_g}</td><td class="amount bold">{t80c_d}</td><td></td></tr>
    <tr><td class="i2">(b) Section 80 CCC</td><td class="amount">{s80ccc}</td><td></td><td></td></tr>
    <tr><td class="i2">(c) Section 80 CCD</td><td class="amount">{s80ccd}</td><td></td><td></td></tr>
    <tr class="note-row"><td colspan="4">Note: 1. Aggregate amount deductible under section 80C shall not exceed one lakh fifty thousand rupees.&nbsp;&nbsp;2. Aggregate amount deductible under the three sections, i.e. 80C, 80CCC, 80CCD shall not exceed one lakh fifty thousand rupees.</td></tr>
    <tr><td class="i1 bold">(B) Other sections (e.g. 80E, 80G etc.) under Chapter VI-A</td><td class="center bold">Gross Amount</td><td class="center bold">Qualifying Amount</td><td class="center bold">Deductible Amount</td></tr>
    {via_rows}

    <tr class="shade"><td class="bold">10. Aggregate of deductible amount under Chapter VI A</td><td></td><td></td><td class="amount bold">{total_via}</td></tr>
    <tr class="shade"><td class="bold">11. Total Income (8-10)</td><td></td><td></td><td class="amount bold">{total_income}</td></tr>
    <tr><td>12. Tax on total income</td><td></td><td></td><td class="amount">{tax_income}</td></tr>
    <tr><td>13. Education cess @ 4% (on tax computed at S.No. 12)</td><td></td><td></td><td class="amount">{edu_cess}</td></tr>
    <tr class="shade"><td class="bold">14. Tax Payable (12+13)</td><td></td><td></td><td class="amount bold">{tax_payable}</td></tr>
    <tr><td>15. Less: Relief under section 89 (attach details)</td><td></td><td></td><td class="amount">{relief}</td></tr>
    <tr class="shade"><td class="bold">16. Tax Payable (14-15)</td><td></td><td></td><td class="amount bold">{net_tax}</td></tr>
  </table>

  <div class="verification">
    <strong>Verification</strong><br/><br/>
    I, {signatory or '__________________________'}, son / daughter of ______________________
    working in the capacity of {designation or '____________________'} (designation) do hereby certify that a sum of
    Rs.&nbsp;{net_tax} [Rs. _________________________________ (in Words)] has been deducted and deposited to the credit
    of the Central Government. I further certify that the information given above is true, complete and correct and is
    based on the books of account, documents, TDS statements, TDS deposited and other available records.
  </div>

  {esig_html}

  <div class="sig-row">
    <div class="sig-left">Place:&nbsp;{place}<br/><br/>Date:&nbsp;{date_str}</div>
    <div class="sig-right">
      <div class="sig-line"></div>
      Signature of person responsible for deduction of tax<br/>
      Designation: {designation}<br/>
      Full Name: {signatory}
    </div>
  </div>

</div></body></html>"""


# ─────────────────────────────────────────────────────────────────────────────
# GST INVOICE  — Indian GST-compliant Tax Invoice
# ─────────────────────────────────────────────────────────────────────────────

_GST_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; font-size: 10px; color: #1a1a1a; background: #fff; padding: 20px; }
.page { max-width: 800px; margin: 0 auto; border: 2px solid #000; }
.gst-header { background: #1a1a2e; color: #fff; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
.gst-header .co-name { font-size: 18px; font-weight: 900; }
.gst-header .co-meta { font-size: 9px; color: rgba(255,255,255,0.75); line-height: 1.6; }
.gst-header .doc-label { font-size: 22px; font-weight: 900; letter-spacing: 2px; text-align: right; }
.gst-header .doc-sub { font-size: 10px; color: rgba(255,255,255,0.7); text-align: right; }
.inv-meta { display: flex; justify-content: space-between; padding: 8px 14px; background: #f8f8f8; border-bottom: 1px solid #ddd; font-size: 10px; }
.inv-meta span { font-weight: 700; }
.parties { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #ccc; }
.party { padding: 10px 14px; }
.party:first-child { border-right: 1px solid #ccc; }
.party-label { font-size: 8px; font-weight: 900; color: #777; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
.party-name { font-size: 13px; font-weight: 900; margin-bottom: 2px; }
.party-detail { font-size: 9px; color: #444; line-height: 1.7; }
.party-gstin { font-family: 'Courier New', monospace; font-weight: 700; font-size: 10px; color: #1a1a2e; margin-top: 3px; }
table { width: 100%; border-collapse: collapse; font-size: 9px; }
th { background: #1a1a2e; color: #fff; padding: 6px 8px; text-align: center; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
th.left { text-align: left; }
td { padding: 6px 8px; border-bottom: 1px solid #eee; vertical-align: middle; }
td.right { text-align: right; }
td.center { text-align: center; }
td.bold { font-weight: 700; }
.items-table { border-top: 1px solid #ccc; }
.tax-section { display: grid; grid-template-columns: 1fr 280px; border-top: 1px solid #ccc; }
.bank-details { padding: 10px 14px; font-size: 9px; border-right: 1px solid #ccc; }
.bank-label { font-size: 8px; font-weight: 900; color: #777; text-transform: uppercase; margin-bottom: 5px; }
.tax-summary { padding: 8px 14px; }
.tax-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f0f0f0; font-size: 10px; }
.tax-row:last-child { border-bottom: none; }
.tax-row.total { font-size: 13px; font-weight: 900; background: #f0f0f0; margin: 0 -14px; padding: 6px 14px; }
.amount-words { padding: 8px 14px; border-top: 1px solid #ccc; font-size: 10px; background: #f9f9f9; }
.gst-footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 12px 14px; border-top: 1px solid #ccc; font-size: 9px; }
.sig-area { text-align: center; }
.sig-line { border-top: 1px solid #000; width: 180px; margin: 30px auto 4px; }
.eoe { font-size: 8px; color: #999; font-style: italic; }
.esig-inline { margin: 8px 14px; padding: 8px; border: 1px solid #aaa; background: #f9fff9; font-size: 9px; }
.esig-inline img { max-height: 40px; display: block; margin-bottom: 4px; }
"""


def _gst_invoice_html(company: dict, document: dict) -> str:
    data = document.get("data") or {}
    sd = data.get("specialData") or {}

    supplier_gstin = sd.get("supplierGstin") or company.get("gstNumber", "")
    supplier_name = sd.get("supplierName") or company.get("name", "")
    supplier_address = sd.get("supplierAddress") or company.get("address", "")
    supplier_state = sd.get("supplierStateCode", "")
    logo_url = company.get("logoUrl", "")

    invoice_no = sd.get("invoiceNo") or document.get("title", "INV-001")
    invoice_date = sd.get("invoiceDate") or datetime.now().strftime("%d/%m/%Y")
    place_of_supply = sd.get("placeOfSupply", "")
    reverse_charge = sd.get("reverseCharge", "No")

    recipient_gstin = sd.get("recipientGstin", "")
    recipient_name = sd.get("recipientName") or document.get("clientName", "")
    recipient_address = sd.get("recipientAddress", "")
    recipient_state = sd.get("recipientStateCode", "")

    items = sd.get("items") or []
    items_html = ""
    for idx, item in enumerate(items, 1):
        items_html += (
            f"<tr>"
            f"<td class='center'>{idx}</td>"
            f"<td>{item.get('desc','')}</td>"
            f"<td class='center'>{item.get('hsn','')}</td>"
            f"<td class='center'>{item.get('qty','')}</td>"
            f"<td class='center'>{item.get('unit','')}</td>"
            f"<td class='right'>{item.get('rate','')}</td>"
            f"<td class='right'>{item.get('taxableValue','')}</td>"
            f"<td class='center'>{item.get('cgstRate','')}%</td>"
            f"<td class='right'>{item.get('cgstAmt','')}</td>"
            f"<td class='center'>{item.get('sgstRate','')}%</td>"
            f"<td class='right'>{item.get('sgstAmt','')}</td>"
            f"<td class='center'>{item.get('igstRate','')}%</td>"
            f"<td class='right'>{item.get('igstAmt','')}</td>"
            f"</tr>"
        )

    total_taxable = sd.get("totalTaxableValue", "")
    total_cgst = sd.get("totalCGST", "")
    total_sgst = sd.get("totalSGST", "")
    total_igst = sd.get("totalIGST", "")
    total_gst = sd.get("totalGST", "")
    grand_total = sd.get("grandTotal", "")
    amount_words = sd.get("amountInWords", "")
    bank_name = sd.get("bankName") or ""
    account_no = sd.get("accountNo") or ""
    ifsc = sd.get("ifscCode") or ""

    logo_html = f'<img src="{logo_url}" style="max-height:45px;max-width:130px;object-fit:contain;background:rgba(255,255,255,0.2);padding:4px;border-radius:6px;" />' if logo_url else f'<div class="co-name">{supplier_name}</div>'

    e_sig = document.get("eSignature")
    esig_html = ""
    if e_sig:
        dt = datetime.fromtimestamp(e_sig.get("signedAt", 0) / 1000)
        esig_html = f"""<div class="esig-inline">
          <strong>&#10003; Digitally Signed</strong><br/>
          <img src="{e_sig.get('signatureImage','')}" />
          {e_sig.get('signerName','')} | {e_sig.get('signerContact','')} | {dt.strftime('%d %B %Y %I:%M %p')}
        </div>"""

    bank_html = ""
    if bank_name or account_no:
        bank_html = f"""<div class="bank-details">
          <div class="bank-label">Bank Details</div>
          <div>Bank: <strong>{bank_name}</strong></div>
          <div>A/C No: <strong>{account_no}</strong></div>
          <div>IFSC: <strong>{ifsc}</strong></div>
        </div>"""
    else:
        bank_html = '<div class="bank-details"></div>'

    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>{_GST_CSS}</style></head>
<body><div class="page">

  <div class="gst-header">
    <div>{logo_html}<div class="co-meta" style="margin-top:4px;">GSTIN: {supplier_gstin}<br/>{supplier_address}{f'<br/>State Code: {supplier_state}' if supplier_state else ''}</div></div>
    <div><div class="doc-label">TAX INVOICE</div><div class="doc-sub">Original for Recipient</div></div>
  </div>

  <div class="inv-meta">
    <div>Invoice No: <span>{invoice_no}</span></div>
    <div>Invoice Date: <span>{invoice_date}</span></div>
    <div>Place of Supply: <span>{place_of_supply}</span></div>
    <div>Reverse Charge: <span>{reverse_charge}</span></div>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-label">Bill From (Supplier)</div>
      <div class="party-name">{supplier_name}</div>
      <div class="party-detail">{supplier_address}</div>
      <div class="party-gstin">GSTIN: {supplier_gstin}</div>
    </div>
    <div class="party">
      <div class="party-label">Bill To (Recipient)</div>
      <div class="party-name">{recipient_name}</div>
      <div class="party-detail">{recipient_address}</div>
      <div class="party-gstin">{'GSTIN: ' + recipient_gstin if recipient_gstin else 'Unregistered'}</div>
      {f'<div class="party-detail">State Code: {recipient_state}</div>' if recipient_state else ''}
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width:4%">#</th>
        <th class="left" style="width:22%">Description of Goods / Services</th>
        <th style="width:8%">HSN / SAC</th>
        <th style="width:5%">Qty</th>
        <th style="width:5%">Unit</th>
        <th style="width:8%">Rate (&#8377;)</th>
        <th style="width:9%">Taxable Value</th>
        <th style="width:5%">CGST %</th>
        <th style="width:7%">CGST Amt</th>
        <th style="width:5%">SGST %</th>
        <th style="width:7%">SGST Amt</th>
        <th style="width:5%">IGST %</th>
        <th style="width:7%">IGST Amt</th>
      </tr>
    </thead>
    <tbody>
      {items_html}
      <tr style="background:#f8f8f8;">
        <td colspan="6" class="bold right">Total</td>
        <td class="right bold">{total_taxable}</td>
        <td colspan="2" class="right bold">{total_cgst}</td>
        <td colspan="2" class="right bold">{total_sgst}</td>
        <td colspan="2" class="right bold">{total_igst}</td>
      </tr>
    </tbody>
  </table>

  <div class="tax-section">
    {bank_html}
    <div class="tax-summary">
      <div class="tax-row"><span>Total Taxable Value</span><span>&#8377; {total_taxable}</span></div>
      <div class="tax-row"><span>Total CGST</span><span>&#8377; {total_cgst}</span></div>
      <div class="tax-row"><span>Total SGST</span><span>&#8377; {total_sgst}</span></div>
      <div class="tax-row"><span>Total IGST</span><span>&#8377; {total_igst}</span></div>
      <div class="tax-row"><span>Total GST</span><span>&#8377; {total_gst}</span></div>
      <div class="tax-row total"><span>Grand Total</span><span>&#8377; {grand_total}</span></div>
    </div>
  </div>

  <div class="amount-words">
    Amount in Words: <strong>{amount_words}</strong>
  </div>

  {esig_html}

  <div class="gst-footer">
    <div>
      <div class="eoe">E &amp; O.E.</div>
      <div style="margin-top:6px;font-size:9px;">This is a computer-generated invoice.</div>
    </div>
    <div class="sig-area">
      <div class="sig-line"></div>
      Authorized Signatory for {supplier_name}
    </div>
  </div>

</div></body></html>"""


# ─────────────────────────────────────────────────────────────────────────────
# SALARY SLIP  — Standard Monthly Payslip
# ─────────────────────────────────────────────────────────────────────────────

_SALARY_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; font-size: 10px; color: #1a1a1a; background: #fff; padding: 20px; }
.page { max-width: 780px; margin: 0 auto; border: 1.5px solid #ccc; }
.slip-header { background: #1e293b; color: #fff; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; }
.slip-title { font-size: 16px; font-weight: 900; letter-spacing: 1px; }
.slip-period { font-size: 11px; color: rgba(255,255,255,0.75); }
.co-name-header { font-size: 18px; font-weight: 900; }
.co-meta-header { font-size: 9px; color: rgba(255,255,255,0.7); line-height: 1.7; }
.emp-details { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 1.5px solid #ccc; }
.emp-col { padding: 10px 14px; }
.emp-col:first-child { border-right: 1px solid #ccc; }
.emp-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 9.5px; border-bottom: 1px dotted #e5e7eb; }
.emp-row:last-child { border-bottom: none; }
.emp-label { color: #6b7280; font-weight: 600; }
.emp-value { font-weight: 700; }
.attendance { display: flex; gap: 0; border-bottom: 1.5px solid #ccc; background: #f8fafc; }
.att-cell { flex: 1; padding: 8px 14px; border-right: 1px solid #ddd; text-align: center; }
.att-cell:last-child { border-right: none; }
.att-label { font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
.att-value { font-size: 14px; font-weight: 900; color: #1e293b; margin-top: 2px; }
.payroll-table { width: 100%; border-collapse: collapse; }
.payroll-table th { background: #f1f5f9; color: #374151; padding: 7px 12px; text-align: left; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1.5px solid #ccc; }
.payroll-table th:nth-child(2), .payroll-table th:nth-child(4) { text-align: right; }
.payroll-table td { padding: 5px 12px; border-bottom: 1px solid #f0f0f0; font-size: 10px; }
.payroll-table td:nth-child(2), .payroll-table td:nth-child(4) { text-align: right; font-family: 'Courier New', monospace; }
.payroll-table .divider td { background: #f8fafc; font-weight: 900; font-size: 10px; border-top: 1.5px solid #ccc; border-bottom: 1.5px solid #ccc; }
.payroll-table .divider td:nth-child(2), .payroll-table .divider td:nth-child(4) { text-align: right; }
.net-pay-bar { background: #1e293b; color: #fff; display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; }
.net-pay-label { font-size: 11px; font-weight: 900; letter-spacing: 1px; }
.net-pay-amount { font-size: 18px; font-weight: 900; }
.net-words { padding: 8px 14px; font-size: 9.5px; background: #f8fafc; border-top: 1px solid #e5e7eb; }
.slip-footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 12px 14px; border-top: 1.5px solid #ccc; font-size: 9px; color: #888; }
.sig-line { border-top: 1px solid #000; width: 160px; margin-bottom: 4px; }
.esig-inline { margin: 8px 14px; padding: 8px; border: 1px solid #aaa; background: #f9fff9; font-size: 9px; }
.esig-inline img { max-height: 40px; display: block; margin-bottom: 4px; }
"""


def _salary_slip_html(company: dict, document: dict) -> str:
    data = document.get("data") or {}
    sd = data.get("specialData") or {}

    co_name = company.get("name", "")
    co_address = company.get("address", "")
    co_email = company.get("email", "")
    logo_url = company.get("logoUrl", "")

    emp_name = sd.get("employeeName") or document.get("clientName", "")
    emp_id = sd.get("employeeId", "")
    designation = sd.get("designation", "")
    department = sd.get("department", "")
    pan = sd.get("pan", "")
    bank_acc = sd.get("bankAccount", "")
    ifsc = sd.get("ifsc", "")
    uan = sd.get("uan", "")
    month = sd.get("month", "")
    year = sd.get("year", "")
    days_in_month = sd.get("daysInMonth", "")
    days_worked = sd.get("daysWorked", "")
    lop = sd.get("lopDays", "0")

    earnings = sd.get("earnings") or []
    deductions = sd.get("deductions") or []
    gross = sd.get("grossEarnings", "")
    total_ded = sd.get("totalDeductions", "")
    net_pay = sd.get("netPay", "")
    net_words = sd.get("netPayWords", "")

    logo_html = f'<img src="{logo_url}" style="max-height:40px;max-width:120px;object-fit:contain;background:rgba(255,255,255,0.15);padding:4px;border-radius:6px;" />' if logo_url else f'<div class="co-name-header">{co_name}</div>'

    payroll_rows = ""
    for earn, deduct in zip_longest(earnings, deductions, fillvalue={"name": "", "amount": ""}):
        payroll_rows += (
            f"<tr>"
            f"<td>{earn.get('name','')}</td>"
            f"<td>{('&#8377; ' + earn.get('amount','')) if earn.get('amount') else ''}</td>"
            f"<td>{deduct.get('name','')}</td>"
            f"<td>{('&#8377; ' + deduct.get('amount','')) if deduct.get('amount') else ''}</td>"
            f"</tr>"
        )

    e_sig = document.get("eSignature")
    esig_html = ""
    if e_sig:
        dt = datetime.fromtimestamp(e_sig.get("signedAt", 0) / 1000)
        esig_html = f"""<div class="esig-inline">
          <strong>&#10003; Digitally Signed</strong><br/>
          <img src="{e_sig.get('signatureImage','')}" />
          {e_sig.get('signerName','')} | {e_sig.get('signerContact','')} | {dt.strftime('%d %B %Y %I:%M %p')}
        </div>"""

    return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>{_SALARY_CSS}</style></head>
<body><div class="page">

  <div class="slip-header">
    <div>
      {logo_html}
      <div class="co-meta-header" style="margin-top:4px;">{co_address}<br/>{co_email}</div>
    </div>
    <div style="text-align:right;">
      <div class="slip-title">SALARY SLIP</div>
      <div class="slip-period">{month} {year}</div>
    </div>
  </div>

  <div class="emp-details">
    <div class="emp-col">
      <div class="emp-row"><span class="emp-label">Employee Name</span><span class="emp-value">{emp_name}</span></div>
      <div class="emp-row"><span class="emp-label">Employee ID</span><span class="emp-value">{emp_id}</span></div>
      <div class="emp-row"><span class="emp-label">Designation</span><span class="emp-value">{designation}</span></div>
      <div class="emp-row"><span class="emp-label">Department</span><span class="emp-value">{department}</span></div>
    </div>
    <div class="emp-col">
      <div class="emp-row"><span class="emp-label">PAN</span><span class="emp-value">{pan}</span></div>
      <div class="emp-row"><span class="emp-label">Bank Account</span><span class="emp-value">{bank_acc}</span></div>
      <div class="emp-row"><span class="emp-label">IFSC Code</span><span class="emp-value">{ifsc}</span></div>
      <div class="emp-row"><span class="emp-label">UAN</span><span class="emp-value">{uan}</span></div>
    </div>
  </div>

  <div class="attendance">
    <div class="att-cell"><div class="att-label">Days in Month</div><div class="att-value">{days_in_month}</div></div>
    <div class="att-cell"><div class="att-label">Days Worked</div><div class="att-value">{days_worked}</div></div>
    <div class="att-cell"><div class="att-label">LOP Days</div><div class="att-value">{lop}</div></div>
  </div>

  <table class="payroll-table">
    <thead>
      <tr>
        <th style="width:35%">Earnings</th>
        <th style="width:15%">Amount (&#8377;)</th>
        <th style="width:35%">Deductions</th>
        <th style="width:15%">Amount (&#8377;)</th>
      </tr>
    </thead>
    <tbody>
      {payroll_rows}
      <tr class="divider">
        <td>Gross Earnings</td>
        <td>&#8377; {gross}</td>
        <td>Total Deductions</td>
        <td>&#8377; {total_ded}</td>
      </tr>
    </tbody>
  </table>

  <div class="net-pay-bar">
    <div class="net-pay-label">NET PAY</div>
    <div class="net-pay-amount">&#8377; {net_pay}</div>
  </div>

  <div class="net-words">
    Amount in Words: <strong>{net_words}</strong>
  </div>

  {esig_html}

  <div class="slip-footer">
    <div>This is a computer-generated salary slip and does not require a signature.</div>
    <div style="text-align:center;">
      <div class="sig-line"></div>
      Authorized Signatory<br/>{co_name}
    </div>
  </div>

</div></body></html>"""


# ─────────────────────────────────────────────────────────────────────────────
# MAIN DISPATCHER
# ─────────────────────────────────────────────────────────────────────────────

def generate_html(company: dict, document: dict) -> str:
    doc_type = document.get("type", "")
    if doc_type == "form_16":
        return _form16_html(company, document)
    if doc_type == "gst_invoice":
        return _gst_invoice_html(company, document)
    if doc_type == "salary_slip":
        return _salary_slip_html(company, document)
    return _generic_html(company, document)
