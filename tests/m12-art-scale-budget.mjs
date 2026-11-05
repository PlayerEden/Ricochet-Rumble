// M12-E4: original SVG source inventory and 24/32/48/96px browser legibility proxy.
// No production code, network service, fonts, account access, or release claim.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright-core';
const read=p=>fs.readFileSync(path.resolve(p),'utf8');
const names=['field','vector','ace','command'];
const modes=['cqc','ffa','tdm','custom','ctf','forward-bays'];
const budget=JSON.parse(read('docs/M12_ASSET_MANIFEST_2026-11-04.json'));
const assets=[
 ...['warm','blueprint'].map(n=>({file:'hangar-'+n+'-empty-v1.svg',category:'hangar-background'})),
 ...modes.map(n=>({file:'mode-'+n+'-study-v1.svg',category:'mode-card-illustration'})),
 ...names.map(n=>({file:'insignia-'+n+'-study-v1.svg',category:'emblem-study'}))
];
const raw={},listed=[];let sum=0;
for(const a of assets){
 const content=read('web/assets/m12/'+a.file),src=read('docs/m12-art-studies/'+a.file);
 const android=read('android/app/src/main/assets/assets/m12/'+a.file);
 assert.equal(content,src,'source study drift '+a.file);
 assert.equal(content,android,'Android/Web art drift '+a.file);
 const category=budget.categories.find(x=>x.id===a.category);
 assert.ok(category,'unbudgeted art '+a.file);
 const bytes=Buffer.byteLength(content);
 assert.ok(bytes>100&&bytes<=category.maxCompressedBytesPerAsset,'art source size budget '+a.file);
 assert.ok(!/<(?:script|text|image|foreignObject|iframe|animate|set|use)\b/i.test(content),
  'No active, text or embedded SVG elements '+a.file);
 assert.ok(!/(?:https?:)?\/\/(?!www\.w3\.org\/2000\/svg)/i.test(content),
  'No external art dependency '+a.file);
 assert.ok(!/@font-face|<style\b|data:/i.test(content),'No hidden stylesheet/data '+a.file);
 sum+=bytes;listed.push({asset:a.file,category:a.category,sourceBytes:bytes});
 if(a.category==='emblem-study')raw[a.file.split('-')[1]]=content;
}
assert.equal(listed.length,12);assert.ok(sum<=1024*1024,'M12 new art source must fit 1 MiB');
const chrome=process.env.CHROME_BIN;
assert.ok(chrome,'Chromium is required for M12 icon-scale audit');
const browser=await chromium.launch({headless:true,executablePath:chrome,
 args:['--no-sandbox','--disable-dev-shm-usage']});
let result;
try{
 const page=await browser.newPage({viewport:{width:680,height:500},deviceScaleFactor:1});
 result=await page.evaluate(async ({sources,order})=>{
  const images={};
  for(const name of order){
   const img=new Image();
   img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(sources[name]);
   await img.decode();
   images[name]=img;
  }
  const sizes=[24,32,48,96],sheet=document.createElement('canvas');
  sheet.width=680;sheet.height=500;
  const art=sheet.getContext('2d',{willReadFrequently:true});
  art.fillStyle='#0b1e2b';art.fillRect(0,0,sheet.width,sheet.height);
  const pixels={};
  for(let i=0;i<order.length;i++){
   const name=order[i],y=5+i*124;pixels[name]={};
   art.fillStyle='#d6e7e6';art.font='bold 13px system-ui,sans-serif';
   art.fillText(name.toUpperCase(),10,y+15);
   for(let col=0;col<sizes.length;col++){
    const size=sizes[col],x=133+col*132;
    art.fillStyle='#a4c5cd';art.font='11px monospace';art.fillText(size+' PX',x,y+15);
    const px=x+(96-size)/2,py=y+19+(96-size)/2;
    art.imageSmoothingEnabled=true;art.drawImage(images[name],px,py,size,size);
    const icon=document.createElement('canvas');icon.width=size;icon.height=size;
    const ctx=icon.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(images[name],0,0,size,size);
    const data=ctx.getImageData(0,0,size,size).data;
    const rgb=[];let contrast=0;
    for(let k=0;k<data.length;k+=4){
     const lum=.2126*data[k]+.7152*data[k+1]+.0722*data[k+2];
     if(lum>105&&data[k+3]>200)contrast++;
     rgb.push(data[k],data[k+1],data[k+2]);
    }
    pixels[name][size]={contrast,rgb};
   }
  }
  const rows=[];
  for(const size of sizes){
   const bright={};
   for(const name of order)bright[name]=pixels[name][size].contrast;
   let lowest=Infinity,pair=[];
   for(let i=0;i<order.length;i++)for(let j=i+1;j<order.length;j++){
    const a=pixels[order[i]][size].rgb,b=pixels[order[j]][size].rgb;
    let difference=0;for(let k=0;k<a.length;k++)difference+=Math.abs(a[k]-b[k]);
    const avg=difference/a.length;
    if(avg<lowest){lowest=avg;pair=[order[i],order[j]];}
   }
   rows.push({cssPixels:size,brightPixelCounts:bright,
     minimumPairwiseRgbDelta:Number(lowest.toFixed(2)),closestPair:pair});
  }
  return {rows,png:sheet.toDataURL('image/png')};
 },{sources:raw,order:names});
}finally{await browser.close();}
for(const row of result.rows){
 assert.ok(row.minimumPairwiseRgbDelta>12,
  'Badge silhouettes too similar at '+row.cssPixels+'px '+JSON.stringify(row));
 for(const [badge,count] of Object.entries(row.brightPixelCounts))
  assert.ok(count>=Math.floor(row.cssPixels**2*.09),
   'Too few bright pixels '+badge+' at '+row.cssPixels+'px: '+count);
}
const out='qa-results/m12/visual';fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(out+'/insignia-scale-sheet-24-32-48-96.png',
 Buffer.from(result.png.slice(result.png.indexOf(',')+1),'base64'));
const audit={
 result:'PASS',scope:'HEADLESS_CHROMIUM_24_32_48_96_CSS_PX_NOT_PHYSICAL_PHONE',
 svgSources:'ORIGINAL_OFFLINE_CODE_AUTHORED',mode:'M12_VISUAL_TEST_ONLY',
 sourceAssetCount:assets.length,totalSvgSourceBytes:sum,sourceBudgetBytes:1024*1024,
 rasterContrastProxyRows:result.rows,assets:listed,
 limits:'Contrast/differentiation are only rasterization proxies; real user legibility, SVG GPU decode, heat, FPS and APK binary size remain unmeasured here.'
};
fs.writeFileSync(out+'/m12-e4-source-and-scale-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log('M12_E4_ART_AUDIT_PASS '+JSON.stringify({
 sources:assets.length,totalSourceBytes:sum,sizes:result.rows.map(x=>x.cssPixels),
 minPairwiseRgbDelta:Math.min(...result.rows.map(x=>x.minimumPairwiseRgbDelta))}));
