from pathlib import Path

REPO_ROOT    = Path(__file__).resolve().parents[3]
BACKEND_ROOT = REPO_ROOT / "backend"
ARTIFACTS    = BACKEND_ROOT / "artifacts"
RESOURCES    = BACKEND_ROOT / "resources"   # HandFonted models go here
FONTS_DIR    = REPO_ROOT / "frontend" / "public" / "fonts"

ARTIFACTS.mkdir(parents=True, exist_ok=True)