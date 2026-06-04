from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

import convex_client
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/clients", tags=["clients"])


class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    gstin: Optional[str] = None
    notes: Optional[str] = None


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    gstin: Optional[str] = None
    notes: Optional[str] = None


@router.get("")
async def list_clients(current_user: dict = Depends(get_current_user)):
    return await convex_client.query("clients:list", {"companyId": current_user["companyId"]})


@router.post("", status_code=201)
async def create_client(data: ClientCreate, current_user: dict = Depends(get_current_user)):
    args = {"companyId": current_user["companyId"], "name": data.name}
    for field in ("email", "phone", "address", "gstin", "notes"):
        val = getattr(data, field)
        if val is not None:
            args[field] = val
    return await convex_client.mutation("clients:create", args)


@router.put("/{client_id}")
async def update_client(client_id: str, data: ClientUpdate, current_user: dict = Depends(get_current_user)):
    args: dict = {"id": client_id}
    for field in ("name", "email", "phone", "address", "gstin", "notes"):
        val = getattr(data, field)
        if val is not None:
            args[field] = val
    return await convex_client.mutation("clients:update", args)


@router.delete("/{client_id}")
async def delete_client(client_id: str, current_user: dict = Depends(get_current_user)):
    await convex_client.mutation("clients:remove", {"id": client_id})
    return {"success": True}
