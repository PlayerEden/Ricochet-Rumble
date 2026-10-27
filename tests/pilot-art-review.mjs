// Render controlled FIELDGRID SVG pilot prototypes at actual UI sizes.
// This is an art review, not a production icon export or an approved store item.
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright-core';

const root=process.cwd();
const chrome=process.env.CHROME_BIN;
if(!chrome)throw Error('Chrome required for pilot art review');
const icons=[
 ['pilot.st.001','RECRUIT','STARTER'],
 ['pilot.st.002','RELAY','STARTER'],
 ['pilot.pr.001','COLD CELL','PREMIUM CONCEPT']
];
const svg=icons.map(([id])=>fs.readFileSync(path.join(root,'assets/source/pilots',id,id+'.svg'),'utf8'));
for(const source of svg){
 if(!source.includes('viewBox="0 0 512 512"')||source.includes('<text'))throw Error('Unacceptable pilot SVG source');
}
const tiles=icons.map(([id,name,category],i)=>{
 const sizes=[64,48,32].map(n=>'<div class="example"><div class="size" style="width:'+n+'px;height:'+n+'px">'+svg[i]+'</div><span>'+n+'px</span></div>').join('');
 return '<section class="tile"><div class="preview">'+svg[i]+'</div><div class="name">'+name+'</div><div class="category">'+category+'</div><div class="sizes">'+sizes+'</div><div class="id">'+id+'</div></section>';
}).join('');
const html='<!doctype html><html><head><meta charset="utf-8"><style>'+
'*{box-sizing:border-box}body{margin:0;background:#091822;color:#e0eef1;padding:28px;font-family:system-ui,sans-serif}'+
'h1{font:800 21px monospace;letter-spacing:1px;color:#6cc7d6;margin:0 0 12px}.sub{color:#9fbac2;margin:0 0 20px;font:12px monospace}'+
'.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.tile{background:#122c38;border:1px solid #496b76;padding:20px;text-align:center}'+
'.preview{width:240px;height:240px;margin:auto}.tile svg{display:block;width:100%;height:100%}'+
'.name{font:bold 20px monospace;margin:12px 0 4px}.category{font:12px monospace;color:#edbe69;letter-spacing:1px}'+
'.sizes{display:flex;gap:28px;justify-content:center;align-items:center;margin:24px 0}.example{display:flex;flex-direction:column;align-items:center;gap:8px}'+
'.example span,.id,.foot{color:#9fbac2;font:11px monospace}.foot{margin-top:19px}</style></head><body>'+
'<h1>FIELDGRID // PILOT PORTRAIT STYLE LOCK 001</h1>'+
'<p class="sub">THREE EDITABLE VECTOR MASTERS · CONTROLLED LIGHTING / FRAMING · 32 / 48 / 64 PIXEL LEGIBILITY</p>'+
'<div class="cards">'+tiles+'</div>'+
'<p class="foot">STYLE REVIEW ONLY / NOT EQUIPPABLE / NO PRODUCT OR PRICE EXISTS</p></body></html>';
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:1210,height:655},deviceScaleFactor:1});
 await page.setContent(html,{waitUntil:'load'});
 const dir=path.join(root,'qa-screens','art-review');
 fs.mkdirSync(dir,{recursive:true});
 await page.screenshot({path:path.join(dir,'pilot-style-lock-three.png'),animations:'disabled'});
 const dims=await page.locator('.preview').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return [r.width,r.height]}));
 if(dims.some(([w,h])=>w!==240||h!==240))throw Error('Preview geometry mismatch');
 console.log('PASS 3 editable SVG pilot concepts; 64/48/32 actual-size contact sheet');
}finally{await browser.close();}
