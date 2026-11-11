// node render_overlays.js <source.html> <css> <outdir>
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const [src,css,out]=process.argv.slice(2);const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
await p.goto('file://'+path.resolve(src),{waitUntil:'networkidle'});
await p.addStyleTag({content:fs.readFileSync(css,'utf8')});await p.evaluate(()=>document.fonts.ready);
const s=await p.$$('.slide');for(let i=0;i<s.length;i++){await s[i].screenshot({path:path.join(out,`ov-${String(i+1).padStart(2,'0')}.png`),omitBackground:true});}
console.log(s.length,'overlays');await b.close()})()
