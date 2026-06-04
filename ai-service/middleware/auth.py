import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import convex_client

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    exc = HTTPException(status_code=401, detail="Please authenticate.")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("id")
        if not user_id:
            raise exc
    except JWTError:
        raise exc

    user = await convex_client.query("users:getById", {"id": user_id})
    if not user:
        raise exc

    return user
