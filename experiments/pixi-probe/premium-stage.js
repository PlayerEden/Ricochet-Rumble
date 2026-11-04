// Premium FIELDGRID showpiece - an isolated experiment, not the live game's UI.
// WebGL GLSL shader is applied only to a small holographic panel; real controls
// stay accessible HTML/CSS. No network assets or production save writes.
import {Container,Graphics,Sprite,Texture,Filter,GlProgram} from 'pixi.js';
const VERTEX=[
'in vec2 aPosition;','out vec2 vTextureCoord;',
'uniform vec4 uInputSize;','uniform vec4 uOutputFrame;','uniform vec4 uOutputTexture;',
'void main(void){','vec2 p=aPosition*uOutputFrame.zw+uOutputFrame.xy;',
'p.x=p.x*(2.0/uOutputTexture.x)-1.0;',
'p.y=p.y*(2.0*uOutputTexture.z/uOutputTexture.y)-uOutputTexture.z;',
'gl_Position=vec4(p,0.0,1.0);',
'vTextureCoord=aPosition*(uOutputFrame.zw*uInputSize.zw);','}'
].join('\n');
const FRAGMENT=[
'in vec2 vTextureCoord;','out vec4 finalColor;','uniform sampler2D uTexture;',
'uniform vec4 uInputSize;','uniform float uTime;','uniform float uStrength;',
'void main(void){','vec2 uv=vTextureCoord;',
'float wave=sin(uv.y*56.0+uTime*2.4)*sin(uv.y*16.0-uTime*1.5);',
'uv.x+=wave*0.0024*uStrength;','vec4 c=texture(uTexture,uv);',
'float scan=0.86+0.14*sin(uv.y*uInputSize.y*0.47+uTime*7.5);',
'float band=smoothstep(0.93,1.0,sin(uv.y*8.0-uTime*0.85));',
'c.rgb*=mix(1.0,scan,uStrength);',
'c.rgb+=vec3(0.00,0.065,0.08)*band*uStrength*c.a;',
'finalColor=c;','}'
].join('\n');
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
  this.shader=null;this.shaderOk=false;
  try{
   this.shader=new Filter({glProgram:GlProgram.from({vertex:VERTEX,fragment:FRAGMENT}),
    resources:{fxUniforms:{uTime:{value:0,type:'f32'},uStrength:{value:1,type:'f32'}}}});
   this.holo.filters=[this.shader];this.shaderOk=true;
  }catch(error){console.warn('Premium GLSL hologram disabled',error);}
 }
 setMode(mode){this.mode=mode;this.stage.visible=mode!=='combat';}
 setQuality(quality){
  this.quality=quality;this.glow.visible=quality==='cinematic';
  if(this.shader)this.shader.enabled=quality==='cinematic';
 }
 update(dt){
  if(!this.stage.visible)return;
  this.t+=Math.min(.055,dt);
  this.hero.rotation=Math.sin(this.t*.7)*.022;
  this.hero.position.y=253+Math.sin(this.t*1.2)*3;
  this.gun.position.x=-2*Math.max(0,Math.sin(this.t));
  this.glow.alpha=.78+.19*Math.sin(this.t*.8);
  if(this.shader?.enabled)this.shader.resources.fxUniforms.uniforms.uTime=this.t;
 }
 get status(){return {view:this.mode,quality:this.quality,shader:!!this.shader?.enabled&&this.shaderOk};}
}
