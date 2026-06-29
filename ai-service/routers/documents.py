import traceback
import time
import secrets
from typing import Any, Dict, Optional

import cloudinary.uploader
import io
from fastapi import APIRouter, Depends, HTTPException
from google.genai import errors as genai_errors
from pydantic import BaseModel

import ai_service
import convex_client
from middleware.auth import get_current_user
from services.pdf_service import generate_pdf
from services.template_service import generate_html

router = APIRouter(prefix="/api/documents", tags=["documents"])

DEFAULT_TERMS: dict[str, str] = {
    "quotation": "All prices are valid for 30 days. 50% advance payment is required to initiate the project.",
    "invoice": "Payment is due within 7 days of the invoice date.",
    "proforma_invoice": "This is a proforma invoice. Final invoice will be generated upon receipt of payment.",
    "receipt": "Thank you for your payment. This is an official receipt.",
    "proposal": "This proposal is valid for 15 days.",
    "sow": "Any additional requirements will be treated as a separate change request.",
    "agreement": "This agreement is subject to the terms of the signed master contract.",
    "nda": "All information disclosed remains strictly confidential for 3 years.",
    "timeline": "Timelines are estimates. Delays in feedback may shift the final delivery date.",
    "form_16": "This Form 16 is issued under Section 203 of the Income Tax Act, 1961. Please verify all details with your Chartered Accountant before filing.",
    "gst_invoice": "E&OE. Goods once sold will not be taken back or exchanged. Subject to local jurisdiction. This is a computer-generated invoice.",
    "salary_slip": "This is a computer-generated salary slip and does not require a physical signature. For any discrepancies, please contact the HR department.",
    "offer_letter": "This offer is conditional upon successful completion of background verification and document submission. This offer is valid for 7 days from the date of issue.",
    "policy": "This policy supersedes all previous versions on the same subject. Non-compliance may result in disciplinary action as per company HR policies.",
    "experience_letter": "This letter is issued on request of the employee for the purpose of future employment only and carries no other obligation.",
    "service_agreement": "This agreement shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in the city mentioned herein.",
}


async def _log_activity(current_user: dict, document: dict, action: str):
    try:
        await convex_client.mutation("activityLogs:log", {
            "companyId": current_user["companyId"],
            "userId": current_user["_id"],
            "userName": current_user.get("name", "Unknown"),
            "documentId": document["_id"],
            "documentTitle": document.get("title", "Untitled"),
            "action": action,
        })
    except Exception:
        pass


async def _sync_pdf(company: dict, document: dict) -> dict:
    try:
        old_pid = document.get("cloudinaryPdfPublicId")
        if old_pid:
            cloudinary.uploader.destroy(old_pid, resource_type="image")

        html = generate_html(company, document)
        file_name = f"{document.get('type')}_{document['_id']}_{int(time.time() * 1000)}"
        result = await generate_pdf(html, file_name)

        updated = await convex_client.mutation("documents:update", {
            "id": document["_id"],
            "pdfUrl": result["secure_url"],
            "cloudinaryPdfPublicId": result["public_id"],
        })
        return updated
    except Exception:
        traceback.print_exc()
        return document


@router.get("")
async def get_documents(current_user: dict = Depends(get_current_user)):
    return await convex_client.query("documents:list", {"companyId": current_user["companyId"]})


class CreateDocumentRequest(BaseModel):
    type: str
    title: str
    clientName: str
    data: Dict[str, Any]


@router.post("", status_code=201)
async def create_document(req: CreateDocumentRequest, current_user: dict = Depends(get_current_user)):
    doc_data = req.data
    if not doc_data.get("terms"):
        company = await convex_client.query("companies:getById", {"id": current_user["companyId"]})
        doc_data["terms"] = DEFAULT_TERMS.get(req.type) or (company or {}).get("defaultTerms", "")

    return await convex_client.mutation("documents:create", {
        "companyId": current_user["companyId"],
        "type": req.type,
        "title": req.title,
        "clientName": req.clientName,
        "data": doc_data,
    })


class ProcessAIRequest(BaseModel):
    type: str
    rawText: str


@router.post("/process-ai")
async def process_ai(req: ProcessAIRequest, current_user: dict = Depends(get_current_user)):
    company = await convex_client.query("companies:getById", {"id": current_user["companyId"]})
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found.")

    try:
        ai_data = await ai_service.generate_document_data(
            req.type, req.rawText, company.get("name", ""), company.get("customFields", [])
        )
    except genai_errors.APIError as e:
        code = getattr(e, "code", None)
        if code == 429:
            raise HTTPException(status_code=429, detail="AI Quota Exceeded. Please try again.")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not ai_data.get("terms"):
        ai_data["terms"] = DEFAULT_TERMS.get(req.type) or company.get("defaultTerms", "")

    return ai_data


@router.get("/{doc_id}")
async def get_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")
    await _log_activity(current_user, doc, "viewed")
    return doc


class UpdatePermissionRequest(BaseModel):
    permission: str  # "all" | "owner_only"


@router.put("/{doc_id}/permission")
async def update_document_permission(
    doc_id: str,
    req: UpdatePermissionRequest,
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only the owner can change document permissions")
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")
    new_data = {**(doc.get("data") or {}), "editPermission": req.permission}
    updated = await convex_client.mutation("documents:update", {"id": doc_id, "data": new_data})
    return updated


class UpdateDocumentRequest(BaseModel):
    data: Optional[Dict[str, Any]] = None
    title: Optional[str] = None
    clientName: Optional[str] = None
    pdfUrl: Optional[str] = None
    cloudinaryPdfPublicId: Optional[str] = None


@router.put("/{doc_id}")
async def update_document(
    doc_id: str,
    req: UpdateDocumentRequest,
    current_user: dict = Depends(get_current_user),
):
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")

    if current_user.get("role") != "admin":
        edit_perm = (doc.get("data") or {}).get("editPermission", "all")
        if edit_perm == "owner_only":
            raise HTTPException(status_code=403, detail="Only the document owner can edit this document")

    version_snapshot = {
        "data": doc["data"],
        "pdfUrl": doc.get("pdfUrl"),
        "cloudinaryPdfPublicId": doc.get("cloudinaryPdfPublicId"),
        "updatedAt": doc.get("updatedAt", int(time.time() * 1000)),
    }

    update_args: dict = {"id": doc_id, "versionSnapshot": version_snapshot}
    for field in ("data", "title", "clientName", "pdfUrl", "cloudinaryPdfPublicId"):
        value = getattr(req, field)
        if value is not None:
            update_args[field] = value

    updated = await convex_client.mutation("documents:update", update_args)
    company = await convex_client.query("companies:getById", {"id": current_user["companyId"]})
    updated = await _sync_pdf(company, updated)
    await _log_activity(current_user, updated, "edited")
    return updated


class EditAIRequest(BaseModel):
    instruction: str


@router.post("/{doc_id}/edit-ai")
async def edit_ai(doc_id: str, req: EditAIRequest, current_user: dict = Depends(get_current_user)):
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")

    if current_user.get("role") != "admin":
        edit_perm = (doc.get("data") or {}).get("editPermission", "all")
        if edit_perm == "owner_only":
            raise HTTPException(status_code=403, detail="Only the document owner can edit this document")

    company = await convex_client.query("companies:getById", {"id": current_user["companyId"]})

    try:
        updated_data = await ai_service.edit_document_data(
            doc["type"], req.instruction, doc["data"], (company or {}).get("customFields", [])
        )
    except genai_errors.APIError as e:
        code = getattr(e, "code", None)
        if code == 429:
            raise HTTPException(status_code=429, detail="AI Quota Exceeded. Please try again.")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    version_snapshot = {
        "data": doc["data"],
        "pdfUrl": doc.get("pdfUrl"),
        "cloudinaryPdfPublicId": doc.get("cloudinaryPdfPublicId"),
        "updatedAt": doc.get("updatedAt", int(time.time() * 1000)),
    }

    updated = await convex_client.mutation("documents:update", {
        "id": doc_id,
        "data": updated_data,
        "versionSnapshot": version_snapshot,
    })

    updated = await _sync_pdf(company, updated)
    await _log_activity(current_user, updated, "ai_edited")
    return updated


@router.post("/{doc_id}/generate-pdf")
async def generate_document_pdf(doc_id: str, current_user: dict = Depends(get_current_user)):
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")

    company = await convex_client.query("companies:getById", {"id": current_user["companyId"]})
    updated = await _sync_pdf(company, doc)
    return {"pdfUrl": updated.get("pdfUrl")}


@router.get("/{doc_id}/history")
async def get_document_history(doc_id: str, current_user: dict = Depends(get_current_user)):
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")
    return await convex_client.query("documents:getHistory", {"id": doc_id})


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")
    await _log_activity(current_user, doc, "deleted")
    await convex_client.mutation("documents:remove", {"id": doc_id})
    return {"success": True}


@router.post("/{doc_id}/duplicate")
async def duplicate_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")
    new_doc = await convex_client.mutation("documents:create", {
        "companyId": current_user["companyId"],
        "type": doc["type"],
        "title": f"Copy of {doc['title']}",
        "clientName": doc["clientName"],
        "data": doc["data"],
    })
    await _log_activity(current_user, doc, "duplicated")
    return new_doc


@router.post("/{doc_id}/share")
async def create_share_link(doc_id: str, current_user: dict = Depends(get_current_user)):
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")

    token = doc.get("shareToken") or secrets.token_urlsafe(20)
    await convex_client.mutation("documents:update", {"id": doc_id, "shareToken": token})
    await _log_activity(current_user, doc, "shared")
    return {"shareToken": token}


@router.delete("/{doc_id}/share")
async def revoke_share_link(doc_id: str, current_user: dict = Depends(get_current_user)):
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")
    await convex_client.mutation("documents:update", {"id": doc_id, "shareToken": None})
    return {"success": True}


@router.get("/shared/{token}")
async def get_shared_document(token: str):
    doc = await convex_client.query("documents:getByShareToken", {"shareToken": token})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or share link revoked")
    company = await convex_client.query("companies:getById", {"id": doc["companyId"]})
    return {"document": doc, "company": company}


class ESignRequest(BaseModel):
    signerName: str
    signerContact: str
    signatureImage: str


@router.post("/shared/{token}/sign")
async def sign_document(token: str, req: ESignRequest):
    doc = await convex_client.query("documents:getByShareToken", {"shareToken": token})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or share link expired")

    if not (doc.get("data") or {}).get("eSignRequest"):
        raise HTTPException(status_code=400, detail="E-signature was not requested for this document")

    if doc.get("eSignature"):
        raise HTTPException(status_code=400, detail="Document has already been signed")

    e_signature = {
        "signerName": req.signerName,
        "signerContact": req.signerContact,
        "signatureImage": req.signatureImage,
        "signedAt": int(time.time() * 1000),
    }

    updated = await convex_client.mutation("documents:update", {
        "id": doc["_id"],
        "eSignature": e_signature,
    })

    company = await convex_client.query("companies:getById", {"id": doc["companyId"]})
    await _sync_pdf(company, updated)

    return {"success": True, "signedAt": e_signature["signedAt"]}
