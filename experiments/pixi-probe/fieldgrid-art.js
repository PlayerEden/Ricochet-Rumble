// Faithful FIELDGRID *visual* stress scene. Palette, terrain tile rules, wall bevels
// and unit art are taken from Sector Rebound's mainline render() and drawTop*.
// Static decor is cached in both backends to isolate dynamic GPU sprite benefits.
// This is not production physics, networking, procedural layout or AI.
import {drawTopTank,drawTopMech,drawTopPilot} from './production-art.js';

const UNIT_SIZE=120,HALF=UNIT_SIZE/2,PHASES=4;
export const TEAM_COLORS=['#60dfff','#ffb06e'];
export const WORLD_WIDTH=1440,WORLD_HEIGHT=936;
export const WALLS=[
 {x:360,y:100,w:19,h:238},{x:360,y:445,w:19,h:240},
 {x:702,y:32,w:19,h:171},{x:702,y:288,w:19,h:210},{x:702,y:602,w:19,h:270},
 {x:1056,y:110,w:19,h:227},{x:1056,y:436,w:19,h:300},
 {x:142,y:338,w:200,h:19},{x:400,y:510,w:255,h:19},
 {x:758,y:236,w:228,h:19},{x:784,y:688,w:222,h:19},
 {x:1095,y:380,w:220,h:19},{x:1095,y:760,w:228,h:19},
 {x:235,y:744,w:166,h:19},{x:490,y:155,w:160,h:19}
];
// The unit images are rendered once using the actual production Canvas paths.
export function buildUnitArt(){
 const result={};
 for(let team=0;team<2;team++){
  for(const type of ['tank','mech','pilot']){
   for(let phase=0;phase<PHASES;phase++){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=UNIT_SIZE;
    const c=canvas.getContext('2d');
    c.translate(HALF,HALF);
    const p=team===0?TEAM_COLORS[0]:TEAM_COLORS[1];
    if(type==='tank')drawTopTank(c,p,false,phase*2.3,phase*2.3,0,.5);
    if(type==='mech')drawTopMech(c,p,false,Math.sin(phase*Math.PI/2)*2.8,0,Math.cos(phase*Math.PI/2)*.6);
    if(type==='pilot')drawTopPilot(c,p,false,Math.sin(phase*Math.PI/2)*2.5,0,Math.cos(phase*Math.PI/2)*.5,'fieldgrid.standard',true);
    result[team+'-'+type+'-'+phase]=canvas;
   }
  }
 }
 return result;
}
// Exact FIELDGRID floor palette and tile detailing from live Sector Rebound.
// Wider static world allows camera movement under the approved relative zoom.
export function createFieldgridFloor(seed=451){
 const c=document.createElement('canvas'),w=WORLD_WIDTH,h=WORLD_HEIGHT;
 c.width=w;c.height=h;
 const g=c.getContext('2d',{alpha:false});
 g.fillStyle='#101f2b';g.fillRect(0,0,w,h);
 const tile=132;
 for(let gy=0;gy<Math.ceil(h/tile);gy++)for(let gx=0;gx<Math.ceil(w/tile);gx++){
  const x=gx*tile,y=gy*tile,hash=((gx*19+gy*37+seed%23)%11+11)%11;
  g.fillStyle=hash%3===0?'#132632':hash%3===1?'#142733':'#162a36';g.fillRect(x+1,y+1,tile-2,tile-2);
  g.strokeStyle='#29424e';g.lineWidth=1;g.strokeRect(x+2,y+2,tile-4,tile-4);
  g.fillStyle='#29424e';const edge=tile-16;
  g.fillRect(x+12,y+12,3,3);g.fillRect(x+12,y+edge,3,3);g.fillRect(x+edge,y+12,3,3);g.fillRect(x+edge,y+edge,3,3);
  if(hash===0||hash===6){g.fillStyle='#264654';g.fillRect(x+15,y+16,36,4);g.fillRect(x+15,y+22,20,2);}
  if(hash===4){g.fillStyle='#33454b';g.fillRect(x+tile-32,y+tile-24,20,8);g.fillStyle='#91773d';g.fillRect(x+tile-32,y+tile-26,8,2);}
  if(hash===8){g.fillStyle='#314c54';g.font='800 13px system-ui';g.textAlign='left';g.fillText('FG',x+17,y+tile-18);}
  if(hash===2){g.fillStyle='#564f3b';for(let stripe=0;stripe<4;stripe++)g.fillRect(x+65+stripe*12,y+tile-22,7,3);}
  if(hash===10){g.strokeStyle='#345261';g.lineWidth=2;g.strokeRect(x+tile-40,y+tile-40,24,24);}
 }
 g.fillStyle='#253f4e';
 g.fillRect(0,0,w,15);g.fillRect(0,h-15,w,15);g.fillRect(0,0,15,h);g.fillRect(w-15,0,15,h);
 g.fillStyle='#66a7b3';g.fillRect(0,0,w,3);g.fillRect(0,h-3,w,3);g.fillRect(0,0,3,h);g.fillRect(w-3,0,3,h);
 for(const wall of WALLS){
  const {x,y,w:ww,h:hh}=wall;
  g.fillStyle='#071620';g.fillRect(x+5,y+7,ww,hh);
  g.fillStyle='#293f4d';g.fillRect(x,y,ww,hh);
  g.fillStyle='#456574';g.fillRect(x+2,y+2,ww-4,Math.max(3,hh-5));
  g.fillStyle='#304c5b';g.fillRect(x+4,y+5,ww-8,Math.max(2,hh-10));
  g.fillStyle='#83a7b1';if(ww>hh)g.fillRect(x+7,y+3,Math.max(0,ww-14),2);
  else g.fillRect(x+3,y+7,2,Math.max(0,hh-14));
  g.fillStyle='#9b8250';if(ww>hh){if(ww>70)g.fillRect(x+ww/2-7,y+4,14,3);}
  else if(hh>70)g.fillRect(x+4,y+hh/2-7,3,14);
  g.fillStyle='#162a36';
  if(ww>hh)for(let xx=x+25;xx<x+ww-10;xx+=65)g.fillRect(xx,y+7,3,4);
  else for(let yy=y+25;yy<y+hh-10;yy+=65)g.fillRect(x+7,yy,4,3);
 }
 // Realistic landmark decor, behind actors, shared across renderer implementations.
 for(const pickup of [{x:190,y:155,team:0},{x:1270,y:215,team:1},{x:620,y:740,team:0}]){
  g.fillStyle=pickup.team===0?'#173945':'#48332f';g.fillRect(pickup.x-27,pickup.y-27,54,54);
  g.strokeStyle=TEAM_COLORS[pickup.team];g.lineWidth=2;g.strokeRect(pickup.x-27,pickup.y-27,54,54);
  g.fillStyle=TEAM_COLORS[pickup.team];g.font='900 19px monospace';g.textAlign='center';g.fillText('+',pickup.x,pickup.y+7);
 }
 return c;
}
export function makeBulletCanvas(){
 const c=document.createElement('canvas');c.width=c.height=40;
 const g=c.getContext('2d');g.translate(20,20);g.shadowColor='#9bddeb';g.shadowBlur=10;
 g.fillStyle='#f6ffff';g.beginPath();g.arc(0,0,6,0,Math.PI*2);g.fill();
 return c;
}
