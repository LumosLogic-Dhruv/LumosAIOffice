import os

from fastapi import Request
from jose import jwt
from slowapi import Limiter
from slowapi.util import get_remote_address

_JWT_SECRET = os.getenv("JWT_SECRET", "")
_ALGORITHM = "HS256"


def _get_user_key(request: Request) -> str:
    """Rate limit by authenticated user ID; fall back to IP for unauthenticated."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        try:
            payload = jwt.decode(auth[7:], _JWT_SECRET, algorithms=[_ALGORITHM])
            user_id = payload.get("id")
            if user_id:
                return f"user:{user_id}"
        except Exception:
            pass
    return get_remote_address(request)


limiter = Limiter(key_func=_get_user_key)
