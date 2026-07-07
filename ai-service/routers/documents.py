import os
import re
import traceback
import time
import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import cloudinary.uploader
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from google.genai import errors as genai_errors
from pydantic import BaseModel

import ai_service
import convex_client
from middleware.auth import get_current_user
from middleware.rate_limiter import limiter
from services.email_service import send_esign_notification, send_document_shared_email, send_otp_email
from services.pdf_service import generate_pdf
from services.template_service import generate_html

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

_INJECTION_RE = re.compile(
    r"(ignore\s+(previous|all|above)\s+instructions|system\s+prompt|"
    r"you\s+are\s+now\s+|act\s+as\s+[a-z]|disregard\s+(all|previous)|"
    r"jailbreak|pretend\s+to\s+be|forget\s+(all|previous)\s+instructions|"
    r"override\s+(instructions|system)|new\s+instructions\s*:)",
    re.IGNORECASE,
)
_MAX_AI_INPUT = 5000


def _validate_ai_input(text: str) -> str:
    text = text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Input cannot be empty.")
    if len(text) > _MAX_AI_INPUT:
        raise HTTPException(
            status_code=400,
            detail=f"Input too long. Maximum {_MAX_AI_INPUT} characters allowed.",
        )
    if _INJECTION_RE.search(text):
        raise HTTPException(
            status_code=400,
            detail="Invalid input detected. Please describe your document content naturally.",
        )
    return text

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


async def _sync_pdf_task(company_id: str, document: dict) -> None:
    """Background task wrapper — fetches fresh company then generates PDF."""
    try:
        company = await convex_client.query("companies:getById", {"id": company_id})
        await _sync_pdf(company, document)
    except Exception:
        traceback.print_exc()


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


@router.get("/stats")
async def get_document_stats(current_user: dict = Depends(get_current_user)):
    return await convex_client.query("documents:getStats", {"companyId": current_user["companyId"]})


@router.get("")
async def get_documents(
    current_user: dict = Depends(get_current_user),
    cursor: Optional[str] = None,
    limit: int = 20,
    paginate: bool = False,
):
    if paginate or cursor is not None:
        result = await convex_client.query("documents:listPaginated", {
            "companyId": current_user["companyId"],
            "paginationOpts": {
                "numItems": min(limit, 100),
                "cursor": cursor,
                "id": 1,
            },
        })
        return result  # {page: [...], isDone: bool, continueCursor: str}
    return await convex_client.query("documents:list", {"companyId": current_user["companyId"]})


class CreateDocumentRequest(BaseModel):
    type: str
    title: str
    clientName: str
    data: Dict[str, Any]


@router.post("", status_code=201)
async def create_document(req: CreateDocumentRequest, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == "viewer":
        raise HTTPException(status_code=403, detail="Viewers cannot create documents")
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
    tone: str = "professional"


@router.post("/process-ai")
@limiter.limit("20/hour")
async def process_ai(request: Request, req: ProcessAIRequest, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == "viewer":
        raise HTTPException(status_code=403, detail="Viewers cannot create documents")
    company = await convex_client.query("companies:getById", {"id": current_user["companyId"]})
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found.")

    safe_text = _validate_ai_input(req.rawText)

    try:
        ai_data = await ai_service.generate_document_data(
            req.type, safe_text, company.get("name", ""), company.get("customFields", []), req.tone
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
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
):
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")

    if current_user.get("role") == "viewer":
        raise HTTPException(status_code=403, detail="Viewers cannot edit documents")
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
    background_tasks.add_task(_sync_pdf_task, current_user["companyId"], updated)
    await _log_activity(current_user, updated, "edited")
    return updated


class EditAIRequest(BaseModel):
    instruction: str


@router.post("/{doc_id}/edit-ai")
@limiter.limit("20/hour")
async def edit_ai(request: Request, doc_id: str, req: EditAIRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")

    if current_user.get("role") == "viewer":
        raise HTTPException(status_code=403, detail="Viewers cannot edit documents")
    if current_user.get("role") != "admin":
        edit_perm = (doc.get("data") or {}).get("editPermission", "all")
        if edit_perm == "owner_only":
            raise HTTPException(status_code=403, detail="Only the document owner can edit this document")

    company = await convex_client.query("companies:getById", {"id": current_user["companyId"]})

    safe_instruction = _validate_ai_input(req.instruction)

    try:
        updated_data = await ai_service.edit_document_data(
            doc["type"], safe_instruction, doc["data"], (company or {}).get("customFields", [])
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

    background_tasks.add_task(_sync_pdf_task, current_user["companyId"], updated)
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
    if doc.get("shareExpiresAt") and int(time.time() * 1000) > doc["shareExpiresAt"]:
        raise HTTPException(status_code=410, detail="This share link has expired.")
    company = await convex_client.query("companies:getById", {"id": doc["companyId"]})
    return {"document": doc, "company": company}


class PaymentStatusRequest(BaseModel):
    paymentStatus: str  # unpaid | paid | overdue | na


@router.patch("/{doc_id}/payment-status")
async def update_payment_status(
    doc_id: str, req: PaymentStatusRequest, current_user: dict = Depends(get_current_user)
):
    valid = {"unpaid", "paid", "overdue", "na"}
    if req.paymentStatus not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid payment status. Must be: {', '.join(valid)}")
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")
    return await convex_client.mutation("documents:update", {"id": doc_id, "paymentStatus": req.paymentStatus})


class OtpRequestModel(BaseModel):
    email: str


class StatusUpdateRequest(BaseModel):
    status: str  # draft | sent | viewed | accepted | rejected


@router.patch("/{doc_id}/status")
async def update_document_status(
    doc_id: str, req: StatusUpdateRequest, current_user: dict = Depends(get_current_user)
):
    valid = {"draft", "sent", "viewed", "accepted", "rejected"}
    if req.status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid)}")
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")
    updated = await convex_client.mutation("documents:update", {"id": doc_id, "status": req.status})
    return updated


class ShareRequest(BaseModel):
    recipientEmail: Optional[str] = None
    expiresInDays: Optional[int] = None


@router.post("/{doc_id}/share")
async def create_share_link(
    doc_id: str, req: ShareRequest = ShareRequest(), background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(get_current_user)
):
    doc = await convex_client.query("documents:getById", {"id": doc_id})
    if not doc or doc["companyId"] != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Document not found")

    token = doc.get("shareToken") or secrets.token_urlsafe(20)
    update_args: dict = {"id": doc_id, "shareToken": token, "status": "sent"}

    if req.expiresInDays:
        expires_at = int((datetime.utcnow() + timedelta(days=req.expiresInDays)).timestamp() * 1000)
        update_args["shareExpiresAt"] = expires_at

    await convex_client.mutation("documents:update", update_args)
    await _log_activity(current_user, doc, "shared")

    share_url = f"{FRONTEND_URL}/shared/{token}"

    if req.recipientEmail and background_tasks:
        company = await convex_client.query("companies:getById", {"id": current_user["companyId"]})
        background_tasks.add_task(
            send_document_shared_email,
            req.recipientEmail,
            doc.get("title", "Untitled"),
            current_user.get("name", "Someone"),
            (company or {}).get("name", ""),
            share_url,
        )

    return {"shareToken": token, "shareUrl": share_url}


@router.post("/shared/{token}/request-otp")
async def request_sign_otp(token: str, req: OtpRequestModel, background_tasks: BackgroundTasks):
    doc = await convex_client.query("documents:getByShareToken", {"shareToken": token})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or share link expired")
    if not (doc.get("data") or {}).get("eSignRequest"):
        raise HTTPException(status_code=400, detail="E-signature was not requested for this document")
    if doc.get("eSignature"):
        raise HTTPException(status_code=400, detail="Document has already been signed")

    import random
    otp = f"{random.randint(100000, 999999)}"
    expires_at = int((datetime.utcnow() + timedelta(minutes=15)).timestamp() * 1000)

    await convex_client.mutation("signOtps:create", {
        "shareToken": token,
        "email": req.email,
        "otp": otp,
        "expiresAt": expires_at,
    })

    background_tasks.add_task(send_otp_email, req.email, otp, doc.get("title", "Untitled"))
    return {"message": "OTP sent to your email. Valid for 15 minutes."}


class ESignRequest(BaseModel):
    signerName: str
    signerContact: str
    signatureImage: str
    otpCode: str
    signerEmail: str


@router.post("/shared/{token}/sign")
async def sign_document(token: str, req: ESignRequest, background_tasks: BackgroundTasks):
    doc = await convex_client.query("documents:getByShareToken", {"shareToken": token})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or share link expired")

    if not (doc.get("data") or {}).get("eSignRequest"):
        raise HTTPException(status_code=400, detail="E-signature was not requested for this document")

    if doc.get("eSignature"):
        raise HTTPException(status_code=400, detail="Document has already been signed")

    # Verify OTP
    otp_record = await convex_client.query("signOtps:getByShareToken", {"shareToken": token})
    if not otp_record:
        raise HTTPException(status_code=400, detail="OTP not found. Please request a new code.")
    now_ms = int(datetime.utcnow().timestamp() * 1000)
    if otp_record["expiresAt"] < now_ms:
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new code.")
    if otp_record["otp"] != req.otpCode:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please check and try again.")
    await convex_client.mutation("signOtps:markUsed", {"id": otp_record["_id"]})

    # Upload signature canvas to Cloudinary instead of storing raw base64
    sig_image = req.signatureImage
    if req.signatureImage.startswith("data:"):
        try:
            result = cloudinary.uploader.upload(
                req.signatureImage,
                folder="docuflow-signatures",
                resource_type="image",
                public_id=f"sig_{doc['_id']}_{int(time.time())}",
            )
            sig_image = result["secure_url"]
        except Exception:
            traceback.print_exc()  # Fall back to base64 if upload fails

    signed_at = int(time.time() * 1000)
    e_signature = {
        "signerName": req.signerName,
        "signerContact": req.signerContact,
        "signerEmail": req.signerEmail,
        "signatureImage": sig_image,
        "signedAt": signed_at,
    }

    updated = await convex_client.mutation("documents:update", {
        "id": doc["_id"],
        "eSignature": e_signature,
    })

    background_tasks.add_task(_sync_pdf_task, doc["companyId"], updated)

    # Notify document owner via email
    try:
        users = await convex_client.query("users:listByCompany", {"companyId": doc["companyId"]})
        admin = next((u for u in (users or []) if u.get("role") == "admin"), None)
        if admin:
            doc_url = f"{FRONTEND_URL}/dashboard/documents/{doc['_id']}"
            background_tasks.add_task(
                send_esign_notification,
                admin["email"], req.signerName, doc.get("title", "Untitled"), doc_url,
            )
    except Exception:
        pass

    return {"success": True, "signedAt": signed_at}
