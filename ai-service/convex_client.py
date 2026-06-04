import os
import httpx
from dotenv import load_dotenv

load_dotenv()

CONVEX_URL = os.getenv("CONVEX_URL", "https://stoic-weasel-322.eu-west-1.convex.cloud")
_TIMEOUT = 30.0


async def _call(endpoint: str, path: str, args: dict):
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            f"{CONVEX_URL}/api/{endpoint}",
            json={"path": path, "args": args, "format": "json"},
            headers={"Content-Type": "application/json"},
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") == "error":
            raise RuntimeError(f"Convex error [{path}]: {data.get('errorMessage', 'unknown')}")
        return data.get("value")


async def query(path: str, args: dict = {}):
    return await _call("query", path, args)


async def mutation(path: str, args: dict = {}):
    return await _call("mutation", path, args)
