#!/usr/bin/env bash
# Derives the files the landing page serves from the two masters that
# `node render.mjs` produces. Run this after every re-render, or the site keeps
# showing the old cuts while the masters move on.
#
# Landscape (ORIENTATION=landscape) → the desktop 16:9 player:
#   public/limbic-tour.webm
#   public/limbic-tour.mp4
#   public/limbic-tour-poster.jpg
#
# Portrait (default render) → the phone-width 9:16 player on narrow viewports:
#   public/limbic-tour-9x16.webm
#   public/limbic-tour-9x16.mp4
#   public/limbic-tour-9x16-poster.jpg
#
# The social upload is still the 1080×1920 master itself (hand-uploaded); these
# 9:16 public files are a 720-wide web cut of that same master, not a third encode.
#
# Usage:  ./marketing/video/derive-web-assets.sh [path-to-ffmpeg]
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
FF="${1:-${FFMPEG:-ffmpeg}}"
LAND_MASTER="$HERE/limbic-tour-16x9.mp4"
PORT_MASTER="$HERE/limbic-tour-9x16.mp4"
PUB="$REPO/public"

# 4.6s is the logo beat, fully settled — the strongest single frame to sit behind a play
# button. Both web files are silent (-an): the master's silent AAC track exists only so
# social players don't choke on a track-less file, and the page has no use for it.
derive() {
  local master="$1" scale="$2" stem="$3"
  [ -f "$master" ] || { echo "no master at $master — run node render.mjs first" >&2; exit 1; }

  echo "$stem webm..."
  "$FF" -hide_banner -loglevel error -i "$master" -vf "$scale" \
    -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 -cpu-used 4 -deadline good \
    -pix_fmt yuv420p -an -y "$PUB/${stem}.webm"

  echo "$stem mp4..."
  "$FF" -hide_banner -loglevel error -i "$master" -vf "$scale" \
    -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -profile:v high -level 4.0 \
    -an -movflags +faststart -y "$PUB/${stem}.mp4"

  echo "$stem poster..."
  "$FF" -hide_banner -loglevel error -ss 4.6 -i "$master" -vf "$scale" \
    -frames:v 1 -q:v 4 -y "$PUB/${stem}-poster.jpg"
}

# 1280 wide, not 1920: the landscape section caps the player at 752px, so 1280 is already
# comfortably past 1x on a retina display and anything more is bitrate nobody sees.
derive "$LAND_MASTER" "scale=1280:720:flags=lanczos" "limbic-tour"

# 720 wide, not 1080: the portrait frame caps at 380px, matching the original phone-width
# player. 720 is 2x on a retina phone and the same pixel count as the 1280×720 landscape cut.
derive "$PORT_MASTER" "scale=720:1280:flags=lanczos" "limbic-tour-9x16"

ls -la \
  "$PUB/limbic-tour.webm" "$PUB/limbic-tour.mp4" "$PUB/limbic-tour-poster.jpg" \
  "$PUB/limbic-tour-9x16.webm" "$PUB/limbic-tour-9x16.mp4" "$PUB/limbic-tour-9x16-poster.jpg"
