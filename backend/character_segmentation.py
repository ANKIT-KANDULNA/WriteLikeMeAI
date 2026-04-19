"""
character_segmentation.py
--------------------------
Pure-OpenCV handwriting segmentation — no PaddleOCR / PaddlePaddle needed.

Strategy
--------
1. Sauvola adaptive threshold  → clean binary mask
2. Horizontal projection profile → detect text-row bands (no ML!)
3. Connected-component analysis per row → individual character blobs
4. Dot-merge pass            → join i/j dots with their bodies
5. CCA isolation masking     → clean white-background crops
"""

import cv2
import numpy as np
from skimage.filters import threshold_sauvola


# ── Row-band detection ────────────────────────────────────────────────────────

def _detect_row_bands(
    binary_inv: np.ndarray,
    min_gap: int = 6,
    row_padding: int = 10,
    min_band_height: int = 8,
) -> list[tuple[int, int]]:
    """
    Use the horizontal projection profile of a binarized image to locate
    text-row bands.  Returns [(y_start, y_end), ...] sorted top-to-bottom.

    binary_inv : uint8 ndarray where foreground pixels == 255.
    """
    row_sums = binary_inv.sum(axis=1).astype(np.int64)   # shape (H,)
    is_text  = row_sums > 0

    # ── find raw bands ────────────────────────────────────────────────────────
    raw: list[list[int]] = []
    in_band = False
    start   = 0
    for i, v in enumerate(is_text):
        if v and not in_band:
            in_band = True
            start   = i
        elif not v and in_band:
            in_band = False
            raw.append([start, i])
    if in_band:
        raw.append([start, int(len(is_text))])

    # ── merge nearby bands ────────────────────────────────────────────────────
    merged: list[list[int]] = []
    for band in raw:
        if merged and (band[0] - merged[-1][1]) < min_gap:
            merged[-1][1] = band[1]
        else:
            merged.append(band[:])

    # ── apply padding & filter tiny noise bands ───────────────────────────────
    H = binary_inv.shape[0]
    result: list[tuple[int, int]] = []
    for s, e in merged:
        s = max(0, s - row_padding)
        e = min(H, e + row_padding)
        if (e - s) >= min_band_height:
            result.append((s, e))

    return result


# ── Main segmentation entry point ─────────────────────────────────────────────

def segment_characters(
    image_path: str,
    det_model=None,                 # legacy parameter — intentionally ignored
    target_dim: int = 1024,
    padding: int = 4,
    sauvola_window: int = 25,
    dot_height_ratio: float = 0.35,
    max_dot_gap_ratio: float = 1.0,
    horizontal_tolerance_ratio: float = 0.4,
    min_area_threshold: int = 20,
    dilation_iterations: int = 1,
) -> list[np.ndarray]:
    """
    Segment individual handwritten characters from *image_path*.

    Parameters
    ----------
    image_path            : path to the input image
    det_model             : IGNORED (kept for API compatibility with old code)
    target_dim            : resize longest edge to this many pixels
    padding               : extra pixels around each crop
    sauvola_window        : window size for Sauvola binarization
    dot_height_ratio      : fraction of row height below which a blob is a dot
    max_dot_gap_ratio     : max vertical gap (as fraction of body height) to merge dot
    horizontal_tolerance_ratio : horizontal tolerance when matching dot → body
    min_area_threshold    : minimum pixel area to keep a connected component
    dilation_iterations   : morphological dilation before CCA

    Returns
    -------
    list of BGR numpy arrays, one per detected character
    """
    image = cv2.imread(image_path)
    if image is None:
        return []

    # ── 1. Resize ─────────────────────────────────────────────────────────────
    h_orig, w_orig = image.shape[:2]
    scale  = target_dim / max(h_orig, w_orig)
    image  = cv2.resize(image, (int(w_orig * scale), int(h_orig * scale)))

    # ── 2. Sauvola binarization ───────────────────────────────────────────────
    gray       = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh_val = threshold_sauvola(gray, window_size=sauvola_window)
    binary_inv = (gray < thresh_val).astype(np.uint8) * 255   # foreground = 255

    # ── 3. Row-band detection via projection profile (NO ML!) ─────────────────
    row_bands = _detect_row_bands(binary_inv)

    character_crops: list[np.ndarray] = []

    for y_start, y_end in row_bands:
        line_img = image[y_start:y_end, :]
        line_bin = binary_inv[y_start:y_end, :]
        line_h   = y_end - y_start

        # ── 4. Dilation to connect broken strokes ─────────────────────────────
        kernel  = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        dilated = cv2.dilate(line_bin, kernel, iterations=dilation_iterations)

        # ── 5. Connected-component analysis ───────────────────────────────────
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
            dilated, connectivity=8
        )

        component_info: list[dict] = []
        for i in range(1, num_labels):           # skip background label 0
            area = stats[i, cv2.CC_STAT_AREA]
            if area >= min_area_threshold:
                x  = stats[i, cv2.CC_STAT_LEFT]
                y  = stats[i, cv2.CC_STAT_TOP]
                w  = stats[i, cv2.CC_STAT_WIDTH]
                h  = stats[i, cv2.CC_STAT_HEIGHT]
                cx, cy = centroids[i]
                component_info.append({
                    "id":        i,
                    "box":       (x, y, w, h),
                    "center":    (cx, cy),
                    "area":      area,
                    "label_ids": [i],
                    "merged":    False,
                })

        # ── 6. Dot-merge pass (works for i, j, !, ?, etc.) ────────────────────
        max_dot_dim  = line_h * dot_height_ratio
        max_dot_area = max_dot_dim ** 2

        dots   = [c for c in component_info
                  if c["box"][3] < max_dot_dim and c["area"] < max_dot_area]
        bodies = [c for c in component_info if c not in dots]

        final_characters: list[dict] = []

        for dot in dots:
            if dot["merged"]:
                continue
            dx, dy, dw, dh = dot["box"]
            dcx, _          = dot["center"]

            best_body = None
            min_dist  = float("inf")

            for body in bodies:
                if body["merged"]:
                    continue
                bx, by, bw, bh = body["box"]
                _, bcy          = body["center"]

                if by < (dy + dh):               # body must be below the dot
                    continue
                tol   = bw * horizontal_tolerance_ratio
                if (bx - tol) < dcx < (bx + bw + tol):
                    v_gap = by - (dy + dh)
                    if 0 <= v_gap <= (bh * max_dot_gap_ratio):
                        dist = bcy - _
                        if dist < min_dist:
                            min_dist  = dist
                            best_body = body

            if best_body:
                bx, by, bw, bh = best_body["box"]
                nx  = min(dx, bx);  ny  = min(dy, by)
                nw  = max(dx + dw, bx + bw) - nx
                nh  = max(dy + dh, by + bh) - ny
                dot["merged"]       = True
                best_body["merged"] = True
                final_characters.append({
                    "box":       (nx, ny, nw, nh),
                    "label_ids": dot["label_ids"] + best_body["label_ids"],
                })

        for body in bodies:
            if not body["merged"]:
                final_characters.append(body)

        # ── 7. Sort left-to-right ─────────────────────────────────────────────
        final_characters.sort(key=lambda c: c["box"][0])

        # ── 8. Crop with CCA isolation masking ────────────────────────────────
        for char in final_characters:
            cx, cy, cw, ch = char["box"]
            char_mask  = np.isin(labels, char["label_ids"])
            isolated   = np.full_like(line_img, 255)
            isolated[char_mask] = line_img[char_mask]

            x1 = max(0, cx - padding);   y1 = max(0, cy - padding)
            x2 = min(line_img.shape[1], cx + cw + padding)
            y2 = min(line_img.shape[0], cy + ch + padding)
            crop = isolated[y1:y2, x1:x2]
            if crop.size > 0:
                character_crops.append(crop)

    return character_crops