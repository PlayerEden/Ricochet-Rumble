// Sector Rebound M11-A. Optional, bundled local Pixi v8 graphics ONLY on the
// real game's home showroom. Never owns input, nav, game simulation, or saves.
import { Application, Container, Graphics, Sprite, Texture, DisplacementFilter, NoiseFilter } from 'pixi.js';

const BUILD='SR_HYBRID_PIXI_V1',W=620,H=320,FPS=24;
const info=window.__SRHybridMenu={build:BUILD,active:false,frames:0,mounts:0,unmounts:0,backend:'none',reason:'starting'};
const $=id=>document.getElementById(id);
const panel=$('panel'),menu=$('menu');
let app=null,host=null,raf=0,token=0,time=0,prev=0,renderPrev=0,glow=null,visor=null,noise=null,displace=null,map=null;
const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
const isHome=()=>menu&&!menu.classList.contains('hidden')&&!!panel?.querySelector('.home-screen');
const nextHost=()=>isHome()?panel.querySelector('.home-stage [data-hybrid-pixi]'):null;
function showBackendLabel(label){
 const el=panel?.querySelector('.home-stage-signal');
 if(el)el.textContent=label;
}
function destroy(){
 token++;
 if(raf){cancelAnimationFrame(raf);raf=0;}
 if(app){try{app.destroy(true,{children:true});}catch(_){/* fail closed to Canvas */}app=null;}
 if(host)host.replaceChildren();host=null;
 info.active=false;info.backend='none';info.unmounts++;
 glow=null;visor=null;noise=null;displace=null;map=null;prev=0;renderPrev=0;
}
function holoTexture(){
 const c=document.createElement('canvas');c.width=256;c.height=160;
 const x=c.getContext('2d');x.fillStyle='#102b38';x.fillRect(0,0,256,160);
 x.strokeStyle='rgba(116,216,228,.21)';x.lineWidth=1;
 for(let xx=0;xx<256;xx+=16){x.beginPath();x.moveTo(xx,0);x.lineTo(xx,160);x.stroke();}
 for(let yy=0;yy<160;yy+=16){x.beginPath();x.moveTo(0,yy);x.lineTo(256,yy);x.stroke();}
 x.save();x.translate(126,80);x.rotate(-.22);x.lineWidth=5;x.strokeStyle='#b1e9ed';
 x.strokeRect(-60,-29,120,58);x.strokeRect(-40,-18,80,36);
 x.fillStyle='#86e2ea';x.fillRect(0,-5,76,10);x.restore();
 x.fillStyle='#e8ca95';x.font='bold 12px monospace';x.fillText('MBT // LIVE',13,20);
 x.fillStyle='#9cc5d0';x.font='10px monospace';x.fillText('SYSTEMS NOMINAL',13,145);
 return Texture.from(c);
}
function displacementTexture(){
 const c=document.createElement('canvas');c.width=c.height=64;
 const x=c.getContext('2d'),im=x.createImageData(64,64);
 for(let y=0;y<64;y++)for(let xx=0;xx<64;xx++){
  const i=(y*64+xx)*4;
  im.data[i]=128+Math.round(18*Math.sin(y*.32+xx*.04));
  im.data[i+1]=128+Math.round(12*Math.cos(y*.24-xx*.03));
  im.data[i+2]=128;im.data[i+3]=255;
 }
 x.putImageData(im,0,0);return Texture.from(c);
}
function addScene(scene){
 // M11 visual review: no giant diagnostic hologram overlapping the hero.
 const details=new Graphics();
 details.arc(430,153,102,-2.7,-1.05).stroke({color:0x78cfd7,width:1.1,alpha:.19});
 details.arc(430,153,102,.18,1.35).stroke({color:0xd2b37a,width:1.25,alpha:.22});
 details.arc(430,153,125,-2.15,-1.15).stroke({color:0x6da9b5,width:1,alpha:.12});
 details.moveTo(335,235).lineTo(530,235).stroke({color:0x76aeba,width:1,alpha:.18});
 details.moveTo(372,239).lineTo(488,239).stroke({color:0xd4b67f,width:1,alpha:.26});
 details.moveTo(315,225).lineTo(332,225).stroke({color:0x83d6df,width:2,alpha:.28});
 details.moveTo(531,225).lineTo(547,225).stroke({color:0x83d6df,width:2,alpha:.28});
 for(let i=0;i<7;i++){
  const x=320+i*32;
  details.rect(x,244,15,1).fill({color:i%3===0?0xd8bb8d:0x62929f,alpha:.27});
 }
 scene.addChild(details);
 glow=new Graphics().circle(0,0,75).fill({color:0x54bed0,alpha:.035});
 glow.position.set(430,153);scene.addChild(glow);
 // A much smaller GPU-filtered readout sits below the hero silhouette.
 const housing=new Graphics();
 housing.roundRect(507,194,102,61,5).fill({color:0x102b3a,alpha:.55});
 housing.roundRect(507,194,102,61,5).stroke({color:0x81a4b1,width:1,alpha:.32});
 housing.moveTo(516,200).lineTo(547,200).stroke({color:0xdbbe87,width:1,alpha:.48});
 scene.addChild(housing);
 visor=new Sprite(holoTexture());visor.position.set(514,202);visor.width=87;visor.height=45;
 visor.alpha=.43;scene.addChild(visor);
 try{
  map=new Sprite(displacementTexture());
  map.position.set(514,202);map.width=87;map.height=45;map.renderable=false;
  scene.addChild(map);
  displace=new DisplacementFilter({sprite:map,scale:{x:1.0,y:.55}});
  noise=new NoiseFilter({noise:.018,seed:.2});
  visor.filters=[displace,noise];
 }catch(error){info.reason='GPU filter unavailable: '+String(error).slice(0,80);visor.filters=null;}
}
function run(now){
 raf=0;
 if(!app||!host||!host.isConnected||!isHome()||document.hidden){sync();return;}
 const dt=Math.min(.05,Math.max(0,(now-prev)/1000||0));prev=now;
 if(now-renderPrev>=1000/FPS || reduced()){
  renderPrev=now;time+=dt;
  if(glow)glow.alpha=.82+.14*Math.sin(time*1.1);
  if(displace){displace.scale.x=1.1+Math.sin(time*1.8)*.36;displace.scale.y=.5+Math.cos(time*1.2)*.2;}
  if(map)map.position.y=202+Math.sin(time*.9)*.8;
  if(noise)noise.seed=(1+Math.sin(time*.54))*.5;
  app.render();info.frames++;
 }
 if(!reduced())raf=requestAnimationFrame(run);
}
async function attach(node){
 const mine=++token;
 info.reason='initializing';
 let candidate=null;
 try{
  candidate=new Application();
  await candidate.init({width:W,height:H,preference:'webgl',backgroundAlpha:0,antialias:false,resolution:1,autoStart:false});
  if(mine!==token||!node.isConnected||!isHome()){candidate.destroy(true,{children:true});return;}
  if(!/webgl/i.test(String(candidate.renderer.name)))throw Error('WebGL unavailable');
  const scene=new Container();candidate.stage.addChild(scene);addScene(scene);
  candidate.canvas.setAttribute('aria-hidden','true');
  candidate.canvas.style.pointerEvents='none';
  node.appendChild(candidate.canvas);
  app=candidate;host=node;candidate=null;
  info.active=true;info.backend='webgl';info.mounts++;info.reason='running';
  showBackendLabel('PIXI / WEBGL • ACTIVE');
  prev=0;renderPrev=0;raf=requestAnimationFrame(run);
 }catch(e){
  if(candidate)try{candidate.destroy(true,{children:true});}catch(_){}
  if(mine===token){info.active=false;info.backend='canvas';info.reason='Canvas fallback: '+String(e).slice(0,100);showBackendLabel('CANVAS / FALLBACK');}
 }
}
function sync(){
 const node=nextHost();
 if(!node||document.hidden){if(app||host)destroy();return;}
 if(app&&host===node)return;
 if(info.reason==='initializing')return;
 if(app||host)destroy();
 if(node.dataset.hybridPixi==='off'){info.reason='feature disabled';return;}
 attach(node);
}
function initialize(){
 if(!panel||!menu){info.reason='no production menu';return;}
 new MutationObserver(sync).observe(panel,{childList:true});
 new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync,{passive:true});
 window.addEventListener('pagehide',()=>{if(app||host)destroy();});
 info.reason='ready';sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
else initialize();
