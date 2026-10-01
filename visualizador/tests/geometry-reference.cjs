/* Deliberately brute-force reference for the pre-spatial geometry heuristics. */
const G=require('../geometry.js');
const element=e=>String(e??'').trim().replace(/^([A-Za-z])[A-Za-z]*/,(_,first)=>first+String(e??'').trim().slice(1).toLowerCase());
function normaliseBonds(bonds){
 const pairs=[];
 if(Array.isArray(bonds))for(const item of bonds){
  if(Array.isArray(item)&&item.length>=2){const a=Number(item[0]),b=Number(item[1]);if(Number.isInteger(a)&&Number.isInteger(b)&&a!==b)pairs.push([Math.min(a,b),Math.max(a,b)]);}
  else if(item&&Number.isInteger(Number(item.a))&&Number.isInteger(Number(item.b))){const a=Number(item.a),b=Number(item.b);if(a!==b)pairs.push([Math.min(a,b),Math.max(a,b)]);}
 }
 return [...new Map(pairs.map(pair=>[pair.join(':'),pair])).values()];
}
function inferCovalentBonds(elements,coords,options={}){
 const els=elements.map(element),scale=Number.isFinite(options.scale)?options.scale:1.20,min=Number.isFinite(options.minimum)?options.minimum:.35,pairs=[];
 for(let a=0;a<els.length;a++)for(let b=a+1;b<els.length;b++){
  if(G.METALS.has(els[a])||G.METALS.has(els[b]))continue;
  const ra=G.COVALENT_RADII[els[a]],rb=G.COVALENT_RADII[els[b]],d=G.distance(coords[a],coords[b]);
  if(ra&&rb&&d!==null&&d>min&&d<scale*(ra+rb))pairs.push([a,b]);
 }
 return pairs;
}
function hydrogenBonds(elements,coords,options={}){
 const els=elements.map(element),hMax=Number.isFinite(options.hydrogenAcceptorCutoff)?options.hydrogenAcceptorCutoff:2.5,dMax=Number.isFinite(options.donorAcceptorCutoff)?options.donorAcceptorCutoff:3.5,minAngle=Number.isFinite(options.minimumAngle)?options.minimumAngle:150;
 const bonds=Array.isArray(options.bonds)?normaliseBonds(options.bonds):inferCovalentBonds(els,coords,options),neighbors=Array.from({length:els.length},()=>new Set()),results=[];
 for(const [a,b] of normaliseBonds(bonds))if(neighbors[a]&&neighbors[b]){neighbors[a].add(b);neighbors[b].add(a);}
 for(let donor=0;donor<els.length;donor++){
  if(!G.ACCEPTORS.has(els[donor]))continue;
  for(const hydrogen of neighbors[donor]){
   if(els[hydrogen]!=='H')continue;
   for(let acceptor=0;acceptor<els.length;acceptor++){
    if(!G.ACCEPTORS.has(els[acceptor])||acceptor===donor||acceptor===hydrogen)continue;
    if(neighbors[donor].has(acceptor)||neighbors[hydrogen].has(acceptor))continue;
    const hA=G.distance(coords[hydrogen],coords[acceptor]),dA=G.distance(coords[donor],coords[acceptor]),dha=G.angle(coords[donor],coords[hydrogen],coords[acceptor]);
    if(hA===null||dA===null||dha===null)continue;
    if(hA<=hMax&&dA<=dMax&&dha>=minAngle)results.push({donor,hydrogen,acceptor,hydrogenAcceptor:hA,donorAcceptor:dA,angle:dha});
   }
  }
 }
 return results;
}
function coordinationContacts(elements,coords,options={}){
 const els=elements.map(element),cutoff=Math.max(2,Math.min(3.5,Number.isFinite(options.cutoff)?options.cutoff:2.6)),results=[];
 for(let metal=0;metal<els.length;metal++){
  if(!G.METALS.has(els[metal]))continue;
  for(let ligand=0;ligand<els.length;ligand++){
   if(!G.ACCEPTORS.has(els[ligand]))continue;
   const d=G.distance(coords[metal],coords[ligand]);if(d!==null&&d>1e-12&&d<=cutoff)results.push({metal,ligand,distance:d,cutoff});
  }
 }
 return results;
}
function waterBox(count,spacing=3.1){
 const elements=[],coords=[],bonds=[],side=Math.ceil(Math.cbrt(count));
 for(let i=0;i<count;i++){
  const a=elements.length,x=(i%side)*spacing,y=(Math.floor(i/side)%side)*spacing,z=Math.floor(i/(side*side))*spacing;
  elements.push('O','H','H');coords.push([x,y,z],[x+.9572,y,z],[x-.239987,y+.927297,z]);bonds.push([a,a+1],[a,a+2]);
 }
 // More than one metal exercises coordination ordering and spatial selection.
 for(let i=0;i<Math.max(1,Math.floor(count/20));i++){elements.push(i%2?'Na':'Zn');coords.push([(i%side)*spacing+1.5,(Math.floor(i/side)%side)*spacing+1.5,1.5]);}
 return {elements,coords,bonds};
}
module.exports={inferCovalentBonds,hydrogenBonds,coordinationContacts,waterBox};
