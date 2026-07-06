import os
import json
import asyncio

from groq import AsyncGroq
from google import genai
from google.genai import types
from google.genai import errors as genai_errors
from dotenv import load_dotenv

load_dotenv()

gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

GROQ_MODEL = "llama-3.3-70b-versatile"


async def _groq(prompt: str) -> str:
    chat = await groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.3,
    )
    return chat.choices[0].message.content


async def _gemini(prompt: str, max_retries: int = 5) -> str:
    delay = 2
    for attempt in range(max_retries):
        try:
            if hasattr(gemini_client, "aio"):
                response = await gemini_client.aio.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(response_mime_type="application/json"),
                )
            else:
                response = gemini_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(response_mime_type="application/json"),
                )
            return response.text
        except genai_errors.APIError as e:
            if getattr(e, "code", None) in [429, 503] and attempt < max_retries - 1:
                print(f"Gemini {e.code} — retrying in {delay}s ({attempt+1}/{max_retries})")
                await asyncio.sleep(delay)
                delay *= 2
            else:
                raise


async def _generate(prompt: str) -> str:
    """Try Groq (fast) → fallback to Gemini."""
    try:
        print("Using Groq...")
        return await _groq(prompt)
    except Exception as e:
        print(f"Groq failed ({e}) — falling back to Gemini")
        return await _gemini(prompt)


def _build_form16_prompt(company_name: str, body: str) -> str:
    return f"""Act as a senior Chartered Accountant for {company_name}.
Generate a complete Form 16 TDS Certificate based on the information below.
{body}

Return ONLY valid JSON with this exact structure (fill in all values from the input, use "0" for missing amounts):
{{
  "clientName": "employee full name",
  "title": "Form 16 - TDS Certificate",
  "sections": [{{"heading": "Summary", "content": "Gross Salary: [amount] | Net Taxable Income: [amount] | TDS Deducted: [amount]"}}],
  "tables": [],
  "summary": {{"Gross Salary": "", "Net Taxable Income": "", "Tax Payable": "", "TDS Deducted": ""}},
  "terms": "Certified that the above particulars are in accordance with the books of accounts.",
  "specialData": {{
    "employerName": "{company_name}",
    "employerAddress": "employer address",
    "employeeName": "employee full name",
    "employeeDesignation": "designation",
    "panDeductor": "employer PAN",
    "tanDeductor": "employer TAN",
    "panEmployee": "employee PAN",
    "citTds": "CIT (TDS)",
    "assessmentYear": "AY XXXX-XX",
    "periodFrom": "DD/MM/YYYY",
    "periodTo": "DD/MM/YYYY",
    "quarters": [
      {{"q": "Quarter 1", "receipt": "", "deducted": "0", "deposited": "0"}},
      {{"q": "Quarter 2", "receipt": "", "deducted": "0", "deposited": "0"}},
      {{"q": "Quarter 3", "receipt": "", "deducted": "0", "deposited": "0"}},
      {{"q": "Quarter 4", "receipt": "", "deducted": "0", "deposited": "0"}}
    ],
    "totalDeducted": "0",
    "totalDeposited": "0",
    "salary17_1": "0",
    "perquisites17_2": "0",
    "profitsInLieu17_3": "0",
    "grossSalaryTotal": "0",
    "exemptAllowances": [{{"name": "HRA", "amount": "0"}}, {{"name": "Transport Allowance", "amount": "0"}}],
    "totalExempt": "0",
    "balance": "0",
    "entertainmentAllowance": "0",
    "taxOnEmployment": "0",
    "aggregateDeductions": "0",
    "incomeUnderSalaries": "0",
    "otherIncome": [],
    "totalOtherIncome": "0",
    "grossTotalIncome": "0",
    "deductions80C": [{{"name": "LIC", "gross": "0", "deductible": "0"}}, {{"name": "PPF", "gross": "0", "deductible": "0"}}],
    "total80CGross": "0",
    "total80CDeductible": "0",
    "section80CCC": "0",
    "section80CCD": "0",
    "otherVIA": [],
    "totalVIA": "0",
    "totalIncome": "0",
    "taxOnIncome": "0",
    "educationCess": "0",
    "taxPayable": "0",
    "reliefU89": "0",
    "netTaxPayable": "0",
    "place": "",
    "signatoryName": "",
    "designation": ""
  }}
}}"""


def _build_gst_invoice_prompt(company_name: str, body: str) -> str:
    return f"""Act as a senior accountant for {company_name}.
Generate a GST-compliant Tax Invoice based on the information below.
{body}

Return ONLY valid JSON with this exact structure:
{{
  "clientName": "recipient name",
  "title": "GST Invoice",
  "sections": [],
  "tables": [],
  "summary": {{"Total Taxable Value": "", "Total GST": "", "Grand Total": ""}},
  "terms": "E&OE. Subject to local jurisdiction. This is a computer-generated invoice.",
  "specialData": {{
    "invoiceNo": "INV-001",
    "invoiceDate": "DD/MM/YYYY",
    "placeOfSupply": "State name",
    "reverseCharge": "No",
    "supplierGstin": "supplier GSTIN",
    "supplierName": "{company_name}",
    "supplierAddress": "supplier address",
    "supplierStateCode": "XX",
    "recipientGstin": "recipient GSTIN or empty",
    "recipientName": "recipient name",
    "recipientAddress": "recipient address",
    "recipientStateCode": "XX",
    "items": [
      {{
        "desc": "description of goods/service",
        "hsn": "HSN/SAC code",
        "qty": "1",
        "unit": "Nos",
        "rate": "0",
        "taxableValue": "0",
        "cgstRate": "9",
        "cgstAmt": "0",
        "sgstRate": "9",
        "sgstAmt": "0",
        "igstRate": "0",
        "igstAmt": "0"
      }}
    ],
    "totalTaxableValue": "0",
    "totalCGST": "0",
    "totalSGST": "0",
    "totalIGST": "0",
    "totalGST": "0",
    "grandTotal": "0",
    "amountInWords": "Rupees ... Only",
    "bankName": "",
    "accountNo": "",
    "ifscCode": ""
  }}
}}"""


def _build_salary_slip_prompt(company_name: str, body: str) -> str:
    return f"""Act as an HR manager for {company_name}.
Generate a monthly salary slip based on the information below.
{body}

Return ONLY valid JSON with this exact structure:
{{
  "clientName": "employee name",
  "title": "Salary Slip",
  "sections": [],
  "tables": [],
  "summary": {{"Gross Earnings": "", "Total Deductions": "", "Net Pay": ""}},
  "terms": "This is a computer-generated salary slip and does not require a signature.",
  "specialData": {{
    "employeeId": "EMP-001",
    "employeeName": "employee full name",
    "designation": "designation",
    "department": "department",
    "pan": "PAN number",
    "bankAccount": "account number",
    "ifsc": "IFSC code",
    "uan": "UAN number",
    "month": "Month name",
    "year": "YYYY",
    "daysInMonth": "30",
    "daysWorked": "30",
    "lopDays": "0",
    "earnings": [
      {{"name": "Basic Salary", "amount": "0"}},
      {{"name": "HRA", "amount": "0"}},
      {{"name": "Conveyance Allowance", "amount": "0"}},
      {{"name": "Special Allowance", "amount": "0"}}
    ],
    "grossEarnings": "0",
    "deductions": [
      {{"name": "Provident Fund (12%)", "amount": "0"}},
      {{"name": "Professional Tax", "amount": "0"}},
      {{"name": "TDS", "amount": "0"}}
    ],
    "totalDeductions": "0",
    "netPay": "0",
    "netPayWords": "Rupees ... Only"
  }}
}}"""


def _build_prompt(doc_type: str, company_name: str, custom_fields: list, body: str) -> str:
    custom_str = (
        ", ".join(f"{f['fieldName']} ({f['fieldType']})" for f in custom_fields)
        if custom_fields else "None"
    )
    type_hints = {
        "quotation": "Generate a formal price quotation following official standards. Include sections: Project Overview, Scope of Work, Deliverables, Project Timeline, Pricing Breakdown. Add an itemized pricing table (Description, Qty, Unit Rate, Amount). Summary must have Subtotal, Tax, Total.",
        "invoice": "Generate an official tax invoice. Include sections: Invoice Details, Services/Products Rendered. Add an itemized table (Item, Description, Qty, Rate, Amount). Summary must have Subtotal, Tax (GST/VAT %), Total Amount Due.",
        "proforma_invoice": "Generate a proforma invoice (advance billing estimate). Include sections: Proforma Details, Terms of Delivery. Add items table (Description, Qty, Rate, Amount). Summary: Subtotal, Tax, Grand Total.",
        "proposal": "Generate a comprehensive professional project proposal. Include sections: Executive Summary, Problem Statement, Proposed Solution, Scope and Deliverables, Project Timeline, Investment and Pricing, About Our Company. Add a timeline table (Phase, Tasks, Duration).",
        "sow": "Generate a detailed Statement of Work. Include sections: Project Overview and Objectives, Detailed Scope of Work, Out-of-Scope Items, Deliverables and Acceptance Criteria, Change Management Process. Add a milestones table (Milestone, Description, Delivery Date).",
        "agreement": "Generate a formal business agreement/contract. Include sections: Parties and Background, Services and Obligations, Payment Terms, Intellectual Property, Confidentiality, Termination Clause, Governing Law. Use professional legal language.",
        "nda": "Generate a Non-Disclosure Agreement. Include sections: Parties, Definition of Confidential Information, Disclosure Obligations and Restrictions, Permitted Disclosures and Exclusions, Duration, Return of Information, Remedies. Use formal legal language.",
        "receipt": "Generate an official payment receipt. Include sections: Receipt Details, Payment Confirmation. Add a payment summary table (Description, Amount). Summary: Total Amount Received, Payment Method, Balance Due (if any).",
        "timeline": "Generate a project timeline document. Include sections: Project Overview, Phase Breakdown, Key Dependencies, Risk Factors. Add a milestone table (Phase, Tasks, Start Date, End Date, Status).",
        "form_16": "Generate a Form 16 TDS Certificate as per Indian Income Tax Act. Include sections: Part A - TDS Summary (quarterly TDS table with Quarter, Amount Paid, TDS Deducted), Part B - Salary Details (Basic, HRA, Special Allowance, Other Allowances), Deductions Under Chapter VI-A (80C, 80D, 80G etc.), Tax Computation. Summary: Gross Salary, Total Deductions, Net Taxable Income, Total Tax Payable, Total TDS Deducted.",
        "gst_invoice": "Generate a GST-compliant tax invoice as per Indian GST laws. Include sections: Invoice Details (Invoice No, Date, Place of Supply, Reverse Charge Y/N), Supplier Details (GSTIN, Address, State Code), Recipient Details (GSTIN if registered, Address). Add an items table (Description, HSN/SAC Code, Qty, Unit, Rate, Taxable Value, CGST Rate, CGST Amt, SGST Rate, SGST Amt). Summary: Total Taxable Value, Total CGST, Total SGST, Total GST, Invoice Total. Terms must include E&OE.",
        "salary_slip": "Generate a monthly employee salary slip. Include sections: Employee Information (Name, Employee ID, Designation, Department, PAN, Bank Account No, Month and Year), Leave Summary. Add Earnings table (Basic Salary, HRA, Conveyance Allowance, Special Allowance, Other — each with amount). Add Deductions table (Provident Fund, ESI, Professional Tax, TDS, Other). Summary: Gross Earnings, Total Deductions, Net Pay (amount in words).",
        "offer_letter": "Generate a formal employment offer letter. Include sections: Congratulations and Position Details (Designation, Department, Reporting To, Date of Joining, Work Location), Compensation and Benefits (CTC table: Basic, HRA, Allowances, PF, Gratuity, Annual CTC), Work Schedule and Policies, Key Responsibilities, Terms of Employment (Probation period, Notice period, Confidentiality clause), Acceptance Instructions. Use a warm yet professional tone.",
        "policy": "Generate a formal company policy document. Include sections: Policy Overview (Title, Version, Effective Date, Approved By), Purpose, Scope (who this policy applies to), Policy Statement (detailed rules and guidelines), Employee Responsibilities, Management Responsibilities, Compliance and Monitoring, Consequences of Non-Compliance, Review and Revision Schedule. Use authoritative formal language.",
        "experience_letter": "Generate an employment experience or relieving letter. Include sections: To Whom It May Concern, Employee Details (Full Name, Designation, Department, Employee ID, Date of Joining, Last Working Date), Employment Confirmation, Roles and Responsibilities held, Performance and Character Assessment, Official Relieving Statement, Best Wishes. Formal, positive professional tone.",
        "service_agreement": "Generate a comprehensive service agreement. Include sections: Parties and Recitals, Description of Services (detailed scope), Fees and Payment Schedule table (Milestone, Amount, Due Date), Term and Renewal, Termination (with and without cause), Intellectual Property Rights, Confidentiality and Non-Solicitation, Limitation of Liability, Representations and Warranties, Dispute Resolution, Governing Law and Jurisdiction. Professional legal language.",
    }
    hint = type_hints.get(doc_type, f"Generate a professional {doc_type} document with appropriate sections and tables.")

    return f"""Act as a senior business consultant for {company_name}.
{hint}

{body}

Company Custom Fields (include if relevant): {custom_str}

STRICT RULES:
1. Do NOT use Markdown symbols like ###, **, or * in content.
2. Use plain text only. For lists use dashes - or numbers 1.
3. Return ONLY a valid JSON object with this structure:
{{
  "clientName": "...",
  "title": "...",
  "sections": [{{"heading": "...", "content": "..."}}],
  "tables": [{{"title": "...", "headers": ["..."], "rows": [["..."]]}}],
  "summary": {{"Subtotal": "...", "Tax": "...", "Total": "..."}},
  "terms": "..."
}}"""


_TONE_INSTRUCTIONS = {
    "professional": "",
    "friendly": "Use a warm, friendly, and approachable tone throughout. Write conversationally while remaining professional.",
    "formal": "Use highly formal, authoritative language. Avoid contractions. Use passive voice where appropriate.",
    "concise": "Be extremely concise. Use short sentences. Cut all filler words. Every sentence must add value.",
}


async def generate_document_data(
    doc_type: str, raw_text: str, company_name: str, custom_fields: list, tone: str = "professional"
):
    tone_instruction = _TONE_INSTRUCTIONS.get(tone, "")
    body = f'User Input: "{raw_text}"'
    if tone_instruction:
        body = f"Tone requirement: {tone_instruction}\n\n{body}"

    if doc_type == "form_16":
        prompt = _build_form16_prompt(company_name, body)
    elif doc_type == "gst_invoice":
        prompt = _build_gst_invoice_prompt(company_name, body)
    elif doc_type == "salary_slip":
        prompt = _build_salary_slip_prompt(company_name, body)
    else:
        prompt = _build_prompt(doc_type, company_name, custom_fields, body)
    return json.loads(await _generate(prompt))


async def edit_document_data(doc_type: str, instruction: str, existing_data: dict, custom_fields: list):
    prompt = f"""You are an AI editor. Update the following {doc_type} document based on the instruction.

Instruction: "{instruction}"
Existing Data: {json.dumps(existing_data)}

STRICT RULES:
1. Do NOT use Markdown symbols like ###, **, or *.
2. Return the FULL updated JSON object maintaining the original structure exactly.
3. Only return valid JSON, no extra text."""
    return json.loads(await _generate(prompt))
