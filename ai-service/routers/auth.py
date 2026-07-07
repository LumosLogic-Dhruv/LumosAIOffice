import os
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Request, Response
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel

import convex_client
from middleware.auth import get_current_user
from services.email_service import (
    send_verification_email,
    send_password_reset_email,
    send_member_joined_email,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_ACCESS_TOKEN_MINUTES = 60        # 1-hour access token (in memory on frontend)
_REFRESH_TOKEN_DAYS = 30          # 30-day refresh token (httpOnly cookie)
_RESET_TOKEN_TTL_HOURS = 1
_VERIFY_TOKEN_TTL_HOURS = 24

# ── Cookie settings ────────────────────────────────────────────────────────────
_IS_PROD = os.getenv("ENVIRONMENT", "production") == "production"
_COOKIE_SECURE = _IS_PROD          # True in production (HTTPS required)
_COOKIE_SAMESITE = "none" if _IS_PROD else "lax"


def _access_token(user_id: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=_ACCESS_TOKEN_MINUTES)
    return jwt.encode({"id": user_id, "exp": exp, "type": "access"}, JWT_SECRET, algorithm=ALGORITHM)


def _refresh_token_jwt(user_id: str) -> str:
    exp = datetime.utcnow() + timedelta(days=_REFRESH_TOKEN_DAYS)
    return jwt.encode({"id": user_id, "exp": exp, "type": "refresh"}, JWT_SECRET, algorithm=ALGORITHM)


def _set_auth_cookies(response: Response, user_id: str) -> str:
    """Set httpOnly refresh cookie + CSRF cookie. Returns CSRF token for response body."""
    refresh_tok = _refresh_token_jwt(user_id)
    csrf_tok = secrets.token_hex(32)

    response.set_cookie(
        key="refresh_token",
        value=refresh_tok,
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite=_COOKIE_SAMESITE,
        max_age=_REFRESH_TOKEN_DAYS * 24 * 3600,
        path="/api/auth",
    )
    response.set_cookie(
        key="csrf_token",
        value=csrf_tok,
        httponly=False,
        secure=_COOKIE_SECURE,
        samesite=_COOKIE_SAMESITE,
        max_age=_REFRESH_TOKEN_DAYS * 24 * 3600,
    )
    return csrf_tok


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("refresh_token", path="/api/auth")
    response.delete_cookie("csrf_token")


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
async def register(data: RegisterRequest, response: Response):
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

    if data.inviteCode:
        try:
            company_obj = await convex_client.query("companies:getById", {"id": company_id})
            all_users = await convex_client.query("users:listByCompany", {"companyId": company_id})
            admin = next((u for u in (all_users or []) if u.get("role") == "admin"), None)
            if admin and admin.get("email") != data.email:
                await send_member_joined_email(
                    admin["email"], data.name, (company_obj or {}).get("name", "your team")
                )
        except Exception:
            pass

    csrf = _set_auth_cookies(response, user_id)
    return {**_user_response(user), "token": _access_token(user_id), "csrfToken": csrf}


@router.post("/login")
async def login(data: LoginRequest, response: Response):
    user = await convex_client.query("users:getByEmail", {"email": data.email})
    if not user or not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.get("emailVerified", False):
        raise HTTPException(status_code=403, detail="EMAIL_NOT_VERIFIED")

    csrf = _set_auth_cookies(response, user["_id"])
    return {**_user_response(user), "token": _access_token(user["_id"]), "csrfToken": csrf}


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    refresh_tok = request.cookies.get("refresh_token")
    if not refresh_tok:
        raise HTTPException(status_code=401, detail="No refresh token.")

    # CSRF validation for refresh endpoint
    csrf_header = request.headers.get("X-CSRF-Token")
    csrf_cookie = request.cookies.get("csrf_token")
    if not csrf_header or not csrf_cookie or csrf_header != csrf_cookie:
        raise HTTPException(status_code=403, detail="CSRF validation failed.")

    try:
        payload = jwt.decode(refresh_tok, JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type.")
        user_id = payload["id"]
    except Exception:
        _clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")

    user = await convex_client.query("users:getById", {"id": user_id})
    if not user:
        _clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail="User not found.")

    csrf = _set_auth_cookies(response, user_id)
    return {**_user_response(user), "token": _access_token(user_id), "csrfToken": csrf}


@router.post("/logout")
async def logout(response: Response):
    _clear_auth_cookies(response)
    return {"message": "Logged out successfully."}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return _user_response(current_user)


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await convex_client.query("users:getByEmail", {"email": data.email})
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
        raise HTTPException(status_code=400, detail="This verification link has expired. Please request a new one.")

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


@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user), response: Response = None):
    if current_user.get("role") == "admin":
        users = await convex_client.query("users:listByCompany", {"companyId": current_user["companyId"]})
        if len(users or []) > 1:
            raise HTTPException(
                status_code=400,
                detail="You are the company owner. Remove all team members before deleting your account.",
            )
    await convex_client.mutation("admin:deleteUser", {"id": current_user["_id"]})
    if response:
        _clear_auth_cookies(response)
    return {"message": "Account deleted successfully."}
