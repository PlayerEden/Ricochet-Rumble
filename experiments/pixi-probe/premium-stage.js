// Premium FIELDGRID showpiece - an isolated experiment, not the live game's UI.
// WebGL GLSL shader is applied only to a small holographic panel; real controls
// stay accessible HTML/CSS. No network assets or production save writes.
import {Container,Graphics,Sprite,Texture,DisplacementFilter,NoiseFilter} from 'pixi.js';
// A GPU displacement map is built locally and reused by Pixi's WebGL shader.
// The transform changes slightly each frame, keeping the source hologram legible.
function makeMap(){
 const c=document.createElement('canvas');c.width=c.height=128;
 const x=c.getContext('2d'),im=x.createImageData(128,128);
 for(let y=0;y<128;y++)for(let px=0;px<128;px++){
  const index=(y*128+px)*4;
  im.data[index]=128+Math.round(24*Math.sin(y*.22+px*.022));
  im.data[index+1]=128+Math.round(17*Math.cos(y*.16+px*.035));
  im.data[index+2]=128;im.data[index+3]=255;
 }
 x.putImageData(im,0,0);return Texture.from(c);
}
const cyan=0x70e4f2,warm=0xe2ba78;
const line=(g,x,y,u,v,c,w=1,a=1)=>g.moveTo(x,y).lineTo(u,v).stroke({color:c,width:w,alpha:a});
function makeHolo(){
 const c=document.createElement('canvas');c.width=512;c.height=296;
 const x=c.getContext('2d');x.fillStyle='#0d3040';x.fillRect(0,0,512,296);
 x.strokeStyle='rgba(90,196,212,.25)';
 for(let k=0;k<512;k+=23){x.beginPath();x.moveTo(k,0);x.lineTo(k,296);x.stroke();}
 for(let k=0;k<296;k+=23){x.beginPath();x.moveTo(0,k);x.lineTo(512,k);x.stroke();}
 x.save();x.translate(260,150);x.rotate(-.27);
 x.lineWidth=8;x.strokeStyle='#8cdde2';x.strokeRect(-100,-43,200,86);
 x.lineWidth=4;x.strokeRect(-64,-28,128,56);x.fillStyle='#9beff1';x.fillRect(8,-9,147,18);
 x.restore();x.font='700 17px monospace';x.fillStyle='#e2f3f2';x.fillText('MBT-07 / FIELD TEST',18,29);
 x.fillStyle='#98becb';x.font='14px monospace';x.fillText('ARMOR 4    MOBILITY 3',18,275);
 return Texture.from(c);
}
export class PremiumStage{
 constructor(app,art){
  this.app=app;this.t=0;this.mode='menu';this.quality='cinematic';
  this.stage=new Container();app.stage.addChild(this.stage);
  const g=new Graphics();g.rect(0,0,960,540).fill(0x0b1a26);
  for(let x=0;x<960;x+=56)line(g,x,0,x,540,0x24414e,1,.3);
  for(let y=0;y<540;y+=40)line(g,0,y,960,y,0x24414e,1,.3);
  for(let i=0;i<8;i++){const x=50+i*120;
   g.rect(x,0,18,540).fill({color:0x1b3440,alpha:.38});
   line(g,x+16,0,x+16,540,0x6ba4b0,2,.25);
  }
  for(let i=0;i<4;i++){
   g.poly([180+i*160,0,210+i*160,0,420+i*150,540,90+i*140,540]).fill({color:0x67c5cc,alpha:.035});
  }
  g.roundRect(105,94,736,366,18).fill({color:0x081521,alpha:.81}).stroke({color:0x577b86,width:2,alpha:.68});
  g.roundRect(145,394,620,24,7).fill(0x233f4c);
  g.roundRect(160,403,592,4,2).fill({color:0x84dce5,alpha:.33});
  for(let i=0;i<5;i++)line(g,165+i*126,98,165+i*126,460,0x688694,1,.23);
  g.ellipse(522,358,210,60).fill({color:0x020b11,alpha:.66});
  g.ellipse(522,358,210,60).stroke({color:warm,width:1,alpha:.46});
  g.ellipse(522,358,174,49).stroke({color:cyan,width:1,alpha:.33});
  this.stage.addChild(g);
  const glow=new Graphics().circle(0,0,155).fill({color:0x4cc3ce,alpha:.07});
  glow.circle(0,0,101).fill({color:0x69e4e7,alpha:.085});
  this.glow=new Container();this.glow.position.set(522,250);this.glow.addChild(glow);this.stage.addChild(this.glow);
  this.hero=new Container();this.hero.position.set(508,253);
  const tank=new Sprite(Texture.from(art['0-tank-0']));tank.anchor.set(.5);tank.scale.set(2.65);tank.rotation=-.22;
  this.hero.addChild(tank);
  this.gun=new Graphics().roundRect(6,-14,148,28,4).fill(0x0f2b3b)
     .roundRect(12,-9,134,18,3).fill(0x73e0ea).rect(138,-6,22,12).fill(0xe6bb81);
  this.gun.rotation=-.1;this.hero.addChild(this.gun);
  this.stage.addChild(this.hero);
  const arc=new Graphics();
  for(const rad of [171,192,217]){
   arc.arc(510,255,rad,-2.4,-1.15).stroke({color:cyan,width:1,alpha:.29});
   arc.arc(510,255,rad,.69,1.54).stroke({color:warm,width:1,alpha:.32});
  }
  this.stage.addChild(arc);
  this.comms=new Container();
  const housing=new Graphics().roundRect(729,66,209,146,9).fill(0x102b39)
   .roundRect(729,66,209,146,9).stroke({color:0x638a98,width:1});
  this.comms.addChild(housing);
  this.holo=new Sprite(makeHolo());this.holo.position.set(741,79);this.holo.width=185;this.holo.height=118;
  this.comms.addChild(this.holo);this.stage.addChild(this.comms);
  this.shader=null;this.shaderOk=false;this.noise=null;
  try{
   this.displacementMap=new Sprite(makeMap());
   this.displacementMap.position.set(741,79);
   this.displacementMap.width=185;this.displacementMap.height=118;
   this.displacementMap.renderable=false;
   this.stage.addChild(this.displacementMap);
   this.shader=new DisplacementFilter({sprite:this.displacementMap,scale:{x:3.2,y:1.6}});
   this.noise=new NoiseFilter({noise:.045,seed:.27});
   this.holo.filters=[this.shader,this.noise];this.shaderOk=true;
  }catch(error){console.warn('GPU hologram filters unavailable',error);this.holo.filters=null;}
 }
 setMode(mode){this.mode=mode;this.stage.visible=mode!=='combat';}
 setQuality(quality){
  this.quality=quality;this.glow.visible=quality==='cinematic';
  if(this.shader)this.shader.enabled=quality==='cinematic';
  if(this.noise)this.noise.enabled=quality==='cinematic';
 }
 update(dt){
  if(!this.stage.visible)return;
  this.t+=Math.min(.055,dt);
  this.hero.rotation=Math.sin(this.t*.7)*.022;
  this.hero.position.y=253+Math.sin(this.t*1.2)*3;
  this.gun.position.x=-2*Math.max(0,Math.sin(this.t));
  this.glow.alpha=.78+.19*Math.sin(this.t*.8);
  if(this.shader?.enabled){
   this.shader.scale.x=3.0+Math.sin(this.t*2.1)*1.15;
   this.shader.scale.y=1.5+Math.cos(this.t*1.3)*.45;
   this.displacementMap.position.y=79+Math.sin(this.t*1.6)*4;
   this.noise.seed=(Math.sin(this.t*.7)+1)*.5;
  }
 }
 get status(){return {view:this.mode,quality:this.quality,shader:!!this.shader?.enabled&&this.shaderOk};}
}
