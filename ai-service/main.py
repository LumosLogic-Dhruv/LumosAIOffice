import os
import traceback
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
import ai_service
from schema import GenerateDocumentRequest, EditDocumentRequest

load_dotenv()

app = FastAPI(title="AI Office Document Automation Service")

from google.api_core import exceptions

@app.post("/generate-document")
async def generate_document(data: GenerateDocumentRequest):
    try:
        result = await ai_service.generate_document_data(
            data.type, 
            data.raw_text, 
            data.company_name, 
            data.custom_fields
        )
        return result
    except exceptions.ResourceExhausted as e:
        raise HTTPException(status_code=429, detail="Gemini API Quota Exceeded. Please try again in a minute or check your billing/API key.")
    except Exception as e:
        print("Error in AI Service (Generate):")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/edit-document")
async def edit_document(data: EditDocumentRequest):
    try:
        result = await ai_service.edit_document_data(
            data.type, 
            data.instruction, 
            data.existing_data,
            data.custom_fields
        )
        return result
    except Exception as e:
        print("Error in AI Service (Edit):")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "AI Document Automation Service is online"}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
