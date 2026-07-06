import os
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel

import convex_client
from middleware.auth import get_current_user
from services.email_service import send_verification_email, send_password_reset_email, send_member_joined_email

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_RESET_TOKEN_TTL_HOURS = 1
_VERIFY_TOKEN_TTL_HOURS = 24


def _token(user_id: str) -> str:
    exp = datetime.utcnow() + timedelta(days=30)
    return jwt.encode({"id": user_id, "exp": exp}, JWT_SECRET, algorithm=ALGORITHM)


def _user_response(user: dict) -> dict:
    return {
        "_id": user["_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "companyId": user["companyId"],
        "emailVerified": user.get("emailVerified", False),
    }


# ── Request models ─────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    companyName: str = ""
    inviteCode: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


class ResendVerificationRequest(BaseModel):
    email: str


# ── Helpers ────────────────────────────────────────────────────────────────────

def _validate_password_strength(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
    if not any(c.isdigit() or not c.isalpha() for c in password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one number or special character.",
        )


async def _create_and_send_verification(user_id: str, email: str, name: str) -> None:
    token = secrets.token_urlsafe(32)
    expires_at = int((datetime.utcnow() + timedelta(hours=_VERIFY_TOKEN_TTL_HOURS)).timestamp() * 1000)
    await convex_client.mutation("emailVerificationTokens:create", {
        "userId": user_id,
        "email": email,
        "token": token,
        "expiresAt": expires_at,
    })
    await send_verification_email(email, name, token)


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/register", status_code=201)
async def register(data: RegisterRequest):
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")

    existing = await convex_client.query("users:getByEmail", {"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    if data.inviteCode:
        company = await convex_client.query("companies:getByInviteCode", {"inviteCode": data.inviteCode})
        if not company:
            raise HTTPException(status_code=400, detail="Invalid or expired invite code.")
        company_id = company["_id"]
        role = "member"
    else:
        if not data.companyName:
            raise HTTPException(status_code=400, detail="Company name is required.")
        company_id = await convex_client.mutation("companies:create", {
            "name": data.companyName,
            "email": data.email,
            "customFields": [],
        })
        role = "admin"

    user_id = await convex_client.mutation("users:create", {
        "name": data.name,
        "email": data.email,
        "password": pwd_context.hash(data.password),
        "role": role,
        "companyId": company_id,
        "emailVerified": False,
    })

    user = await convex_client.query("users:getById", {"id": user_id})

    try:
        await _create_and_send_verification(user_id, data.email, data.name)
    except Exception:
        pass

    # Notify company admin when someone joins via invite
    if data.inviteCode:
        try:
            company = await convex_client.query("companies:getById", {"id": company_id})
            all_users = await convex_client.query("users:listByCompany", {"companyId": company_id})
            admin = next((u for u in (all_users or []) if u.get("role") == "admin"), None)
            if admin and admin.get("email") != data.email:
                await send_member_joined_email(
                    admin["email"], data.name, (company or {}).get("name", "your team")
                )
        except Exception:
            pass

    return {**_user_response(user), "token": _token(user_id)}


@router.post("/login")
async def login(data: LoginRequest):
    user = await convex_client.query("users:getByEmail", {"email": data.email})
    if not user or not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.get("emailVerified", False):
        raise HTTPException(
            status_code=403,
            detail="EMAIL_NOT_VERIFIED",
        )

    return {**_user_response(user), "token": _token(user["_id"])}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return _user_response(current_user)


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await convex_client.query("users:getByEmail", {"email": data.email})
    # Always return success to avoid email enumeration
    if not user:
        return {"message": "If an account with that email exists, a reset link has been sent."}

    token = secrets.token_urlsafe(32)
    expires_at = int(
        (datetime.utcnow() + timedelta(hours=_RESET_TOKEN_TTL_HOURS)).timestamp() * 1000
    )
    await convex_client.mutation("passwordResetTokens:create", {
        "email": data.email,
        "token": token,
        "expiresAt": expires_at,
    })

    try:
        await send_password_reset_email(data.email, token)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to send reset email. Please try again.")

    return {"message": "If an account with that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    _validate_password_strength(data.newPassword)

    record = await convex_client.query("passwordResetTokens:getByToken", {"token": data.token})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")
    if record.get("used"):
        raise HTTPException(status_code=400, detail="This reset link has already been used.")

    now_ms = int(datetime.utcnow().timestamp() * 1000)
    if record["expiresAt"] < now_ms:
        raise HTTPException(status_code=400, detail="This reset link has expired. Please request a new one.")

    user = await convex_client.query("users:getByEmail", {"email": record["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")

    await convex_client.mutation("users:updatePassword", {
        "id": user["_id"],
        "password": pwd_context.hash(data.newPassword),
    })
    await convex_client.mutation("passwordResetTokens:markUsed", {"id": record["_id"]})

    return {"message": "Password has been reset successfully. You can now sign in."}


@router.get("/verify-email")
async def verify_email(token: str):
    record = await convex_client.query("emailVerificationTokens:getByToken", {"token": token})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link.")

    now_ms = int(datetime.utcnow().timestamp() * 1000)
    if record["expiresAt"] < now_ms:
        raise HTTPException(
            status_code=400,
            detail="This verification link has expired. Please request a new one.",
        )

    await convex_client.mutation("users:updateEmailVerified", {
        "id": record["userId"],
        "emailVerified": True,
    })
    await convex_client.mutation("emailVerificationTokens:deleteById", {"id": record["_id"]})

    return {"message": "Email verified successfully. You can now sign in."}


@router.post("/resend-verification")
async def resend_verification(data: ResendVerificationRequest):
    user = await convex_client.query("users:getByEmail", {"email": data.email})
    if not user:
        return {"message": "If an account with that email exists, a verification link has been sent."}

    if user.get("emailVerified"):
        raise HTTPException(status_code=400, detail="This email is already verified.")

    try:
        await _create_and_send_verification(user["_id"], data.email, user["name"])
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to send verification email. Please try again.")

    return {"message": "Verification email sent. Please check your inbox."}


@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Delete authenticated user's account. Admin with other members must remove them first."""
    if current_user.get("role") == "admin":
        users = await convex_client.query("users:listByCompany", {"companyId": current_user["companyId"]})
        if len(users or []) > 1:
            raise HTTPException(
                status_code=400,
                detail="You are the company owner. Remove all team members before deleting your account.",
            )
    await convex_client.mutation("admin:deleteUser", {"id": current_user["_id"]})
    return {"message": "Account deleted successfully."}


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    _validate_password_strength(data.newPassword)

    if not pwd_context.verify(data.currentPassword, current_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    if data.currentPassword == data.newPassword:
        raise HTTPException(status_code=400, detail="New password must be different from the current password.")

    await convex_client.mutation("users:updatePassword", {
        "id": current_user["_id"],
        "password": pwd_context.hash(data.newPassword),
    })

    return {"message": "Password changed successfully."}
