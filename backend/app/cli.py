from __future__ import annotations

import argparse
from pathlib import Path

from .calibration import build_glyph_bank
from .pipeline import infer, train


def main() -> None:
    parser = argparse.ArgumentParser(description="Synthetic font pipeline")
    sub = parser.add_subparsers(dest="command", required=True)

    train_cmd = sub.add_parser("train", help="Train handwriting model")
    train_cmd.add_argument("--data-dir", type=Path, required=True)
    train_cmd.add_argument("--output-dir", type=Path, required=True)

    infer_cmd = sub.add_parser("infer", help="Synthesize font from sample image or PDF")
    infer_cmd.add_argument("--sample-file", type=Path, required=True)
    infer_cmd.add_argument("--output-font", type=Path, required=True)

    calibrate_cmd = sub.add_parser("calibrate", help="Extract per-character glyph bank from calibration page")
    calibrate_cmd.add_argument("--sample-file", type=Path, required=True)
    calibrate_cmd.add_argument("--output-dir", type=Path, required=True)

    args = parser.parse_args()

    if args.command == "train":
        train(args.data_dir, args.output_dir)
        return

    if args.command == "infer":
        infer(args.sample_file, args.output_font)
        return

    report = build_glyph_bank(args.sample_file, args.output_dir)
    print(
        "[calibrate] complete -> "
        f"{args.output_dir} (glyphs={report['glyph_count']}/{report['charset_size']})"
    )

