import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.extensions import mongo

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health")
def health_server():
    return {"status": "ok", "message": "hi from server"}


@router.get("/health/db")
def health_database():
    try:
        mongo.ping()
    except Exception:
        logger.exception("MongoDB health check failed")
        return JSONResponse(
            status_code=503,
            content={"status": "error", "message": "database unavailable"},
        )
    return {"status": "ok", "message": "hi from database"}
