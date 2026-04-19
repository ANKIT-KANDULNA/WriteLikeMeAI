from __future__ import annotations
import os, uuid, base64, tempfile
from pathlib import Path
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"

router = APIRouter()

# ── lazy-load heavy models once ──────────────────────────────────────────────
_clf_model = None
_det_model = None

def _load_models():
    global _clf_model, _det_model
    if _clf_model is not None:
        return

    try:
        import torch
    except ModuleNotFoundError as e:
        raise HTTPException(
            500,
            detail="Missing dependency 'torch' on backend. Install backend requirements and restart the API.",
        ) from e

    try:
        from paddleocr import TextDetection
    except ModuleNotFoundError as e:
        raise HTTPException(
            500,
            detail="Missing dependency 'paddleocr' on backend. Install backend requirements (including paddleocr) and restart the API.",
        ) from e
    from app.core.config import RESOURCES
    from character_classification import ResInceptionNet

    _clf_model = ResInceptionNet(num_classes=52)
    _clf_model.load_state_dict(
        torch.load(RESOURCES / "best_ResInceptionNet_model0.8811.pth", map_location="cpu")
    )

    _det_model = TextDetection(
        model_name="PP-OCRv5_mobile_det",
        model_dir=str(RESOURCES / "PP-OCRv5_mobile_det_infer"),
        enable_mkldnn=False,
    )

# ── in-memory session store: session_id → {label: crop_path} ─────────────────
_sessions: dict[str, dict[str, str]] = {}

# ── Request/Response models ───────────────────────────────────────────────────
class CharacterItem(BaseModel):
    id: str
    label: str

class BuildFontRequest(BaseModel):
    session_id: str
    characters: List[CharacterItem]
    font_name: str = "My Handwriting"
    thickness: int = 100


class GenerateTextRequest(BaseModel):
    prompt: str
    model: str = "groq"  # "groq" | "gemini" | "deepseek"
    word_count: int = 150

# ─────────────────────────────────────────────────────────────────────────────

@router.post("/segment")
async def segment_image(
    file: UploadFile = File(...),
):
    """
    Step 1: Upload handwriting image.
    Returns all detected character crops as base64 images with ML-guessed labels.
    """
    _load_models()

    from character_classification import classify_characters
    from character_segmentation import segment_characters
    from app.core.config import ARTIFACTS
    import cv2

    suffix = Path(file.filename).suffix or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        img_path = tmp.name

    try:
        chars = segment_characters(img_path, det_model=_det_model)
        if not chars:
            raise HTTPException(400, detail="No characters detected. Use a clear image with separated letters on a plain background.")

        labeled = classify_characters(chars, model=_clf_model)
        if not labeled:
            raise HTTPException(400, detail="Character classification failed.")
    finally:
        os.unlink(img_path)

    session_id = str(uuid.uuid4())
    session_dir = ARTIFACTS / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)

    result = []
    crop_map: dict[str, str] = {}

    for label, crop_img in labeled:
        crop_id = str(uuid.uuid4()).replace("-", "")
        crop_path = str(session_dir / f"{crop_id}.png")
        import cv2 as _cv2
        _cv2.imwrite(crop_path, crop_img)

        _, buf = cv2.imencode(".png", crop_img)
        b64 = base64.b64encode(buf.tobytes()).decode("utf-8")

        result.append({
            "id": crop_id,
            "label": label,
            "image_b64": f"data:image/png;base64,{b64}",
        })
        crop_map[crop_id] = crop_path

    _sessions[session_id] = crop_map

    return {
        "session_id": session_id,
        "total": len(result),
        "characters": result,
    }


@router.post("/build-font")
async def build_font(req: BuildFontRequest):
    """
    Step 2: Build font from verified character list.
    Returns JSON with both ttf_b64 (for download) and woff2_b64 (for browser preview).
    """
    if req.session_id not in _sessions:
        raise HTTPException(404, detail="Session not found or expired. Please re-upload your image.")

    crop_map = _sessions[req.session_id]

    if not req.characters:
        raise HTTPException(400, detail="No characters provided.")

    import cv2
    from font_creation import update_font_from_images
    from app.core.config import RESOURCES

    labeled = []
    for item in req.characters:
        crop_path = crop_map.get(item.id)
        if not crop_path or not Path(crop_path).exists():
            continue
        img = cv2.imread(crop_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue
        labeled.append((item.label, img))

    if not labeled:
        raise HTTPException(400, detail="No valid character images found in session.")

    out_ttf = Path(tempfile.gettempdir()) / f"{uuid.uuid4()}.ttf"
    out_woff = out_ttf.with_suffix(".woff2")

    try:
        update_font_from_images(
            font_path=str(RESOURCES / "arial.ttf"),
            char_image_list=labeled,
            output_path=str(out_ttf),
            desired_thickness=req.thickness,
            new_family_name=req.font_name,
        )

        # Read TTF bytes
        ttf_bytes = out_ttf.read_bytes()
        ttf_b64 = base64.b64encode(ttf_bytes).decode("utf-8")

        # Convert to WOFF2 for browser preview
        from fontTools.ttLib import TTFont
        font = TTFont(out_ttf)
        font.flavor = "woff2"
        font.save(str(out_woff))
        font.close()

        woff2_bytes = out_woff.read_bytes()
        woff2_b64 = base64.b64encode(woff2_bytes).decode("utf-8")

    finally:
        if out_ttf.exists():
            os.unlink(out_ttf)
        if out_woff.exists():
            os.unlink(out_woff)

    # Clean up session files
    for path in crop_map.values():
        try:
            os.unlink(path)
        except Exception:
            pass
    del _sessions[req.session_id]

    safe_name = req.font_name.replace(" ", "_")

    # Persist the generated font into the Next.js public folder so `/create/preview`
    # can always load the exact font that was just built (even after refresh).
    from app.core.config import REPO_ROOT
    public_dir = REPO_ROOT / "frontend" / "public" / "generated-fonts"
    public_dir.mkdir(parents=True, exist_ok=True)

    font_id = str(uuid.uuid4())
    ttf_public_path = public_dir / f"{font_id}.ttf"
    woff2_public_path = public_dir / f"{font_id}.woff2"

    try:
        ttf_public_path.write_bytes(ttf_bytes)
        woff2_public_path.write_bytes(woff2_bytes)
    except Exception:
        # If persisting fails (permissions, etc), still return base64 blobs.
        ttf_public_path = None
        woff2_public_path = None

    result_data = {
        "font_name": req.font_name,
        "safe_name": safe_name,
        "ttf_b64": ttf_b64,       # used for .ttf download
        "woff2_b64": woff2_b64,   # used for browser FontFace preview
        "font_id": font_id,
        "ttf_url": f"/generated-fonts/{font_id}.ttf" if ttf_public_path else None,
        "woff2_url": f"/generated-fonts/{font_id}.woff2" if woff2_public_path else None,
    }

    try:
        import json
        json_public_path = public_dir / f"{font_id}.json"
        json_public_path.write_text(json.dumps(result_data), encoding="utf-8")
    except Exception:
        pass

    return result_data


@router.post("/generate-text")
async def generate_text(req: GenerateTextRequest):
    """
    Generate plain text from a user prompt using an LLM provider.
    The frontend uses this to fill the preview canvas with realistic text.
    """
    prompt = (req.prompt or "").strip()
    if not prompt:
        raise HTTPException(400, detail="Prompt is required.")

    word_count = max(20, min(int(req.word_count or 150), 600))

    system_msg = (
        "You are a helpful writing assistant. "
        f"Write approximately {word_count} words. "
        "Return only the text, no markdown, no bullet points, no title."
    )

    provider = (req.model or "groq").strip().lower()

    try:
        import httpx
    except Exception as e:
        raise HTTPException(500, detail=f"httpx is required for text generation: {e}")

    timeout = httpx.Timeout(60.0, connect=15.0)

    if provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise HTTPException(500, detail="GROQ_API_KEY is not set on the backend.")
        url = "https://api.groq.com/openai/v1/chat/completions"
        payload = {
            "model": os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
            "messages": [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.8,
        }
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.post(url, json=payload, headers=headers)
            if r.status_code >= 400:
                raise HTTPException(r.status_code, detail=r.text)
            data = r.json()
            text = (
                data.get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
            )
            return {"text": (text or "").strip()}

    if provider == "deepseek":
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise HTTPException(500, detail="DEEPSEEK_API_KEY is not set on the backend.")
        url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com") + "/chat/completions"
        payload = {
            "model": os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
            "messages": [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.8,
        }
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.post(url, json=payload, headers=headers)
            if r.status_code >= 400:
                raise HTTPException(r.status_code, detail=r.text)
            data = r.json()
            text = (
                data.get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
            )
            return {"text": (text or "").strip()}

    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(500, detail="GEMINI_API_KEY is not set on the backend.")
        model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
        params = {"key": api_key}
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_msg}\n\n{prompt}"}]}
            ],
            "generationConfig": {"temperature": 0.8},
        }

        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.post(url, params=params, json=payload)
            if r.status_code >= 400:
                raise HTTPException(r.status_code, detail=r.text)
            data = r.json()
            text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            return {"text": (text or "").strip()}

    raise HTTPException(400, detail='Invalid model. Use "groq", "gemini", or "deepseek".')