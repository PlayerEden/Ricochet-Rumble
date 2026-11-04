// A *design direction*, not a one-to-one replacement for production unit art.
// Layered rigging showcases what Pixi scene graphs allow: independently rotating
// hull/turret, recoil, visible tread/leg cycles, team glows, damage and engine core.
// All geometry is retained, with no per-frame Graphics regeneration.
import { Container, Graphics } from 'pixi.js';

const PALETTE=[
 {team:0x66dbf2,edge:0xb5f2ff,shadow:0x072b39,body:0x284856,armor:0x406d7b},
 {team:0xf8a777,edge:0xffd9b4,shadow:0x462721,body:0x594238,armor:0x806153}
];
const draw=(g,fn)=>{fn(g);return g;};
const plate=(g,x,y,w,h,fill,edge,rad=2)=>{
 g.roundRect(x,y,w,h,rad).fill(fill).stroke({color:edge,width:1});
};
function chassis(type,p){
 const body=new Container(),legs=[],treads=[],hull=new Graphics(),detail=new Graphics();
 if(type==='tank'){
  for(const y of [-18,13]){
   const tr=new Container();tr.position.y=y;
   const base=new Graphics();plate(base,-30,-1,60,9,0x172c36,0x8b9fa2,2);tr.addChild(base);
   const slats=new Graphics();
   for(let x=-27;x<=25;x+=8)slats.rect(x,0,3,8).fill(0x607a81);
   tr.addChild(slats);body.addChild(tr);treads.push(slats);
  }
  plate(hull,-24,-14,50,28,p.body,p.edge,4);
  plate(hull,-18,-10,35,20,p.armor,0x101f2b,2);
  hull.rect(-19,-11,4,22).fill(p.team);
  hull.rect(-14,10,12,3).fill(0x17232a);
  hull.rect(12,-8,8,16).fill(p.shadow);
  for(const y of [-12,11]){
   for(const x of [-21,19])hull.circle(x,y,1.7).fill(0xa7b9b7);
  }
  detail.rect(-8,-8,14,3).fill(p.edge);
  detail.rect(-9,8,19,2).fill(0x94adb8);
 }else if(type==='mech'){
  for(const y of [-19,13]){
   const leg=new Graphics();
   plate(leg,-13,-1,27,9,0x223b4a,p.edge,2);
   plate(leg,-7,0,17,8,p.armor,0x1d2f39,1);
   leg.position.y=y;body.addChild(leg);legs.push(leg);
  }
  for(const x of [-23,16]){
   const arm=new Graphics();plate(arm,x,-14,10,28,0x1b3341,p.team,2);body.addChild(arm);
  }
  plate(hull,-18,-18,36,36,p.body,p.edge,3);
  plate(hull,-12,-14,26,28,p.armor,0x172d38,2);
  hull.rect(-8,-9,17,3).fill(p.edge);
  hull.circle(-3,1,5).fill(p.team);
  hull.rect(-14,12,7,4).fill(0x273542);
 }else{
  // Upright biped silhouette viewed from above, not the old prone/crawling pose.
  for(const y of [-12,8]){
   const leg=new Graphics();plate(leg,-16,-2,23,7,p.body,p.edge,2);
   leg.position.y=y;body.addChild(leg);legs.push(leg);
  }
  for(const y of [-12,9]){
   const arm=new Graphics();plate(arm,-8,y,19,7,p.armor,0x182a35,2);body.addChild(arm);
  }
  plate(hull,-12,-10,25,22,0x223b4b,p.edge,4);
  plate(hull,-8,-7,18,16,p.armor,0x152f3b,2);
  detail.circle(-1,0,7).fill(0x0a2937).stroke({color:p.edge,width:1.7});
  detail.rect(1,-4,8,7).fill(p.team);
 }
 body.addChild(hull,detail);
 return {body,legs,treads};
}
function turret(type,p){
 const parent=new Container(),barrel=new Container(),ring=new Graphics(),pieces=new Graphics();
 if(type==='tank'){
  ring.circle(0,0,12).fill(0x142a37).stroke({color:p.edge,width:2});
  ring.circle(0,0,8).fill(p.armor);
  plate(pieces,0,-4,39,8,p.team,0x142a31,1);
  pieces.rect(32,-3,8,6).fill(p.edge);
  pieces.rect(0,1,27,1.5).fill(0xc1f1eb);
 }else if(type==='mech'){
  ring.circle(-1,0,10).fill(0x1b2e3a).stroke({color:p.edge,width:1.5});
  for(const y of [-9,5]){
   plate(pieces,2,y,27,6,p.armor,p.team,1);
   pieces.rect(26,y+1,7,4).fill(p.edge);
  }
 }else{
  ring.circle(0,0,6).fill(0x142b38).stroke({color:p.team,width:1});
  plate(pieces,0,-2,24,5,0x253844,p.edge,1);
  pieces.rect(21,-1,7,3).fill(p.team);
 }
 barrel.addChild(pieces);parent.addChild(ring,barrel);
 return {turret:parent,barrel};
}
function makeRig(type,p){
 const root=new Container(),ground=new Graphics(),glow=new Graphics();
 ground.ellipse(2,8,type==='tank'?36:25,type==='tank'?25:22).fill({color:0x00060b,alpha:.33});
 glow.ellipse(0,0,type==='pilot'?15:26,type==='pilot'?14:24)
   .stroke({color:p.team,width:2,alpha:.5});
 root.addChild(ground,glow);
 const {body,legs,treads}=chassis(type,p),{turret:top,barrel}=turret(type,p);
 root.addChild(body,top);
 const damage=new Graphics();
 damage.rect(-15,-11,30,3).fill(p.edge);
 damage.rect(6,-6,3,20).fill(p.team);
 damage.alpha=0;root.addChild(damage);
 const engine=new Graphics().circle(-20,0,4).fill(p.team);
 engine.alpha=.36;body.addChild(engine);
 return {root,body,top,barrel,legs,treads,glow,damage,engine};
}
export class PixiArtShowcase {
 constructor(world){
  this.container=new Container();
  this.container.label='Art/animation concept; not game physics';
  world.addChild(this.container);
  this.rigs=[];
  this.enabled=false;
  for(let i=0;i<21;i++){
   const p=PALETTE[i===2?0:1],type=i===0?'mech':i===1?'tank':i===2?'tank':['tank','mech','pilot'][i%3];
   const kit=makeRig(type,p);
   kit.root.visible=false;
   this.container.addChild(kit.root);
   this.rigs.push({kit,type,team:i===2?0:1});
  }
 }
 setEnabled(on){this.enabled=!!on;this.container.visible=this.enabled;}
 render(units,time){
  if(!this.enabled)return;
  for(let i=0;i<this.rigs.length;i++){
   const e=this.rigs[i],u=units[i],v=e.kit;
   if(!u){v.root.visible=false;continue;}
   if(e.type!==u.type||e.team!==u.team){
    v.root.destroy({children:true});
    const rebuilt=makeRig(u.type,PALETTE[u.team]);
    e.kit=rebuilt;e.type=u.type;e.team=u.team;
    this.container.addChild(rebuilt.root);
   }
   const r=e.kit;
   r.root.visible=true;r.root.position.set(u.x,u.y);
   r.root.alpha=i<2?.58:1;
   r.body.rotation=u.dir;
   r.top.rotation=u.a;
   r.barrel.position.x=-(u.recoil||0)*8;
   const moving=u.engineSpeed||0;
   const stride=time*(moving>10?10:1)+i*.81;
   for(let j=0;j<r.treads.length;j++)r.treads[j].position.x=Math.sin(stride+j*Math.PI)*1.4;
   for(let j=0;j<r.legs.length;j++){
    r.legs[j].position.x=Math.sin(stride+j*Math.PI)*Math.min(3.2,moving*.04);
   }
   r.engine.alpha=.25+Math.min(.5,moving*.002)+.10*Math.sin(time*6+i);
   r.glow.alpha=.22+.12*Math.sin(time*2+i*.5);
   r.damage.alpha=u.hp<=1?.50+.2*Math.sin(time*9):Math.max(0,u.hitFlash||0)*.9;
   r.body.position.y=.25*Math.sin(time*10+i);
  }
 }
 get active(){return this.enabled?this.rigs.filter(x=>x.kit.root.visible).length:0;}
}
