import logging
import sys

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.database.database import Base, engine
from app.database.migration import migrate
from app.limiter import limiter
from app.routers import auth, categories, dashboard, expenses, income, transactions

# ── Clerk check (non-fatal warning) ──────────────────────────────────────
if not settings.CLERK_SECRET_KEY:
    print("⚠️  CLERK_SECRET_KEY is not set — Clerk authentication is disabled.")
    print("   Legacy JWT (session cookie) auth will still work.")
    print("   Set CLERK_SECRET_KEY in your .env to enable Clerk sign-in.")

# ── SECRET_KEY safeguard ─────────────────────────────────────────────────
_DEFAULT_SECRET = "dev-secret-key-change-in-production"
if settings.ENVIRONMENT == "production" and settings.SECRET_KEY == _DEFAULT_SECRET:
    print("FATAL: SECRET_KEY is still set to the default placeholder value.", file=sys.stderr)
    print("       Generate a strong random key and set it in your .env or environment.", file=sys.stderr)
    print("       Example:  python3 -c \"import secrets; print(secrets.token_urlsafe(64))\"", file=sys.stderr)
    sys.exit(1)

# ── Rate limiter ─────────────────────────────────────────────────────────
app = FastAPI(title=settings.PROJECT_NAME)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Global 500 error handler (no stack traces leaked) ────────────────────
logger = logging.getLogger("expense-tracker")
logging.basicConfig(level=settings.LOG_LEVEL)


@app.exception_handler(Exception)
async def global_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled server error")  # Logs full traceback server-side
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ── Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.ENVIRONMENT != "development" else [],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$" if settings.ENVIRONMENT == "development" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SlowAPIMiddleware)

# Create any new tables (users, etc.) then run data migration
Base.metadata.create_all(bind=engine)
migrate()

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(dashboard.router)
app.include_router(expenses.router)
app.include_router(income.router)
app.include_router(transactions.router)

# ── Health check (registered before SPA catch-all) ─────────────────
@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}

# ── Mount built frontend (served at /) ──────────────────────────────
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.is_dir():
    from fastapi.responses import FileResponse

    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    favicon = FRONTEND_DIST / "favicon.svg"
    if favicon.exists():
        @app.get("/favicon.svg", include_in_schema=False)
        async def serve_favicon():
            return FileResponse(str(favicon))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve index.html for all non-API routes (SPA catch-all)."""
        return FileResponse(str(FRONTEND_DIST / "index.html"))
else:
    @app.get("/")
    def root() -> dict[str, str]:
        return {"message": "Simple Expense Tracker API"}
