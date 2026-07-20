from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.recommendations import router as recommendations_router

app = FastAPI(
    title="FarmNomad AI Service",
    version="0.1.0",
    description="Synchronous AI service scaffold for future crop scanning and matching.",
)

app.include_router(health_router)
app.include_router(recommendations_router, prefix="/recommendations", tags=["recommendations"])
