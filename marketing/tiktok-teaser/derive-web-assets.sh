#!/usr/bin/env bash
# Derives the three assets the landing page serves from the 1080x1920 master that
# render.mjs produces. Run this after every re-render, or the site keeps showing the old
# cut while the social file has moved on.
#
#   public/limbic-tour.webm         VP9, what Chrome/Firefox/Android actually play
#   public/limbic-tour.mp4          H.264, the Safari fallback
#   public/limbic-tour-poster.jpg   the frame shown before anyone presses play
#
# Usage:  ./marketing/tiktok-teaser/derive-web-assets.sh [path-to-ffmpeg]
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
FF="${1:-${FFMPEG:-ffmpeg}}"
MASTER="$HERE/limbic-teaser.mp4"
PUB="$REPO/public"

[ -f "$MASTER" ] || { echo "no master at $MASTER — run render.mjs first" >&2; exit 1; }

# 720 wide, not 1080: the page frames the player at 380px, so 720 is already 2x for a
# retina display and anything more is bitrate nobody sees.
SCALE="scale=720:1280:flags=lanczos"

# VP9 lands ~32% under H.264 here at visually identical quality, which is why it goes
# first in the <source> list.
echo "webm..."
"$FF" -hide_banner -loglevel error -i "$MASTER" -vf "$SCALE" \
  -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 -cpu-used 4 -deadline good \
  -pix_fmt yuv420p -an -y "$PUB/limbic-tour.webm"

echo "mp4..."
"$FF" -hide_banner -loglevel error -i "$MASTER" -vf "$SCALE" \
  -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -profile:v high -level 4.0 \
  -an -movflags +faststart -y "$PUB/limbic-tour.mp4"

# 4.6s is the logo beat, fully settled — the strongest single frame to sit behind a play
# button. Both web files are silent (-an): the master's silent AAC track exists only so
# social players don't choke on a track-less file, and the page has no use for it.
echo "poster..."
"$FF" -hide_banner -loglevel error -ss 4.6 -i "$MASTER" -vf "$SCALE" \
  -frames:v 1 -q:v 4 -y "$PUB/limbic-tour-poster.jpg"

ls -la "$PUB/limbic-tour.webm" "$PUB/limbic-tour.mp4" "$PUB/limbic-tour-poster.jpg"
