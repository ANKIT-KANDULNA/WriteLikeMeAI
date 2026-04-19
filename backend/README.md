# Synthetic Font Pipeline

This backend folder contains a modular synthetic-font workflow.

## Commands

- Train model:
  - `python synthetic_font_pipeline.py train --data-dir ./datasets/handwriting --output-dir ./artifacts`
- Infer font from one sample image:
  - `python synthetic_font_pipeline.py infer --sample-file ./sample.png --output-font ../frontend/public/generated-fonts/my-font.woff2`
  - PDF is also accepted in the same `--sample-file` argument.

## When you need to run training

Run `train` when:
- you add a significant amount of new handwriting training data,
- quality drifts and generated fonts look inconsistent,
- you change model architecture or preprocessing.

You do **not** need to run `train` for every new user upload once the model is stable.

## Project structure

- `synthetic_font_pipeline.py`: thin CLI entrypoint.
- `app/cli.py`: command parsing (`train`, `infer`).
- `app/pipeline.py`: high-level train/infer orchestration.
- `app/extraction.py`: PDF/image page extraction + line segmentation + style features.
- `app/style_model.py`: learned style parameter model train/load/predict logic.
- `app/rendering.py`: style-aware glyph transform rendering and base font resolution.
- `tests/test_style_model.py`: basic regression model unit test.

## Current status

The upload API calls `infer` automatically from the Next.js route.

- `infer` now extracts pages/lines/style features from image/PDF inputs.
- Rendering uses learned style parameters to transform a base script font.
- If style rendering fails, it falls back to a base font copy for reliability.

## Training / inference cadence

- **Run `train`** when you add/refresh dataset or update preprocessing/model architecture.
- **Run `infer` per user upload** (this is already triggered by the upload API route).
