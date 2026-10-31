#!/usr/bin/env python3
"""Crop and scale the raw captures produced by capture.mjs.

The raw shots are 2x. Each state is cropped 26 CSS px outside the panel rect
so the elevation hairline and shadow survive, then scaled to a fixed width.

usage:
  crop.py --raw .screenshots/raw --theme light --out docs/assets/features \
          [--width 640] [--margin 26]
"""
import argparse
import json
import os

from PIL import Image


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--raw', required=True)
    ap.add_argument('--theme', required=True, choices=['light', 'dark'])
    ap.add_argument('--out', required=True)
    ap.add_argument('--width', type=int, default=640)
    ap.add_argument('--margin', type=int, default=26)
    args = ap.parse_args()

    rects = json.load(open(os.path.join(args.raw, f'{args.theme}-rects.json')))
    os.makedirs(args.out, exist_ok=True)
    suffix = '-dark' if args.theme == 'dark' else ''

    for name, r in rects.items():
        src = os.path.join(args.raw, f'{args.theme}-{name}.png')
        im = Image.open(src).convert('RGB')
        m = args.margin * 2
        box = (
            round(r['x'] * 2) - m,
            round(r['y'] * 2) - m,
            round((r['x'] + r['w']) * 2) + m,
            round((r['y'] + r['h']) * 2) + m,
        )
        crop = im.crop(box)
        crop = crop.resize((args.width, round(crop.height * args.width / crop.width)), Image.LANCZOS)
        dst = os.path.join(args.out, f'{name}{suffix}.png')
        crop.save(dst)
        print(dst, crop.size)


if __name__ == '__main__':
    main()
