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
    const els=elements.map(element),scale=Number.isFinite(options.scale)?options.scale:1.20,min=Number.isFinite(options.minimum)?options.minimum:.35,pairs=[];
    for(let a=0;a<els.length;a++)for(let b=a+1;b<els.length;b++){
      // The viewer never infers a metal bond from XYZ. This graph is only for
      // finding a D-H arm and excluding a covalent D-A pair in the H-bond heuristic.
      if(METALS.has(els[a])||METALS.has(els[b]))continue;
      const ra=COVALENT_RADII[els[a]],rb=COVALENT_RADII[els[b]],d=distance(coords[a],coords[b]);
      if(ra&&rb&&d!==null&&d>min&&d<scale*(ra+rb))pairs.push([a,b]);
    }
    return pairs;
  }

  function adjacency(size,bonds){
    const result=Array.from({length:size},()=>new Set());
    for(const [a,b] of normaliseBonds(bonds))if(result[a]&&result[b]){result[a].add(b);result[b].add(a);}
    return result;
  }

  function hydrogenBonds(elements,coords,options={}){
    const els=elements.map(element),hMax=Number.isFinite(options.hydrogenAcceptorCutoff)?options.hydrogenAcceptorCutoff:2.5,dMax=Number.isFinite(options.donorAcceptorCutoff)?options.donorAcceptorCutoff:3.5,minAngle=Number.isFinite(options.minimumAngle)?options.minimumAngle:150,bonds=Array.isArray(options.bonds)?normaliseBonds(options.bonds):inferCovalentBonds(els,coords,options),neighbors=adjacency(els.length,bonds),results=[];
    for(let donor=0;donor<els.length;donor++){
      if(!ACCEPTORS.has(els[donor]))continue;
      for(const hydrogen of neighbors[donor]){
        if(els[hydrogen]!=='H')continue;
        for(let acceptor=0;acceptor<els.length;acceptor++){
          if(!ACCEPTORS.has(els[acceptor])||acceptor===donor||acceptor===hydrogen)continue;
          if(neighbors[donor].has(acceptor)||neighbors[hydrogen].has(acceptor))continue;
          const hA=distance(coords[hydrogen],coords[acceptor]),dA=distance(coords[donor],coords[acceptor]),dha=angle(coords[donor],coords[hydrogen],coords[acceptor]);
          if(hA===null||dA===null||dha===null)continue;
          if(hA<=hMax&&dA<=dMax&&dha>=minAngle)results.push({donor,hydrogen,acceptor,hydrogenAcceptor:hA,donorAcceptor:dA,angle:dha});
        }
      }
    }
    return results;
  }

  function coordinationContacts(elements,coords,options={}){
    const els=elements.map(element),cutoff=clamp(Number.isFinite(options.cutoff)?options.cutoff:2.6,2,3.5),results=[];
    for(let metal=0;metal<els.length;metal++){
      if(!METALS.has(els[metal]))continue;
      for(let ligand=0;ligand<els.length;ligand++){
        if(!ACCEPTORS.has(els[ligand]))continue;
        const d=distance(coords[metal],coords[ligand]);if(d!==null&&d>1e-12&&d<=cutoff)results.push({metal,ligand,distance:d,cutoff});
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
