import os
import traceback

import services.cloudinary_service  # noqa: F401 — initializes Cloudinary on startup
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.genai import errors as genai_errors

import ai_service
from routers import auth, company, documents, admin, clients, catalog
from schema import EditDocumentRequest, GenerateDocumentRequest

load_dotenv()

if not os.getenv("JWT_SECRET"):
    raise RuntimeError("FATAL: JWT_SECRET is not defined in .env")

app = FastAPI(title="DocuFlow AI Backend", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Existing AI-only endpoints (kept for direct access / testing) ──────────────

@app.post("/generate-document")
async def generate_document(data: GenerateDocumentRequest):
    try:
        return await ai_service.generate_document_data(
            data.type, data.raw_text, data.company_name, data.custom_fields
        )
    except genai_errors.APIError as e:
        code = getattr(e, "code", None)
        if code == 429:
            raise HTTPException(status_code=429, detail="Gemini API Quota Exceeded. Please try again in a minute.")
        if code == 503:
            raise HTTPException(status_code=503, detail="Gemini API is currently overloaded. Please try again.")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/edit-document")
async def edit_document(data: EditDocumentRequest):
    try:
        return await ai_service.edit_document_data(
            data.type, data.instruction, data.existing_data, data.custom_fields
        )
    except genai_errors.APIError as e:
        code = getattr(e, "code", None)
        if code == 429:
            raise HTTPException(status_code=429, detail="Gemini API Quota Exceeded. Please try again in a minute.")
        if code == 503:
            raise HTTPException(status_code=503, detail="Gemini API is currently overloaded. Please try again.")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def health_check():
    return {"message": "QuotationMaker Unified Backend is online"}


# ── API routers ────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(company.router)
app.include_router(documents.router)
app.include_router(admin.router)
app.include_router(clients.router)
app.include_router(catalog.router)

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
