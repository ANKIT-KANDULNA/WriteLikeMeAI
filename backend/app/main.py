from __future__ import annotations
import os
import traceback
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes.health import router as health_router
from app.api.routes.generate import router as generate_router


def _load_env_file():
    """
    Load .env only in local development.
    On Render, environment variables are set from dashboard.
    """
    # If running on Render, skip .env loading
    if os.getenv("RENDER") or os.getenv("RAILWAY_ENVIRONMENT"):
        print("Running on cloud → skipping .env file")
        return

    backend_root = Path(__file__).resolve().parents[1]
    env_path = backend_root / ".env"

    if not env_path.exists():
        print(".env file not found (ok for production)")
        return

    print("Loading .env file...")
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v


# Load env
_load_env_file()


# Create app
app = FastAPI(title="HandFonted API", version="2.0.0")


# ✅ GLOBAL ERROR HANDLER (VERY IMPORTANT)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("\n❌ ERROR OCCURRED:")
    print("Path:", request.url)
    print("Error:", str(exc))
    traceback.print_exc()

    return JSONResponse(
        status_code=500,
        content={"error": str(exc)},
    )


# ✅ CORS FIX (allow all for now)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔥 important for Vercel + local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ DEBUG: print env (temporary)
print("GEMINI_API_KEY:", os.getenv("GEMINI_API_KEY"))
print("GROK_API_KEY:", os.getenv("GROK_API_KEY"))


# Routes
app.include_router(health_router, prefix="/api")
app.include_router(generate_router, prefix="/api")