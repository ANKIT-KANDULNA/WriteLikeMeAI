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

    # ── BRIDGE GAPS: Closing to connect thin parts of p, q, i, etc. ────────────
    # This specifically helps when a pen stroke is slightly disconnected
    close_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    binary_inv = cv2.morphologyEx(binary_inv, cv2.MORPH_CLOSE, close_kernel)

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
        
        # Get row height for merging context
        row_h_values = [c["box"][3] for c in row]
        if not row_h_values: continue
        max_h = max(row_h_values)
        
        # ── 5. Merge Vertically-Stacked Components (i, j, !, etc.) ────────────
        # Components in a row that are centered over each other should be merged
        temp_chars = row[:]
        changed = True
        while changed:
            changed = False
            for i in range(len(temp_chars)):
                for j in range(i + 1, len(temp_chars)):
                    c1 = temp_chars[i]
                    c2 = temp_chars[j]
                    if c1["merged"] or c2["merged"]: continue
                    
                    x1, y1, w1, h1 = c1["box"]
                    x2, y2, w2, h2 = c2["box"]
                    cx1, cy1 = c1["center"]
                    cx2, cy2 = c2["center"]
                    
                    # Horizontal overlap check
                    overlap_x = max(0, min(x1+w1, x2+w2) - max(x1, x2))
                    min_w = min(w1, w2)
                    
                    # Vertical gap check
                    v_gap = max(0, max(y1, y2) - min(y1+h1, y2+h2))
                    
                    # If they overlap horizontally significantly and are close vertically
                    # Using a very generous vertical gap (80% of row height)
                    if overlap_x > (min_w * 0.5) and v_gap < (max_h * 0.8):
                        # Merge c2 into c1
                        nx, ny = min(x1, x2), min(y1, y2)
                        nw, nh = max(x1+w1, x2+w2)-nx, max(y1+h1, y2+h2)-ny
                        c1["box"] = (nx, ny, nw, nh)
                        c1["label_ids"] += c2["label_ids"]
                        c1["center"] = (nx + nw/2, ny + nh/2)
                        c2["merged"] = True
                        changed = True
                        break
                if changed: break
        
        # Add unmerged characters to final list
        final_chars = [c for c in temp_chars if not c["merged"]]
        
        # Re-sort left-to-right
        final_chars.sort(key=lambda c: c["box"][0])
        
        # ── 6. Crop ───────────────────────────────────────────────────────────
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