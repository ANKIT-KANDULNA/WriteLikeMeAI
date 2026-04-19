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

def _group_into_rows(components, overlap_thresh=0.4):
    """
    Groups character components into rows based on vertical overlap.
    Returns a list of rows, where each row is a list of components.
    """
    if not components:
        return []

    # Sort by Y top
    components.sort(key=lambda c: c["box"][1])

    rows = []
    for comp in components:
        _, y, _, h = comp["box"]
        y_mid = y + h / 2
        
        # Look for a row that this component overlaps with vertically
        best_row = None
        for row in rows:
            # Check overlap with the first item in the row (representative)
            _, ry, _, rh = row[0]["box"]
            
            # Simple overlap check: is the midpoint of this char within the row's vertical span?
            if ry <= y_mid <= (ry + rh):
                best_row = row
                break
            
            # Alternative: check if more than overlap_thresh of the component is within the row
            ov_start = max(y, ry)
            ov_end = min(y + h, ry + rh)
            ov_h = max(0, ov_end - ov_start)
            if ov_h / h > overlap_thresh:
                best_row = row
                break

        if best_row is not None:
            best_row.append(comp)
        else:
            rows.append([comp])
    
    # Sort each row left-to-right
    for row in rows:
        row.sort(key=lambda c: c["box"][0])
        
    return rows

def segment_characters(
    image_path: str,
    det_model=None,
    target_dim: int = 1024,
    padding: int = 4,
    sauvola_window: int = 35,  # Increased window for better local contrast
    dot_height_ratio: float = 0.4,
    min_area_threshold: int = 20,
) -> list[np.ndarray]:
    """
    SegmentCharacters using CCA and Blob Grouping.
    1. Binarize.
    2. Find all blobs.
    3. Group blobs into rows.
    4. Merge dots (i, j, !, etc.).
    5. Crop.
    """
    image = cv2.imread(image_path)
    if image is None:
        return []

    # ── 1. Resize ─────────────────────────────────────────────────────────────
    h_orig, w_orig = image.shape[:2]
    scale = target_dim / max(h_orig, w_orig)
    image = cv2.resize(image, (int(w_orig * scale), int(h_orig * scale)))

    # ── 2. Binarize ───────────────────────────────────────────────────────────
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Use a larger window for adaptive thresholding
    thresh_val = threshold_sauvola(gray, window_size=sauvola_window)
    binary_inv = (gray < thresh_val).astype(np.uint8) * 255

    # ── 3. Find All Blobs (CCA) ───────────────────────────────────────────────
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
        binary_inv, connectivity=8
    )

    all_components = []
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        if area >= min_area_threshold:
            x, y, w, h = stats[i, 0], stats[i, 1], stats[i, 2], stats[i, 3]
            cx, cy = centroids[i]
            all_components.append({
                "id": i,
                "box": (x, y, w, h),
                "center": (cx, cy),
                "area": area,
                "label_ids": [i],
                "merged": False
            })

    # ── 4. Group into Rows ────────────────────────────────────────────────────
    rows = _group_into_rows(all_components)

    character_crops = []

    for row in rows:
        # Sort left-to-right within the row
        row.sort(key=lambda c: c["box"][0])
        
        # Dot Merge Logic within each row
        # Find dots (small components) vs bodies
        max_h = max(c["box"][3] for c in row)
        dot_thresh = max_h * dot_height_ratio
        
        dots = [c for c in row if c["box"][3] < dot_thresh]
        bodies = [c for c in row if c not in dots]
        
        final_chars = []
        for dot in dots:
            if dot["merged"]: continue
            dcx, dcy = dot["center"]
            dx, dy, dw, dh = dot["box"]
            
            # Find nearest body below the dot
            best_body = None
            min_dist = float('inf')
            for body in bodies:
                if body["merged"]: continue
                bx, by, bw, bh = body["box"]
                bcx, bcy = body["center"]
                
                # Basic vertical/horizontal alignment for dots
                if by >= dy and abs(bcx - dcx) < (bw * 0.8):
                    dist = bcy - dcy
                    if dist < min_dist:
                        min_dist = dist
                        best_body = body
            
            if best_body:
                bx, by, bw, bh = best_body["box"]
                nx, ny = min(dx, bx), min(dy, by)
                nw, nh = max(dx+dw, bx+bw)-nx, max(dy+dh, by+bh)-ny
                dot["merged"] = True
                best_body["merged"] = True
                final_chars.append({
                    "box": (nx, ny, nw, nh),
                    "label_ids": dot["label_ids"] + best_body["label_ids"]
                })
        
        # Add remaining unmerged components
        for c in row:
            if not c["merged"]:
                final_chars.append(c)
        
        # Re-sort left-to-right after merge
        final_chars.sort(key=lambda c: c["box"][0])
        
        # ── 5. Crop ───────────────────────────────────────────────────────────
        for char in final_chars:
            x, y, w, h = char["box"]
            
            # Isolation masking (keeps the crop clean)
            char_mask = np.isin(labels, char["label_ids"])
            isolated = np.full_like(image, 255)
            # Efficient masking
            mask_indices = np.where(char_mask)
            isolated[mask_indices] = image[mask_indices]
            
            x1, y1 = max(0, x - padding), max(0, y - padding)
            x2, y2 = min(image.shape[1], x + w + padding), min(image.shape[0], y + h + padding)
            
            crop = isolated[y1:y2, x1:x2]
            if crop.size > 0:
                character_crops.append(crop)

    return character_crops

    return character_crops