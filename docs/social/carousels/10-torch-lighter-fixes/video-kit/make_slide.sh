#!/bin/bash
# make_slide.sh <clip> <overlay.png> <out.mp4> [seconds]   — 1080x1350, darkened, text on top, silent
set -e
DUR=${4:-8}
ffmpeg -y -loglevel error -i "$1" -loop 1 -i "$2" -filter_complex \
"[0:v]scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,fps=30,eq=brightness=-0.06:saturation=0.85:contrast=1.05,trim=duration=$DUR,setpts=PTS-STARTPTS[bg];[bg][1:v]overlay=0:0:shortest=1,format=yuv420p[v]" \
-map "[v]" -an -c:v libx264 -preset slow -crf 18 -movflags +faststart -t $DUR "$3"
