// Usage: node make-cover.mjs '<headline>' '<standfirst>' <featured.jpg|png> '<caption>' '<tag>' '<band headline html>' '<band sub>' out.png
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const [headline, standfirst, imgPath, caption, tag, bandH, bandSub, outPath] = process.argv.slice(2);
const cwd = process.cwd();
let fp = fs.readFileSync(path.join(cwd, 'fp-template.html'), 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
fp = fp.replace('{{HEADLINE}}', esc(headline)).replace('{{STANDFIRST}}', esc(standfirst)).replace('{{CAPTION}}', esc(caption));
const mime = imgPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
fp = fp.replace('{{FEATURED}}', `data:${mime};base64,${fs.readFileSync(imgPath).toString('base64')}`);
fs.writeFileSync(path.join(cwd, '_fp.html'), fp);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
await p.goto('file://' + path.join(cwd, '_fp.html')); await p.waitForTimeout(1200);
await p.screenshot({ path: path.join(cwd, '_fp.jpg'), type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 1440, height: 900 } });

const cover = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Newsreader';font-style:normal;font-weight:200 700;src:url(file:///mnt/attach/outputs/tnc-paper/public/fonts/newsreader-normal.woff2) format('woff2-variations')}
@font-face{font-family:'Newsreader';font-style:italic;font-weight:200 700;src:url(file:///mnt/attach/outputs/tnc-paper/public/fonts/newsreader-italic.woff2) format('woff2-variations')}
@font-face{font-family:'IBM Plex Sans';font-weight:500;src:url(file:///mnt/attach/outputs/tnc-paper/public/fonts/ibm-plex-sans-latin-500-normal.woff2) format('woff2')}
html,body{margin:0}
.s{width:1080px;height:1350px;position:relative;overflow:hidden;background:#0B0A09;font-family:'Newsreader',serif;color:#F2F0EA}
.grain{position:absolute;inset:0;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .05 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");pointer-events:none;z-index:5}
.paper{position:absolute;left:48px;top:48px;width:984px;height:800px;overflow:hidden;border-radius:6px 6px 0 0;box-shadow:0 24px 70px rgba(0,0,0,.75);background:#F2F0EA}
.paper img{position:absolute;left:0;top:0;width:984px}
.paper:after{content:"";position:absolute;left:0;right:0;bottom:0;height:340px;background:linear-gradient(180deg,rgba(11,10,9,0) 0%,rgba(11,10,9,.04) 18%,rgba(11,10,9,.16) 36%,rgba(11,10,9,.4) 55%,rgba(11,10,9,.72) 75%,rgba(11,10,9,.94) 90%,#0B0A09 100%)}
.fold{display:none}
.band{position:absolute;left:0;right:0;top:800px;bottom:0;text-align:center;padding:0 72px}
.tag{display:inline-block;margin-top:54px;font-family:'IBM Plex Sans';font-size:20px;letter-spacing:.26em;text-transform:uppercase;color:#F2F0EA;background:#7B2622;padding:9px 18px}
h1{margin:30px 0 0;font-size:92px;line-height:.96;letter-spacing:-.035em;font-weight:500}
h1 i{font-style:italic;font-weight:300;color:#C9A36A}
.sub{margin:26px auto 0;max-width:880px;font-size:29px;line-height:1.3;color:#C7C2B6;font-weight:300}
.meta{position:absolute;left:72px;right:72px;bottom:26px;display:flex;justify-content:space-between;align-items:center;font-family:'IBM Plex Sans';font-size:18px;letter-spacing:.22em;text-transform:uppercase;color:#9A958A}
.meta b{color:#F2F0EA;font-weight:500}
.swipe{border:1.5px solid #9A958A;border-radius:999px;padding:8px 18px;color:#F2F0EA}
</style></head><body><div class="s">
<div class="grain"></div>
<div class="paper"><img src="_fp.jpg"></div>
<div class="fold"></div>
<div class="band"><span class="tag">${esc(tag)}</span><h1>${bandH}</h1><p class="sub">${esc(bandSub)}</p></div>
<div class="meta"><span><b>The Next Cigar</b> · thenextcigar.com</span><span class="swipe">Swipe →</span></div>
</div></body></html>`;
fs.writeFileSync(path.join(cwd, '_cover.html'), cover);
p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
await p.goto('file://' + path.join(cwd, '_cover.html')); await p.waitForTimeout(800);
await p.screenshot({ path: outPath });
await b.close();
console.log('wrote', outPath);
