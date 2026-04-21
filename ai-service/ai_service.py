import os
import json
import asyncio
from google import genai
from google.genai import types
from google.genai import errors
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

async def _generate_with_retry(prompt, max_retries=5):
    """Helper function to retry Gemini API calls with exponential backoff."""
    delay = 2
    for attempt in range(max_retries):
        try:
            # We use the async client if available, otherwise fallback to sync
            if hasattr(client, 'aio'):
                response = await client.aio.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    )
                )
            else:
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    )
                )
            return response
        except errors.APIError as e:
            if getattr(e, 'code', None) in [429, 503] and attempt < max_retries - 1:
                print(f"Gemini API returned {e.code}. Retrying in {delay} seconds... (Attempt {attempt+1}/{max_retries})")
                await asyncio.sleep(delay)
                delay *= 2
            else:
                raise e

async def generate_document_data(doc_type, raw_text, company_name, custom_fields):
    
    custom_fields_str = ", ".join([f"{f['fieldName']} ({f['fieldType']})" for f in custom_fields]) if custom_fields else "None"
    
    prompts = {
        "quotation": f"Extract client info, project overview, scope, and cost breakdown for a Quotation.",
        "invoice": f"Extract services provided, billing structure, totals, and taxes for an Invoice.",
        "proposal": f"Generate a detailed project proposal including description, deliverables, and timeline.",
        "sow": f"Generate a Statement of Work with detailed tasks and responsibilities.",
        "agreement": f"Generate a formal business agreement/contract based on the requirements.",
        "nda": f"Generate a Non-Disclosure Agreement for the parties involved."
    }
    
    selected_prompt = prompts.get(doc_type, f"Generate structured data for a {doc_type}.")
    
    prompt = f"""
    Act as a senior business consultant for {company_name}.
    {selected_prompt}
    
    User Input: "{raw_text}"
    
    Company Custom Fields to include if relevant: {custom_fields_str}
    
    STRICT FORMATTING RULES:
    1. Do NOT use Markdown symbols like '###', '**', or '*' in the content.
    2. Use plain text only. 
    3. For lists, use simple dashes '-' or numbers '1.' followed by a space.
    4. Ensure the JSON is valid and sections are professionally worded.
    
    Return ONLY a valid JSON object. 
    The structure should be:
    {{
        "clientName": "...",
        "title": "...",
        "sections": [
            {{ "heading": "...", "content": "..." }}
        ],
        "tables": [
            {{ "title": "...", "headers": ["...", "..."], "rows": [["...", "..."]] }}
        ],
        "summary": {{ "Total": "...", "Tax": "...", "GrandTotal": "..." }},
        "customFields": {{ "fieldName": "value" }}
    }}
    
    Ensure all amounts are numbers where possible.
    """

    response = await _generate_with_retry(prompt)
    return json.loads(response.text)

async def edit_document_data(doc_type, instruction, existing_data, custom_fields):
    
    prompt = f"""
    You are an AI editor. Update the following {doc_type} data based on the user's instruction.
    
    Instruction: "{instruction}"
    
    Existing Data: {json.dumps(existing_data)}
    
    Return the FULL updated JSON object maintaining the original structure.
    """

    response = await _generate_with_retry(prompt)
    return json.loads(response.text)
