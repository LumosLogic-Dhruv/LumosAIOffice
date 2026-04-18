from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class CustomField(BaseModel):
    fieldName: str
    fieldType: str

class GenerateDocumentRequest(BaseModel):
    type: str
    raw_text: str
    company_name: str
    custom_fields: Optional[List[Dict[str, Any]]] = []

class EditDocumentRequest(BaseModel):
    type: str
    instruction: str
    existing_data: Dict[str, Any]
    custom_fields: Optional[List[Dict[str, Any]]] = []
