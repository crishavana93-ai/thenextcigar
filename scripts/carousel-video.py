#!/usr/bin/env python3
"""Carousel 10, video version.

Usage: python3 make_video_slides.py <carousel_dir> <clips_dir> <out_dir> [--offsets 1:0.5,3:0.4]

<carousel_dir> holds source.html (the still carousel). <clips_dir> holds 01.* .. 07.*
(any phone format). For each slide: crop the clip to 1080x1350 (cover), darken it,
lay a scrim + the slide's text on top, cap at 10 s, export H.264 MP4 with no audio.
--offsets sets the vertical crop centre per slide (0 = top, 0.5 = middle, 1 = bottom).
Slides with no clip are left out (post the still PNG for those).
"""
import sys, os, glob, json, subprocess, tempfile, shutil

car, clips, out = sys.argv[1:4]
offsets = {}
if "--offsets" in sys.argv:
    for kv in sys.argv[sys.argv.index("--offsets") + 1].split(","):
        k, v = kv.split(":"); offsets[int(k)] = float(v)
os.makedirs(out, exist_ok=True)
tmp = tempfile.mkdtemp()

OVERRIDE = """
<style>
.slide{background:transparent!important}
.grain{display:none!important}
.paper{display:none!important}
.band{background:linear-gradient(180deg,rgba(11,10,9,0) 0,rgba(11,10,9,.78) 110px,rgba(11,10,9,.88) 100%)!important}
.slide.over .band:before{display:none!important}
.slide{text-shadow:0 2px 18px rgba(0,0,0,.55)}
</style>
"""
src = open(os.path.join(car, "source.html")).read().replace("</head>", OVERRIDE + "</head>")
vhtml = os.path.join(car, "_video_overlay.html")
open(vhtml, "w").write(src)

# 1) transparent text layers
js = f"""
const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();
const p=await b.newPage({{viewport:{{width:1080,height:1350}},deviceScaleFactor:1}});
await p.goto('file://{os.path.abspath(vhtml)}',{{waitUntil:'networkidle'}});await p.evaluate(()=>document.fonts.ready);
const s=await p.$$('.slide');for(let i=0;i<s.length;i++)await s[i].screenshot({{path:'{tmp}/t'+String(i+1).padStart(2,'0')+'.png',omitBackground:true}});
console.log(s.length);await b.close()}})()"""
n = int(subprocess.check_output(["node", "-e", js]).decode().strip())
os.remove(vhtml)

# 2) scrim: dark at the top (text tables), clear in the middle
from PIL import Image
sc = Image.new("RGBA", (1080, 1350))
px = sc.load()
for y in range(1350):
    a = 0
    if y < 760:
        a = int(200 * (1 - y / 760) ** 1.2) + 40
    else:
        a = 40
    for x in range(1080):
        px[x, y] = (11, 10, 9, a)
sc.save(f"{tmp}/scrim.png")

made = []
for i in range(1, n + 1):
    c = sorted(glob.glob(os.path.join(clips, f"{i:02d}.*")))
    if not c:
        continue
    oy = offsets.get(i, 0.5)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", c[0]]).decode().strip())
    t = min(dur, 10.0)
    vf = (f"[0:v]scale=1080:1350:force_original_aspect_ratio=increase,"
          f"crop=1080:1350:(iw-1080)/2:(ih-1350)*{oy},fps=30,"
          f"eq=brightness=-0.05:saturation=0.85[v];"
          f"[v][1:v]overlay=0:0[v2];[v2][2:v]overlay=0:0,format=yuv420p[o]")
    dst = os.path.join(out, f"{i:02d}.mp4")
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", c[0], "-i", f"{tmp}/scrim.png",
                           "-i", f"{tmp}/t{i:02d}.png", "-filter_complex", vf, "-map", "[o]", "-t", f"{t:.2f}",
                           "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high",
                           "-movflags", "+faststart", dst])
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t/2:.2f}", "-i", dst, "-frames:v", "1",
                           os.path.join(out, f"{i:02d}-frame.jpg")])
    made.append((i, round(t, 1)))
shutil.rmtree(tmp)
print(json.dumps({"slides": n, "videos": made}))
