/* Sector Rebound / offline CTF bot objectives v1.
 * Pure and bounded decisions; real pathfinding, movement, combat, death and
 * capture physics continue in game.js and SectorFlags. No bonus stats. */
(function(root){'use strict';
 const ROLES=Object.freeze(['runner','defender','escort']);
 function validActor(a){return a&&Number.isFinite(a.x)&&Number.isFinite(a.y)&&(a.team===0||a.team===1);}
 function roleFor(index,humanCount,actors){
  if(!Number.isInteger(index)||index<0||!Number.isInteger(humanCount)||index<humanCount||!Array.isArray(actors)||!validActor(actors[index]))return 'human';
  const team=actors[index].team;
  const teammateBotIndices=actors.flatMap((a,j)=>j>=humanCount&&validActor(a)&&a.team===team?[j]:[]);
  const rank=teammateBotIndices.indexOf(index);
  if(rank<0)return 'human';
  // With 1 human and 3 bots: CORAL bot 1 = runner, CYAN bot 2 = escort,
  // CORAL bot 3 = defender. Cyan human leads the attack.
  if(team===0)return rank===0?'escort':rank===1?'defender':'runner';
  return rank===0?'runner':rank===1?'defender':'escort';
 }
 function choose({index,humanCount,actors,flags,bays}){
  if(!Array.isArray(actors)||!Array.isArray(flags)||flags.length!==2||
    !Array.isArray(bays)||bays.length!==2||!validActor(actors[index]))return null;
  const actor=actors[index],team=actor.team,role=roleFor(index,humanCount,actors);
  if(role==='human')return null;
  const own=flags[team],enemy=flags[1-team],home=bays[team];
  if(!own||!enemy||!validActor(home))return null;
  const carrier=(flag)=>Number.isInteger(flag.carrier)?actors[flag.carrier]:null;
  const point=(target)=>({x:target.x,y:target.y});
  const decision=(kind,target,requiresPilot=false)=>({role,kind,point:point(target),requiresPilot});
 // Hold slightly off the flag's central approach route. Forward Bays have
 // two verified open entrances; the second faces the reserved parking lane.
 // Remaining inside the bay keeps defense meaningful without occupying the
 // runner's return/capture corridor. Fallback preserves older bay fixtures.
 const guardSite=(bay)=>{
  const parking=bay?.entrances?.[1];
  if(!parking||!Number.isFinite(parking.x)||!Number.isFinite(parking.y))return bay;
  return {x:bay.x+(parking.x-bay.x)*.72,
   y:bay.y+(parking.y-bay.y)*.72};
 };
  const ownCarrier=carrier(own),enemyCarrier=carrier(enemy);
  // Everyone reacts to a stolen own flag; visible objective, not hidden AI vision.
  if(role==='defender'){
   if(ownCarrier&&validActor(ownCarrier)&&ownCarrier.team!==team)return decision('intercept',ownCarrier);
   if(own.droppedFor>0)return decision('return',own,true);
   return decision('defend',guardSite(home));
  }
  if(role==='runner'){
   if(enemy.carrier===index)return decision('capture',home,true);
   if(own.droppedFor>0&&Math.hypot(actor.x-own.x,actor.y-own.y)<160)return decision('return',own,true);
   if(enemy.carrier===null)return decision('steal',enemy,true);
   if(enemyCarrier&&validActor(enemyCarrier)&&enemyCarrier.team===team)return decision('escort',enemyCarrier);
   if(ownCarrier&&validActor(ownCarrier))return decision('intercept',ownCarrier);
   return decision('steal',enemy.home,true);
  }
  // Escort shields the human flag runner; if the enemy is carrying our flag,
  // interrupt the carrier instead of following the human blindly.
  if(ownCarrier&&validActor(ownCarrier)&&ownCarrier.team!==team)return decision('intercept',ownCarrier);
  if(enemyCarrier&&validActor(enemyCarrier)&&enemyCarrier.team===team)return decision('escort',enemyCarrier);
  const teammate=actors.find((a,i)=>i!==index&&validActor(a)&&a.team===team&&a.alive!==false);
  return decision('escort',teammate||home);
 }
 root.SectorCtfAI=Object.freeze({ROLES,roleFor,choose});
})(typeof window!=='undefined'?window:globalThis);
