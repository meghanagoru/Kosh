"""GET/PUT Koshya persistent state per anonymous client UUID."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorCollection

from koshya_state_models import KoshyaStorePayload


def _collection(request: Request) -> AsyncIOMotorCollection:
    col = getattr(request.app.state, "koshya_collection", None)
    if col is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    return col


def parse_client_id(
    x_koshya_client_id: str | None = Header(None, alias="X-Koshya-Client-Id"),
) -> str:
    if not x_koshya_client_id or not x_koshya_client_id.strip():
        raise HTTPException(status_code=400, detail="Missing X-Koshya-Client-Id header")
    try:
        UUID(x_koshya_client_id.strip())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid X-Koshya-Client-Id (must be a UUID)")
    return x_koshya_client_id.strip()


router = APIRouter(prefix="/koshya", tags=["koshya-state"])


@router.get("/state")
async def get_koshya_state(
    request: Request,
    client_id: str = Depends(parse_client_id),
):
    col = _collection(request)
    doc = await col.find_one({"client_id": client_id})
    if not doc:
        raise HTTPException(status_code=404, detail="not_found")
    payload = {
        "audit": doc["audit"],
        "inflationResult": doc.get("inflationResult"),
        "shadowTax": doc.get("shadowTax"),
        "insights": doc.get("insights") or [],
        "hasSubmittedAudit": doc.get("hasSubmittedAudit", False),
    }
    return payload


@router.put("/state")
async def put_koshya_state(
    request: Request,
    body: KoshyaStorePayload,
    client_id: str = Depends(parse_client_id),
):
    col = _collection(request)
    document = {
        "client_id": client_id,
        **body.model_dump(mode="json"),
        "updated_at": datetime.now(timezone.utc),
    }
    await col.replace_one(
        {"client_id": client_id},
        document,
        upsert=True,
    )
    return {"ok": True}
