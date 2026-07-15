import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config import settings
from database import engine, Base
from routers import auth, resume

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("neurocv")

# Create Database tables (simple startup setup, normally managed via alembic)
try:
    Base.metadata.create_all(bind=engine)
    logger.info("PostgreSQL Database tables verified/created successfully.")
except Exception as e:
    logger.error(f"Database table verification failed: {e}")

app = FastAPI(
    title="NeuroCV AI - Career Intelligence Engine",
    description="Enterprise AI-powered software engineering resume parsing, semantic matching, and interview readiness platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock this down to authorized origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized Exception Handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal System Exception",
            "detail": str(exc)
        }
    )

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/resume", tags=["Resume Intelligence"])

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "NeuroCV AI - FastAPI Engine",
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
