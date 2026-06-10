#!/usr/bin/env bash
# Render a carousel HTML file to a print-ready PDF (4:5) via headless Chrome,
# then build a preview contact sheet so the result can be eyeballed.
#
# Usage: bash render.sh path/to/carousel.html
#
# Output: <same-dir>/<name>.pdf  and  <same-dir>/contact.png
set -euo pipefail

HTML="${1:?Usage: render.sh path/to/carousel.html}"
HTML_ABS="$(cd "$(dirname "$HTML")" && pwd)/$(basename "$HTML")"
DIR="$(dirname "$HTML_ABS")"
NAME="$(basename "$HTML_ABS" .html)"
PDF="$DIR/$NAME.pdf"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [[ ! -x "$CHROME" ]]; then
  echo "ERROR: Google Chrome not found at $CHROME" >&2
  exit 1
fi

echo "Rendering $NAME.html -> $NAME.pdf ..."
# --virtual-time-budget gives the Google Fonts time to load before capture.
# Without enough budget, headers fall back to a serif and the brand breaks.
"$CHROME" \
  --headless=new --disable-gpu --no-pdf-header-footer --no-margins \
  --virtual-time-budget=12000 \
  --print-to-pdf="$PDF" \
  "file://$HTML_ABS" 2>/dev/null || true

if [[ ! -f "$PDF" ]]; then
  echo "ERROR: PDF was not produced." >&2
  exit 1
fi
echo "PDF: $PDF ($(du -h "$PDF" | cut -f1))"

# Optional preview: render every page and tile into one contact sheet.
if command -v pdftoppm >/dev/null && command -v magick >/dev/null; then
  TMP="$(mktemp -d)"
  pdftoppm -png -r 55 "$PDF" "$TMP/pg" >/dev/null 2>&1 || true
  PAGES=$(ls "$TMP"/pg-*.png 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$PAGES" -gt 0 ]]; then
    # tile width = 3, or fewer if not many pages
    COLS=3; [[ "$PAGES" -lt 3 ]] && COLS="$PAGES"
    magick montage "$TMP"/pg-*.png -tile "${COLS}x" -geometry +8+8 \
      -background "#222" "$DIR/contact.png" 2>/dev/null || true
    echo "Preview: $DIR/contact.png ($PAGES pages) — open/Read this to verify fonts + layout."
  fi
  rm -rf "$TMP"
else
  echo "Note: install pdftoppm + imagemagick (brew) to auto-generate a preview contact sheet."
fi
