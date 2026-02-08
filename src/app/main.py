import logging
import sys
import time
import traceback
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlmodel import Session, text
from .database import engine, create_db_and_tables
from .config import settings


# Health check response schemas
class HealthyResponse(BaseModel):
    """Schema for successful health check response."""
    status: str
    database: str
    version: str


class UnhealthyResponse(BaseModel):
    """Schema for unhealthy response with error details."""
    status: str
    database: str
    error: str

# Configure logging based on environment
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("todo_api")

# Create database tables
create_db_and_tables()

app = FastAPI(title="Todo API", version="1.0.0")

# CORS middleware configuration using centralized settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """
    Middleware to add security headers to all responses.
    Implements OWASP security header recommendations.
    """
    response = await call_next(request)

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    response.headers["Pragma"] = "no-cache"

    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware to log all incoming requests and their responses.
    Logs request method, path, response status code, and duration.
    """
    start_time = time.time()

    # Log incoming request
    logger.info(f"Request started: {request.method} {request.url.path}")

    try:
        response = await call_next(request)

        # Calculate request duration
        duration_ms = (time.time() - start_time) * 1000

        # Log successful response
        logger.info(
            f"Request completed: {request.method} {request.url.path} - "
            f"Status: {response.status_code} - Duration: {duration_ms:.2f}ms"
        )

        return response

    except Exception as exc:
        # Calculate duration even for errors
        duration_ms = (time.time() - start_time) * 1000

        # Log error with stack trace
        logger.error(
            f"Request failed: {request.method} {request.url.path} - "
            f"Duration: {duration_ms:.2f}ms - Error: {str(exc)}"
        )
        logger.error(f"Stack trace:\n{traceback.format_exc()}")

        # Re-raise to let FastAPI handle the error response
        raise


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler to log unhandled exceptions with stack traces.
    Returns a standardized error response.
    """
    logger.error(
        f"Unhandled exception for {request.method} {request.url.path}: {str(exc)}"
    )
    logger.error(f"Stack trace:\n{traceback.format_exc()}")

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc) if app.debug else "An unexpected error occurred"
        }
    )


@app.on_event("startup")
async def startup_event():
    """Log application startup."""
    logger.info("Todo API application starting up")


@app.on_event("shutdown")
async def shutdown_event():
    """Log application shutdown."""
    logger.info("Todo API application shutting down")


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get(
    "/health",
    response_model=HealthyResponse,
    responses={
        200: {
            "description": "Service is healthy",
            "model": HealthyResponse
        },
        503: {
            "description": "Service is unhealthy",
            "model": UnhealthyResponse
        }
    },
    tags=["Health"],
    summary="Health check endpoint",
    description="Checks the health status of the service including database connectivity."
)
def health_check():
    """
    Health check endpoint for monitoring.

    Returns HTTP 200 if the service is healthy and database is connected.
    Returns HTTP 503 if the database connection fails.
    """
    logger.debug("Health check requested")

    # Get version from app metadata
    app_version = app.version

    # Check database connectivity
    try:
        with Session(engine) as session:
            # Execute a simple query to verify database connection
            session.exec(text("SELECT 1"))
            logger.info("Health check: Database connection successful")

            return HealthyResponse(
                status="healthy",
                database="connected",
                version=app_version
            )
    except Exception as db_error:
        logger.error(f"Health check: Database connection failed - {str(db_error)}")

        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=UnhealthyResponse(
                status="unhealthy",
                database="disconnected",
                error="Connection failed"
            ).model_dump()
        )


# Import and include routers
from .routes import auth, todos
app.include_router(auth.router, prefix="/api/auth")
app.include_router(todos.router, prefix="/api/todos")
