/* Sector Rebound — opt-in Forward Bay layout contract, v1.
 * No walls, pickups, flags, or scoring are modified by this module.
 * Deterministic map-graph planning. All indices refer to actual maze.open cells. */
(function(root){'use strict';
 const VERSION=1;
 const has=(n)=>Number.isSafeInteger(n)&&n>=0;
 function routeDistances(open,start){
  const n=open.length,d=new Int16Array(n).fill(-1),q=[start];
  d[start]=0;
  for(let j=0;j<q.length;j++)for(const k of open[q[j]])
   if(d[k]===-1){d[k]=d[q[j]]+1;q.push(k);}
  return Array.from(d);
 }
 function validGrid(grid){
  if(!grid||!has(grid.cols)||!has(grid.rows)||grid.cols<9||grid.rows<6||
   !Number.isFinite(grid.cell)||grid.cell<70||!Array.isArray(grid.open)||
   grid.open.length!==grid.cols*grid.rows||grid.open.length>600)return false;
  return grid.open.every((entry,i)=>Array.isArray(entry)&&entry.length<=4&&
   new Set(entry).size===entry.length&&entry.every(v=>has(v)&&v<grid.open.length&&grid.open[v].includes(i)&&
    ((Math.abs(v-i)===1&&Math.floor(v/grid.cols)===Math.floor(i/grid.cols))||
     Math.abs(v-i)===grid.cols)));
 }
 function plan(grid,seed){
  if(!validGrid(grid)||!Number.isSafeInteger(seed)||seed<1)return null;
  const {cols,rows,cell,open}=grid;
  const cx=(cols-1)/2,cy=(rows-1)/2;
  const candidates=(side)=>open.flatMap((edges,i)=>{
   const x=i%cols,y=Math.floor(i/cols);
   if(x<1||x>cols-2||y<1||y>rows-2||edges.length<2)return [];
   if(side===0?x>Math.floor(cols*.31):x<Math.ceil(cols*.69)-1)return [];
   return [i];
  });
  const blue=candidates(0),red=candidates(1);
  if(!blue.length||!red.length)return null;
  const centerCells=open.map((v,i)=>i).filter(i=>
   Math.abs(i%cols-cx)<=1&&Math.abs(Math.floor(i/cols)-cy)<=1);
  let best=null;
  for(const a of blue){
   const da=routeDistances(open,a);
   const daCenter=Math.min(...centerCells.map(i=>da[i]));
   for(const b of red){
    if(da[b]<Math.max(5,Math.floor(cols*.65)))continue;
    const db=routeDistances(open,b);
    const dbCenter=Math.min(...centerCells.map(i=>db[i]));
    // Lengthy but balanced corridors; both teams have comparable access to
    // central play. This is a heuristic, NOT a guaranteed mirror-symmetric map.
    const equality=Math.abs(daCenter-dbCenter);
    const rowBalance=Math.abs(Math.floor(a/cols)-Math.floor(b/cols));
    const score=da[b]*4-equality*6-rowBalance*.5+
      (open[a].length+open[b].length)*.4;
    // Deterministic tie-breaking independent of rendering/frame randomness.
    const rank=(Math.imul((seed^a^Math.imul(b,31337))|0,1103515245)>>>0)/4294967296;
    if(!best||score>best.score||(score===best.score&&rank>best.rank))
     best={a,b,score,rank,steps:da[b],centerDifference:equality};
   }
  }
  if(!best)return null;
  function bay(i,team){
   const x=i%cols,y=Math.floor(i/cols);
   const neighbors=open[i].slice().sort((a,b)=>{
    const ax=a%cols,bx=b%cols;
    const ae=team===0?ax:-ax,be=team===0?bx:-bx;
    return be-ae||a-b;
   });
   const locate=k=>({cellIndex:k,x:((k%cols)+.5)*cell,
    y:(Math.floor(k/cols)+.5)*cell});
   return {team,cellIndex:i,x:(x+.5)*cell,y:(y+.5)*cell,
    entrances:neighbors.map(locate),
    spawnSlots:[locate(i),locate(neighbors[0])],
    parking:locate(neighbors[1]),exits:neighbors.length};
  }
  return {version:VERSION,seed,steps:best.steps,centerDifference:best.centerDifference,
   bays:[bay(best.a,0),bay(best.b,1)]};
 }
 root.SectorForwardBays=Object.freeze({VERSION,plan,routeDistances,validGrid});
})(typeof window!=='undefined'?window:globalThis);
