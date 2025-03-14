from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from pydantic import ValidationError

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handles HTTP exceptions (like 404, 422, 500) and returns a JSON response."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handles database-related errors."""
    return JSONResponse(
        status_code=500,
        content={"detail": f"Database error: {str(exc)}"}
    )

async def integrity_exception_handler(request: Request, exc: IntegrityError):
    """Handles Integrity errors like duplicate entries or constraint violations."""
    return JSONResponse(
        status_code=400,
        content={"detail": f"Integrity error: {str(exc.orig)}"}
    )

async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handles request validation errors (e.g., missing required fields)."""
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

async def generic_exception_handler(request: Request, exc: Exception):
    """Handles unexpected server errors."""
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

def setup_error_handlers(app):
    """Registers error handlers in FastAPI app."""
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(SQLAlchemyError, database_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_exception_handler)
    app.add_exception_handler(ValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
