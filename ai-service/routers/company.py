import io
import secrets
from typing import Any, Dict

import cloudinary.uploader
from fastapi import APIRouter, Body, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

import convex_client
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/company", tags=["company"])


@router.get("")
async def get_company_profile(current_user: dict = Depends(get_current_user)):
    return await convex_client.query("companies:getById", {"id": current_user["companyId"]})


@router.put("/update")
async def update_company_profile(
    update_data: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_user),
):
    for field in ("_id", "_creationTime", "createdAt"):
        update_data.pop(field, None)

    return await convex_client.mutation("companies:update", {
        "id": current_user["companyId"],
        **update_data,
    })


@router.put("/logo")
async def update_logo(
    logo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    company = await convex_client.query("companies:getById", {"id": current_user["companyId"]})
    if company and company.get("cloudinaryLogoPublicId"):
        cloudinary.uploader.destroy(company["cloudinaryLogoPublicId"])

    file_bytes = await logo.read()
    result = cloudinary.uploader.upload(
        io.BytesIO(file_bytes),
        folder="docuflow-logos",
        resource_type="image",
    )

    return await convex_client.mutation("companies:update", {
        "id": current_user["companyId"],
        "logoUrl": result["secure_url"],
        "cloudinaryLogoPublicId": result["public_id"],
    })


class CustomFieldRequest(BaseModel):
    fieldName: str
    fieldType: str


@router.post("/custom-fields")
async def add_custom_field(
    field: CustomFieldRequest,
    current_user: dict = Depends(get_current_user),
):
    return await convex_client.mutation("companies:addCustomField", {
        "id": current_user["companyId"],
        "field": {"fieldName": field.fieldName, "fieldType": field.fieldType},
    })


@router.delete("/custom-fields/{field_id}")
async def remove_custom_field(
    field_id: str,
    current_user: dict = Depends(get_current_user),
):
    return await convex_client.mutation("companies:removeCustomField", {
        "id": current_user["companyId"],
        "fieldId": field_id,
    })


@router.get("/members")
async def list_members(current_user: dict = Depends(get_current_user)):
    users = await convex_client.query("users:listByCompany", {"companyId": current_user["companyId"]})
    return [
        {
            "_id": u["_id"],
            "name": u.get("name", ""),
            "email": u.get("email", ""),
            "role": u.get("role", "member"),
            "_creationTime": u.get("_creationTime", 0),
        }
        for u in (users or [])
    ]


@router.post("/invite")
async def generate_invite(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only the company owner can generate invite links")
    invite_code = secrets.token_urlsafe(16)
    await convex_client.mutation("companies:update", {
        "id": current_user["companyId"],
        "inviteCode": invite_code,
    })
    return {"inviteCode": invite_code}


@router.delete("/members/{user_id}")
async def remove_member(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only the company owner can remove members")
    target = await convex_client.query("users:getById", {"id": user_id})
    if not target or target.get("companyId") != current_user["companyId"]:
        raise HTTPException(status_code=404, detail="Member not found")
    if target.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot remove the company owner")
    await convex_client.mutation("users:deleteById", {"id": user_id})
    return {"success": True}
