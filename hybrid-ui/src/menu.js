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
function lightSweepTexture(){
 // A quiet environmental sheen instead of a second fake tank drawing.
 // The existing Canvas tank remains the only vehicle artwork on home.
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;
 const ctx=canvas.getContext('2d');
 const wash=ctx.createLinearGradient(0,0,256,0);
 wash.addColorStop(0,'rgba(98,201,217,0)');
 wash.addColorStop(.35,'rgba(115,213,222,.14)');
 wash.addColorStop(.52,'rgba(184,233,225,.35)');
 wash.addColorStop(.76,'rgba(113,193,204,.10)');
 wash.addColorStop(1,'rgba(98,201,217,0)');
 ctx.fillStyle=wash;ctx.fillRect(0,22,256,20);
 ctx.fillStyle='rgba(223,189,128,.22)';ctx.fillRect(53,43,92,2);
 ctx.fillStyle='rgba(119,206,217,.25)';ctx.fillRect(102,18,76,1);
 return Texture.from(canvas);
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
 // Pixi is the atmosphere. Canvas is the authentic hero vehicle.
 // No small "tank diagram" or clutter in either lower-right corner.
 const structures=new Graphics();
 structures.poly([315,32,350,32,482,306,449,306])
  .fill({color:0x82d5dc,alpha:.012});
 structures.poly([500,0,521,0,597,320,575,320])
  .fill({color:0xe1bc88,alpha:.013});
 structures.arc(428,153,107,-2.40,-.85).stroke({color:0x74c9d5,width:1.15,alpha:.13});
 structures.arc(428,153,107,.40,1.73).stroke({color:0xe6c289,width:1.1,alpha:.13});
 structures.ellipse(430,249,153,27).stroke({color:0x7fc7cd,width:1,alpha:.14});
 structures.moveTo(322,270).lineTo(384,270).stroke({color:0x78ccd3,width:1,alpha:.13});
 structures.moveTo(482,270).lineTo(528,270).stroke({color:0xe3bd83,width:1,alpha:.17});
 scene.addChild(structures);
 glow=new Graphics().ellipse(0,0,135,58).fill({color:0x66c9d7,alpha:.037});
 glow.position.set(428,170);scene.addChild(glow);
 visor=new Sprite(lightSweepTexture());
 visor.position.set(317,221);visor.width=228;visor.height=57;visor.alpha=.34;
 scene.addChild(visor);
 try{
  map=new Sprite(displacementTexture());
  map.position.set(317,221);map.width=228;map.height=57;map.renderable=false;
  scene.addChild(map);
  displace=new DisplacementFilter({sprite:map,scale:{x:1.1,y:.4}});
  noise=new NoiseFilter({noise:.014,seed:.31});
  visor.filters=[displace,noise];
 }catch(error){
  info.reason='GPU ambient filters unavailable: '+String(error).slice(0,80);
  visor.filters=null;
 }
}
function run(now){
 raf=0;
 if(!app||!host||!host.isConnected||!isHome()||document.hidden){sync();return;}
 const dt=Math.min(.05,Math.max(0,(now-prev)/1000||0));prev=now;
 if(now-renderPrev>=1000/FPS || reduced()){
  renderPrev=now;time+=dt;
  if(glow)glow.alpha=.82+.14*Math.sin(time*1.1);
  if(displace){displace.scale.x=1.0+Math.sin(time*.85)*.25;displace.scale.y=.4+Math.cos(time*.65)*.1;}
  if(map)map.position.y=221+Math.sin(time*.48)*.75;
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
