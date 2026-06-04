import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel

import convex_client
from middleware.auth import get_current_user
from fastapi import Depends

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
    }


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    companyName: str = ""
    inviteCode: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register", status_code=201)
async def register(data: RegisterRequest):
    existing = await convex_client.query("users:getByEmail", {"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    if data.inviteCode:
        # Employee joining an existing company via invite link
        company = await convex_client.query("companies:getByInviteCode", {"inviteCode": data.inviteCode})
        if not company:
            raise HTTPException(status_code=400, detail="Invalid or expired invite code")
        company_id = company["_id"]
        role = "member"
    else:
        if not data.companyName:
            raise HTTPException(status_code=400, detail="Company name is required")
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
    })

    user = await convex_client.query("users:getById", {"id": user_id})
    return {**_user_response(user), "token": _token(user_id)}


@router.post("/login")
async def login(data: LoginRequest):
    user = await convex_client.query("users:getByEmail", {"email": data.email})
    if not user or not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {**_user_response(user), "token": _token(user["_id"])}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return _user_response(current_user)
