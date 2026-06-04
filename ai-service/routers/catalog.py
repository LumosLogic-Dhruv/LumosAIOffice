from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel

import convex_client
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/catalog", tags=["catalog"])


class CatalogItem(BaseModel):
    name: str
    description: Optional[str] = None
    unit: Optional[str] = None
    rate: float
    category: Optional[str] = None


class CatalogItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    rate: Optional[float] = None
    category: Optional[str] = None


@router.get("")
async def list_catalog(current_user: dict = Depends(get_current_user)):
    return await convex_client.query("catalog:list", {"companyId": current_user["companyId"]})


@router.post("", status_code=201)
async def create_catalog_item(data: CatalogItem, current_user: dict = Depends(get_current_user)):
    args: dict = {"companyId": current_user["companyId"], "name": data.name, "rate": data.rate}
    for field in ("description", "unit", "category"):
        val = getattr(data, field)
        if val is not None:
            args[field] = val
    return await convex_client.mutation("catalog:create", args)


@router.put("/{item_id}")
async def update_catalog_item(item_id: str, data: CatalogItemUpdate, current_user: dict = Depends(get_current_user)):
    args: dict = {"id": item_id}
    for field in ("name", "description", "unit", "rate", "category"):
        val = getattr(data, field)
        if val is not None:
            args[field] = val
    return await convex_client.mutation("catalog:update", args)


@router.delete("/{item_id}")
async def delete_catalog_item(item_id: str, current_user: dict = Depends(get_current_user)):
    await convex_client.mutation("catalog:remove", {"id": item_id})
    return {"success": True}
