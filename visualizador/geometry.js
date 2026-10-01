/* Small, dependency-free geometry routines shared by the trajectory viewer and tests. */
(function(root, factory){
  'use strict';
  if(typeof module==='object' && module.exports)module.exports=factory();
  else root.Geometry=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const ACCEPTORS=new Set(['N','O']);
  const METALS=new Set(['Li','Na','K','Rb','Cs','Mg','Ca','Sr','Ba','Al','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ag','Cd','Hg']);
  const COVALENT_RADII={H:.31,B:.84,C:.76,N:.71,O:.66,F:.57,P:1.07,S:1.05,Cl:1.02,Br:1.20,I:1.39};
  const finitePoint=p=>Array.isArray(p)&&p.length>=3&&p.slice(0,3).every(Number.isFinite);
  const point=p=>({x:Number(p?.x??p?.[0]),y:Number(p?.y??p?.[1]),z:Number(p?.z??p?.[2])});
  const vector=(a,b)=>[b.x-a.x,b.y-a.y,b.z-a.z];
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=v=>Math.hypot(v[0],v[1],v[2]);
  const unit=v=>{const n=norm(v);return n>1e-12?v.map(x=>x/n):null;};
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const element=e=>String(e??'').trim().replace(/^([A-Za-z])[A-Za-z]*/,(_,first)=>first+String(e??'').trim().slice(1).toLowerCase());

  const validPoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z);
  const pointsFor=(elements,coords)=>Array.from({length:elements.length},(_,i)=>point(coords[i]));
  const pointDistance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);

  /* Broad-phase neighbor search only: the original distance/angle comparisons
     below remain authoritative. Candidate indices are sorted to retain the
     original donor/hydrogen/acceptor and atom-pair iteration order. */
  function spatialNeighbors(points,indices,radius){
    const valid=indices.filter(i=>validPoint(points[i]));
    // Tiny sets do not benefit from hashing. Unbounded/extreme coordinates use
    // the exact scan, avoiding unsafe integer cells or enormous query loops.
    if(valid.length<32||!(radius>0)||!Number.isFinite(radius))return p=>validPoint(p)?valid:[];
    const cellSize=radius,cells=new Map(),key=(x,y,z)=>x+','+y+','+z;
    for(const i of valid){
      const p=points[i],cell=[Math.floor(p.x/cellSize),Math.floor(p.y/cellSize),Math.floor(p.z/cellSize)];
      if(!cell.every(value=>Number.isSafeInteger(value)&&Math.abs(value)<2**48))return p=>validPoint(p)?valid:[];
      const name=key(...cell),bucket=cells.get(name);if(bucket)bucket.push(i);else cells.set(name,[i]);
    }
    return p=>{
      if(!validPoint(p))return [];
      const ranges=[];
      for(const value of [p.x,p.y,p.z]){
        // Pad the query bounds conservatively for floating-point cancellation
        // and division at exact cutoff/cell boundaries, then apply exact tests.
        const margin=8*Number.EPSILON*Math.max(Math.abs(value),radius);
        const lo=Math.floor((value-radius-margin)/cellSize),hi=Math.floor((value+radius+margin)/cellSize);
        if(!Number.isSafeInteger(lo)||!Number.isSafeInteger(hi)||hi-lo>4)return valid;
        ranges.push([lo,hi]);
      }
      const found=[];
      for(let x=ranges[0][0];x<=ranges[0][1];x++)for(let y=ranges[1][0];y<=ranges[1][1];y++)for(let z=ranges[2][0];z<=ranges[2][1];z++){
        const bucket=cells.get(key(x,y,z));if(bucket)for(const index of bucket)found.push(index);
      }
      return found.sort((a,b)=>a-b);
    };
  }

  function distance(a,b){
    const pa=point(a),pb=point(b);
    if(!finitePoint([pa.x,pa.y,pa.z])||!finitePoint([pb.x,pb.y,pb.z]))return null;
    return Math.hypot(pa.x-pb.x,pa.y-pb.y,pa.z-pb.z);
  }

  /* The angle ABC, in degrees. A zero-length arm is undefined. */
  function angle(a,b,c){
    const pa=point(a),pb=point(b),pc=point(c),u=vector(pb,pa),v=vector(pb,pc),nu=norm(u),nv=norm(v);
    if(!Number.isFinite(nu)||!Number.isFinite(nv)||nu<1e-12||nv<1e-12)return null;
    return Math.acos(clamp(dot(u,v)/(nu*nv),-1,1))*180/Math.PI;
  }

  /* Signed torsion A-B-C-D in (-180, 180]. Collinear/degenerate planes are undefined. */
  function dihedral(a,b,c,d){
    const pa=point(a),pb=point(b),pc=point(c),pd=point(d),b0=vector(pb,pa),b1=vector(pb,pc),b2=vector(pc,pd),b1u=unit(b1);
    if(!b1u||norm(cross(b0,b1))<1e-12||norm(cross(b1,b2))<1e-12)return null;
    // Project the terminal bonds onto the plane normal to B->C. This is the
    // conventional signed A-B-C-D torsion, with values in (-180, 180].
    const v=b0.map((value,index)=>value-dot(b0,b1u)*b1u[index]),w=b2.map((value,index)=>value-dot(b2,b1u)*b1u[index]);
    let result=Math.atan2(dot(cross(b1u,v),w),dot(v,w))*180/Math.PI;
    if(result<=-180)result=180;
    return result;
  }

  function normaliseBonds(bonds){
    const pairs=[];
    if(Array.isArray(bonds)){
      for(const item of bonds){
        if(Array.isArray(item)&&item.length>=2){const a=Number(item[0]),b=Number(item[1]);if(Number.isInteger(a)&&Number.isInteger(b)&&a!==b)pairs.push([Math.min(a,b),Math.max(a,b)]);}
        else if(item&&Number.isInteger(Number(item.a))&&Number.isInteger(Number(item.b))){const a=Number(item.a),b=Number(item.b);if(a!==b)pairs.push([Math.min(a,b),Math.max(a,b)]);}
      }
    }
    return [...new Map(pairs.map(pair=>[pair.join(':').toString(),pair])).values()];
  }

  function inferCovalentBonds(elements,coords,options={}){
    const els=elements.map(element),points=pointsFor(els,coords);
    return covalentBonds(els,points,options);
  }

  function covalentBonds(els,points,options){
    const scale=Number.isFinite(options.scale)?options.scale:1.20,min=Number.isFinite(options.minimum)?options.minimum:.35,pairs=[],indices=[],radii=els.map(e=>COVALENT_RADII[e]);
    let maxRadius=0,positiveRadii=true;
    for(let i=0;i<els.length;i++){
      // The viewer never infers a metal bond from XYZ. This graph is only for
      // finding a D-H arm and excluding a covalent D-A pair in the H-bond heuristic.
      if(METALS.has(els[i])||!radii[i]||!validPoint(points[i]))continue;
      indices.push(i);
      if(typeof radii[i]!=='number'||!Number.isFinite(radii[i])||radii[i]<=0)positiveRadii=false;
      else maxRadius=Math.max(maxRadius,radii[i]);
    }
    if(positiveRadii&&scale<=0)return pairs;
    const nearby=spatialNeighbors(points,indices,positiveRadii?scale*(2*maxRadius):NaN);
    for(const a of indices)for(const b of nearby(points[a])){
      if(b<=a)continue;
      const d=pointDistance(points[a],points[b]);
      if(d>min&&d<scale*(radii[a]+radii[b]))pairs.push([a,b]);
    }
    return pairs;
  }

  function adjacency(size,bonds){
    const result=Array.from({length:size},()=>new Set());
    for(const [a,b] of normaliseBonds(bonds))if(result[a]&&result[b]){result[a].add(b);result[b].add(a);}
    return result;
  }

  function hydrogenBonds(elements,coords,options={}){
    const els=elements.map(element),points=pointsFor(els,coords),hMax=Number.isFinite(options.hydrogenAcceptorCutoff)?options.hydrogenAcceptorCutoff:2.5,dMax=Number.isFinite(options.donorAcceptorCutoff)?options.donorAcceptorCutoff:3.5,minAngle=Number.isFinite(options.minimumAngle)?options.minimumAngle:150,bonds=Array.isArray(options.bonds)?normaliseBonds(options.bonds):covalentBonds(els,points,options),neighbors=adjacency(els.length,bonds),results=[];
    if(hMax<0||dMax<0)return results;
    const acceptors=[];for(let i=0;i<els.length;i++)if(ACCEPTORS.has(els[i]))acceptors.push(i);
    const nearby=spatialNeighbors(points,acceptors,hMax);
    for(let donor=0;donor<els.length;donor++){
      if(!ACCEPTORS.has(els[donor])||!validPoint(points[donor]))continue;
      for(const hydrogen of neighbors[donor]){
        if(els[hydrogen]!=='H'||!validPoint(points[hydrogen]))continue;
        for(const acceptor of nearby(points[hydrogen])){
          if(acceptor===donor||acceptor===hydrogen)continue;
          if(neighbors[donor].has(acceptor)||neighbors[hydrogen].has(acceptor))continue;
          const hA=pointDistance(points[hydrogen],points[acceptor]);if(hA>hMax)continue;
          const dA=pointDistance(points[donor],points[acceptor]);if(dA>dMax)continue;
          const dha=angle(points[donor],points[hydrogen],points[acceptor]);
          if(dha!==null&&dha>=minAngle)results.push({donor,hydrogen,acceptor,hydrogenAcceptor:hA,donorAcceptor:dA,angle:dha});
        }
      }
    }
    return results;
  }

  function coordinationContacts(elements,coords,options={}){
    const els=elements.map(element),points=pointsFor(els,coords),cutoff=clamp(Number.isFinite(options.cutoff)?options.cutoff:2.6,2,3.5),results=[],acceptors=[];
    for(let i=0;i<els.length;i++)if(ACCEPTORS.has(els[i]))acceptors.push(i);
    const nearby=spatialNeighbors(points,acceptors,cutoff);
    for(let metal=0;metal<els.length;metal++){
      if(!METALS.has(els[metal])||!validPoint(points[metal]))continue;
      for(const ligand of nearby(points[metal])){
        const d=pointDistance(points[metal],points[ligand]);if(d>1e-12&&d<=cutoff)results.push({metal,ligand,distance:d,cutoff});
      }
    }
    return results;
  }

  function isEthanolSkeleton(elements,coords){
    const els=elements.map(element);if(els.length!==9)return false;
    const counts=els.reduce((map,e)=>(map[e]=(map[e]||0)+1,map),{});
    if(counts.C!==2||counts.O!==1||counts.H!==6||Object.keys(counts).some(e=>!['C','O','H'].includes(e)))return false;
    const cc=distance(coords[0],coords[1]),co=distance(coords[1],coords[2]),oh=distance(coords[2],coords[8]),cco=angle(coords[0],coords[1],coords[2]);
    return els[0]==='C'&&els[1]==='C'&&els[2]==='O'&&els[8]==='H'&&cc!==null&&co!==null&&oh!==null&&cco!==null&&cc>=1.0&&cc<=1.7&&co>=1.0&&co<=1.7&&oh>=.6&&oh<=1.3&&cco>=90&&cco<=150;
  }

  return {ACCEPTORS,METALS,COVALENT_RADII,distance,angle,dihedral,inferCovalentBonds,hydrogenBonds,coordinationContacts,isEthanolSkeleton};
});
