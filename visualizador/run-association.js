/* Associate uploaded ORCA files by declared outputs and recorded physical data. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./orca-parser.js'),require('./charts.js').timeIndex);
  else root.RunAssociation=factory(root.OrcaReader,root.TrajectoryTime.index);
})(globalThis,function(R,timeIndex){
  'use strict';
  const basename=name=>String(name||'').split(/[\\/]/).pop();
  const energy=run=>run.energy?.rows?.length?run.energy:run.out;
  function sameValue(a,b){
    if(a===b)return true;
    if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;
    if(Array.isArray(a)||Array.isArray(b))return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((value,i)=>sameValue(value,b[i]));
    const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(key=>Object.hasOwn(b,key)&&sameValue(a[key],b[key]));
  }
  function sameData(a,b){return a?.kind===b?.kind&&['rows','frames','elements','columns','metadata','cellStates'].every(key=>sameValue(a?.[key],b?.[key]));}
  // A dynamic sphere is reconstructed independently for each printed density,
  // assuming conserved cell mass. This is not a direct radius dump or an
  // interpolation; uncertainty from the printed initial density is retained.
  function cellIndex(run){
    let rows=energy(run)?.rows||[];
    const metadata=run?.metadata||run?.out?.metadata||{};
    if(metadata.continuousCellRuns>1){
      // ORCA repeats the boundary row with empty cell columns at the start
      // of the next Run. Keep its measured predecessor only when executed
      // wall states have proved continuity. Conflicting measurements remain
      // ambiguous, and missing samples elsewhere remain missing.
      const key=row=>JSON.stringify([row.time,row.step,row.sourceKey??null,row.sourceStep??null]);
      const measured=new Set(rows.filter(row=>row.cellDensity>0).map(key));
      rows=rows.filter(row=>!(row.cellDensity===null&&row.averagePressure===null&&measured.has(key(row))));
    }
    return timeIndex(rows,()=>true,['averagePressure','cellDensity']);
  }
  function cellState(run,frame,index){
    const metadata=run?.metadata||run?.out?.metadata||{};
    if(metadata.cellProgramUnsupported)return {status:'unsupported',sphere:null};
    if(!metadata.dynamicCell)return metadata.wallSphere?{status:'fixed',sphere:metadata.wallSphere,targetPressure:metadata.initialWallInfo?.targetPressure??null}:null;
    if(!frame||!Number.isFinite(frame.time))return null;
    const initial=metadata.initialWallInfo,missing={status:'missing',sphere:null,targetPressure:initial?.targetPressure??null};
    if(!initial?.sphere||!(initial.density>0))return missing;
    const state=(index||cellIndex(run)).exact(frame.time,frame);
    if(state&&((Number.isFinite(frame.step)&&Number.isFinite(state.step)&&frame.step!==state.step)||(frame.sourceKey&&frame.sourceKey!==state.sourceKey)||(Number.isFinite(frame.sourceStep)&&Number.isFinite(state.sourceStep)&&frame.sourceStep!==state.sourceStep)))return missing;
    const isInitial=Number.isFinite(initial.time)&&Math.abs(frame.time-initial.time)<1e-7&&(!Number.isFinite(frame.step)||!Number.isFinite(initial.step)||frame.step===initial.step)&&!frame.sourceKey;
    if(!state)return missing;
    const density=state?.cellDensity;
    if(!(density>0))return isInitial?{status:'initial',sphere:initial.sphere,density:initial.density,volume:initial.volume,averagePressure:state?.averagePressure??null,targetPressure:initial.targetPressure,time:initial.time,step:initial.step}:missing;
    const radius=initial.sphere.radius*Math.cbrt(initial.density/density);
    if(!Number.isFinite(radius)||radius<=0)return missing;
    return {status:'reconstructed',sphere:{center:initial.sphere.center,radius},density,volume:4*Math.PI*radius**3/3,averagePressure:state.averagePressure,targetPressure:initial.targetPressure,time:state.time,step:state.step};
  }
  function potential(frame){
    const match=String(frame.comment||'').match(/\bE_Pot\s*=\s*([^\s,]+)\s*([^,]*)/i);
    if(!match)return null;
    const value=R.numeric(match[1]),unit=match[2].trim();if(value===null)return null;
    if(/^(?:Hartree\b|Eh\b|a\.u\.(?:\s|$))/i.test(unit))return value;
    if(/^kJ\s*(?:\/\s*mol|mol\s*(?:\^?-1|⁻¹))/i.test(unit))return value/R.HARTREE_TO_KJMOL;
    return null;
  }
  function prepare(run){
    const data=energy(run),rows=data?.rows||[];
    return {run,rows,index:timeIndex(rows,()=>true,['potential','kinetic','total','temperature']),declared:run.out?.metadata?.trajectoryFiles||[]};
  }
  function check(xyzRun,dataRun,prepared=prepare(dataRun)){
    if(!xyzRun?.xyz||!prepared.rows.length)return {compatible:false,automatic:false,reason:'Sem trajetória ou série de energia.'};
    const declared=prepared.declared.some(name=>basename(name)===basename(xyzRun.xyz.name)),times=new Set();
    let compared=0,conflicts=0,timed=0,timeMatches=0;
    for(const frame of xyzRun.xyz.frames){
      if(!Number.isFinite(frame.time))continue;timed++;
      const row=prepared.index.exact(frame.time,frame);if(!row||(Number.isFinite(frame.step)&&Number.isFinite(row.step)&&frame.step!==row.step))continue;timeMatches++;
      const value=potential(frame);if(value===null||!Number.isFinite(row.potential))continue;
      compared++;times.add(`${frame.step}:${frame.time}`);
      // Include six-decimal CSV rounding. Legacy ORCA kJ/mol comments use a
      // conversion constant differing by about 5e-8 relatively from ours;
      // allow that unit-conversion precision only for kJ/mol source comments.
      const tolerance=2e-6+(/\bE_Pot\s*=\s*[^\s,]+\s*kJ\b/i.test(frame.comment||'')?Math.abs(value)*1e-7:0);
      if(Math.abs(value-row.potential)>tolerance)conflicts++;
    }
    if(conflicts)return {compatible:false,automatic:false,declared,compared,conflicts,reason:'As energias potenciais do XYZ e da série são diferentes.'};
    if(timed&&!timeMatches)return {compatible:false,automatic:false,declared,compared,conflicts,reason:'Não há passos e tempos correspondentes entre o XYZ e a série.'};
    return {compatible:true,automatic:(declared&&(!timed||timeMatches>0))||times.size>=3,declared,compared,conflicts,timeMatches,reason:declared?'Trajetória indicada no .out.':times.size>=3?'Passos, tempos e energias potenciais conferidos.':'Associação a confirmar.'};
  }
  function checkColvars(run){
    const xyz=run.xyz,cv=run.colvars,definitions=(run.out?.metadata||run.metadata)?.colvars||[];
    const unconfirmed={compatible:true,automatic:false,reason:'Associação das Colvars a confirmar.'};
    if(!xyz||!cv?.rows?.length||!definitions.length)return unconfirmed;
    const ids=new Set(cv.columns.map(column=>column.id)),defs=definitions.filter(def=>ids.has(def.id));
    if(!defs.length)return unconfirmed;
    if(defs.some(def=>![def.a,def.b].every(atom=>Number.isInteger(atom)&&atom>=0&&atom<xyz.elements.length)))return {compatible:false,automatic:false,reason:'As definições das Colvars indicam átomos ausentes no XYZ.'};
    const index=timeIndex(xyz.frames),times=new Set();let compared=0,conflicts=0,timeMatches=0;
    for(const row of cv.rows){
      const frame=index.exact(row.time,row);if(!frame)continue;timeMatches++;
      let recorded=false;
      for(const def of defs){
        const value=row.values[def.id];if(!Number.isFinite(value))continue;
        const a=frame.coords[def.a],b=frame.coords[def.b],distance=Math.hypot(...a.map((v,i)=>v-b[i]));
        if(!Number.isFinite(distance))continue;compared++;recorded=true;
        // Coordinate and Colvars dumps have independent printed precision.
        if(Math.abs(value-distance)>1e-4)conflicts++;
      }
      if(recorded)times.add(frame.time);
    }
    if(conflicts)return {compatible:false,automatic:false,compared,conflicts,reason:'As distâncias das Colvars e das coordenadas do XYZ são diferentes.'};
    if(!timeMatches&&xyz.frames.some(frame=>Number.isFinite(frame.time)))return {compatible:false,automatic:false,compared,conflicts,reason:'Não há tempos únicos correspondentes entre as Colvars e o XYZ.'};
    return {compatible:true,automatic:times.size>=3,compared,conflicts,timeMatches,reason:times.size>=3?'Tempos, definições e distâncias das Colvars conferidos.':unconfirmed.reason};
  }
  function validateRun(run){
    const issue=R.validateEnergySources(run.energy,run.out);if(issue)return issue;
    if(run.energy?.rows?.length&&run.out?.rows?.length){const evidence=energyEvidence(run.energy,run.out);if(!evidence.compatible)return evidence.reason;}
    if(run.xyz&&energy(run)?.rows?.length){const evidence=check(run,run);if(!evidence.compatible)return evidence.reason;}
    const colvars=checkColvars(run);return colvars.compatible?null:colvars.reason;
  }
  function combined(target,source){
    const run={...target};
    for(const slot of ['xyz','out','energy','colvars']){
      if(target[slot]&&source[slot]&&!sameData(target[slot],source[slot]))return null;
      if(!run[slot])run[slot]=source[slot];
    }
    return run;
  }
  function energyEvidence(csv,out){
    const issue=R.validateEnergySources(csv,out);if(issue)return {compatible:false,automatic:false,reason:issue};
    const index=timeIndex(csv.rows,()=>true,['potential','kinetic','total','temperature']),times=new Set();
    for(const row of out.rows){
      const other=index.exact(row.time,row);if(!other||(Number.isFinite(row.step)&&Number.isFinite(other.step)&&row.step!==other.step))continue;
      // The index can match a rounded CSV clock by step. Check those values
      // too: the parser's exact-clock validation alone cannot see them.
      if(['potential','kinetic','total','temperature','averagePressure','cellDensity'].some(key=>Number.isFinite(row[key])&&Number.isFinite(other[key])&&Math.abs(row[key]-other[key])>(key==='temperature'||key==='averagePressure'?.02:key==='cellDensity'?5.1e-5:2e-6)))return {compatible:false,automatic:false,reason:'O .out e o CSV apresentam valores diferentes nos passos correspondentes.'};
      if(['potential','kinetic','total'].some(key=>Number.isFinite(row[key])&&Number.isFinite(other[key])))times.add(`${row.step}:${row.time}`);
    }
    return {compatible:true,automatic:times.size>=3,compared:times.size,reason:'Passos, tempos e energias do .out e do CSV conferidos.'};
  }
  function uniqueMatch(matches){
    // A participant must have one candidate, regardless of its source/target
    // role. Return one pair so callers can validate the next phase after merge.
    return matches.filter(match=>[match.source,match.target].every(run=>matches.filter(other=>other.source===run||other.target===run).length===1)).slice(0,1);
  }
  function find(runs){
    const uploads=runs.filter(run=>!run.reference),matches=[];
    // Reunite the complementary energy sources first. Otherwise one CSV and
    // its own output falsely look like two competing calculations for an XYZ.
    for(const target of uploads.filter(run=>run.energy?.rows?.length&&!run.out))for(const source of uploads.filter(run=>run.out?.rows?.length)){
      const merged=combined(target,source);if(!merged||validateRun(merged))continue;
      const evidence=energyEvidence(target.energy,source.out);if(evidence.automatic)matches.push({source,target,evidence});
    }
    const energyMatch=uniqueMatch(matches);if(energyMatch.length)return energyMatch;
    matches.length=0;
    const sources=uploads.filter(run=>run.xyz&&!energy(run)?.rows?.length),targets=uploads.filter(run=>!run.xyz&&energy(run)?.rows?.length).map(prepare);
    for(const source of sources)for(const target of targets){
      const merged=combined(target.run,source);if(!merged||validateRun(merged))continue;
      const evidence=check(source,target.run,target);if(evidence.automatic)matches.push({source,target:target.run,evidence});
    }
    const trajectoryMatch=uniqueMatch(matches);if(trajectoryMatch.length)return trajectoryMatch;
    matches.length=0;
    for(const target of uploads.filter(run=>run.xyz&&!run.colvars))for(const source of uploads.filter(run=>run.colvars&&!run.xyz)){
      const merged=combined(target,source);if(!merged||validateRun(merged))continue;
      const evidence=checkColvars(merged);if(evidence.automatic)matches.push({source,target,evidence});
    }
    return uniqueMatch(matches);
  }
  return {check,find,potential,sameData,validateRun,cellState,cellIndex};
});
