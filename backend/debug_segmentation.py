import cv2
import numpy as np
from character_segmentation import segment_characters
from skimage.filters import threshold_sauvola
import os

def debug_segment(image_path):
    print(f"Processing {image_path}...")
    image = cv2.imread(image_path)
    if image is None:
        print("Image not found")
        return

    # 4. Characters
    chars = segment_characters(image_path, None)
    print(f"Segmented {len(chars)} characters total.")

if __name__ == "__main__":
    debug_segment("good_example.jpg")
