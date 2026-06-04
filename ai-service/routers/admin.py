import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

import convex_client
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

ADMIN_SECRET = os.getenv("ADMIN_SECRET", "docuflow_admin_secret_2026")


async def require_root(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ("root", "admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ── Bootstrap: promote a user to root using the admin secret ──────────────────

class PromoteRequest(BaseModel):
    email: str
    secret: str


@router.post("/promote")
async def promote_to_root(data: PromoteRequest):
    if data.secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Invalid admin secret")
    result = await convex_client.mutation("admin:promoteByEmail", {
        "email": data.email,
        "role": "root",
    })
    if not result:
        raise HTTPException(status_code=404, detail="User not found — register first")
    return {"success": True, "message": f"{data.email} promoted to root"}


# ── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats(current_user: dict = Depends(require_root)):
    return await convex_client.query("admin:getStats", {})


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(current_user: dict = Depends(require_root)):
    return await convex_client.query("admin:listAllUsers", {})


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_root)):
    await convex_client.mutation("admin:deleteUser", {"id": user_id})
    return {"success": True}


@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, data: dict, current_user: dict = Depends(require_root)):
    result = await convex_client.mutation("admin:updateUserRole", {
        "id": user_id,
        "role": data.get("role", "admin"),
    })
    return result


# ── Companies ─────────────────────────────────────────────────────────────────

@router.get("/companies")
async def list_companies(current_user: dict = Depends(require_root)):
    return await convex_client.query("admin:listAllCompanies", {})


# ── Documents ─────────────────────────────────────────────────────────────────

@router.get("/documents")
async def list_documents(current_user: dict = Depends(require_root)):
    return await convex_client.query("admin:listAllDocuments", {})


@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(require_root)):
    await convex_client.mutation("admin:deleteDocument", {"id": doc_id})
    return {"success": True}
