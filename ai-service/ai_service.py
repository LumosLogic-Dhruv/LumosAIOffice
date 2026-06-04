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


def _build_prompt(doc_type: str, company_name: str, custom_fields: list, body: str) -> str:
    custom_str = (
        ", ".join(f"{f['fieldName']} ({f['fieldType']})" for f in custom_fields)
        if custom_fields else "None"
    )
    type_hints = {
        "quotation": "Extract client info, project overview, scope, and cost breakdown.",
        "invoice": "Extract services provided, billing structure, totals, and taxes.",
        "proposal": "Generate a detailed project proposal with deliverables and timeline.",
        "sow": "Generate a Statement of Work with detailed tasks and responsibilities.",
        "agreement": "Generate a formal business agreement based on the requirements.",
        "nda": "Generate a Non-Disclosure Agreement for the parties involved.",
    }
    hint = type_hints.get(doc_type, f"Generate structured data for a {doc_type}.")

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


async def generate_document_data(doc_type: str, raw_text: str, company_name: str, custom_fields: list):
    prompt = _build_prompt(
        doc_type, company_name, custom_fields,
        f'User Input: "{raw_text}"'
    )
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
