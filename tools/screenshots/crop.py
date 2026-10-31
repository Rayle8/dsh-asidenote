#!/usr/bin/env python3
"""Crop and scale the raw captures produced by capture.mjs.

Two modes:

* default — the five feature states. Each is cropped 26 CSS px outside the panel
  rect so the elevation hairline and shadow survive, then scaled to a fixed width.
* ``--preview`` — the README previews. The whole window is scaled to 1920x1200 and
  the header strip is cropped from the right edge for the badge.

usage:
  crop.py --raw .screenshots/raw --theme light --out docs/assets/features \
          [--width 1080] [--margin 26]
  crop.py --raw .screenshots/raw --theme light --out docs/assets --preview
"""
import argparse
import json
import os

from PIL import Image

# Chrome runs at deviceScaleFactor=4 (see run.sh), so raw shots are 4x CSS pixels.
SCALE = 4
WINDOW = (1920, 1200)
BADGE = (920, 352)
# 4x pixels: 115x44 CSS px pinned to the window's right edge, per SOP section 6.
BADGE_BOX = (460, 176)


def features(args) -> None:
    rects = json.load(open(os.path.join(args.raw, f'{args.theme}-rects.json')))
    os.makedirs(args.out, exist_ok=True)
    suffix = '-dark' if args.theme == 'dark' else ''

    for name, r in rects.items():
        src = os.path.join(args.raw, f'{args.theme}-{name}.png')
        im = Image.open(src).convert('RGB')
        m = args.margin * SCALE
        box = (
            round(r['x'] * SCALE) - m,
            round(r['y'] * SCALE) - m,
            round((r['x'] + r['w']) * SCALE) + m,
            round((r['y'] + r['h']) * SCALE) + m,
        )
        crop = im.crop(box)
        crop = crop.resize((args.width, round(crop.height * args.width / crop.width)), Image.LANCZOS)
        dst = os.path.join(args.out, f'{name}{suffix}.png')
        crop.save(dst)
        print(dst, crop.size)


def previews(args) -> None:
    os.makedirs(args.out, exist_ok=True)
    suffix = '-dark' if args.theme == 'dark' else ''

    full = Image.open(os.path.join(args.raw, f'{args.theme}-preview.png')).convert('RGB')
    expected = (1440 * SCALE, 900 * SCALE)
    if full.size != expected:
        print(f'warning: expected a {expected[0]}x{expected[1]} window shot, got {full.size[0]}x{full.size[1]}')
    window = full.resize(WINDOW, Image.LANCZOS)
    dst = os.path.join(args.out, f'preview-right{suffix}.png')
    window.save(dst)
    print(dst, window.size)

    header = Image.open(os.path.join(args.raw, f'{args.theme}-header.png')).convert('RGB')
    width, height = header.size
    box_w, box_h = BADGE_BOX
    if width < box_w or height < box_h:
        raise SystemExit(f'header shot {width}x{height} is too small for the badge crop')
    badge = header.crop((width - box_w, 0, width, box_h)).resize(BADGE, Image.LANCZOS)
    dst = os.path.join(args.out, f'preview-badge{suffix}.png')
    badge.save(dst)
    print(dst, badge.size)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--raw', required=True)
    ap.add_argument('--theme', required=True, choices=['light', 'dark'])
    ap.add_argument('--out', required=True)
    ap.add_argument('--width', type=int, default=1080)
    ap.add_argument('--margin', type=int, default=26)
    ap.add_argument('--preview', action='store_true', help='write preview-right/preview-badge instead of the feature crops')
    args = ap.parse_args()

    if args.preview:
        previews(args)
    else:
        features(args)


if __name__ == '__main__':
    main()
