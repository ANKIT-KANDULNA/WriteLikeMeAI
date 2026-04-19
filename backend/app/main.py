from __future__ import annotations
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.generate import router as generate_router

def _load_env_file():
    """
    Minimal .env loader (no external deps).
    Loads `backend/.env` if present, without overriding existing env vars.
    """
    backend_root = Path(__file__).resolve().parents[1]
    env_path = backend_root / ".env"
    if not env_path.exists():
        return
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v


_load_env_file()

app = FastAPI(title="HandFonted API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://handfonted.xyz",
        "http://handfonted.xyz",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router,   prefix="/api")
app.include_router(generate_router, prefix="/api")