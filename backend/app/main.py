from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import get_settings
from app.extensions import mongo
from app.routes.health import router as health_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings = get_settings()
    mongo.connect(settings.mongodb_uri)
    try:
        yield
    finally:
        mongo.close()


app = FastAPI(
    title="Kosh API",
    lifespan=lifespan,
)
app.include_router(health_router)
