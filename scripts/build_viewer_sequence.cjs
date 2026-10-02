/* Assemble an explicitly documented teaching sequence from untouched stage files. */
const fs=require('node:fs'),path=require('node:path');
const R=require('../visualizador/orca-parser.js');

function buildSequence(folder,key,course,{previewLimit=6001}={}){
 if(course.metadata?.clockMode!=='sequence_elapsed')throw new Error('A sequence requires clockMode=sequence_elapsed.');
 if(!Array.isArray(course.sequenceSources)||!course.sequenceSources.length)throw new Error('Missing sequence sources.');
 if(!Number.isInteger(previewLimit)||previewLimit<1)throw new Error('Invalid preview limit.');
 if(new Set(course.sequenceSources.map(source=>source.key)).size!==course.sequenceSources.length)throw new Error('Sequence source keys must be unique.');
 const frames=[],rows=[],files=[],warnings=[],boundaryFrames=new Set();let elements=null,energySegment=0;
 const read=relative=>{const full=path.resolve(folder,relative);if(!full.startsWith(path.resolve(folder)+path.sep))throw new Error('Sequence source outside its result folder.');return fs.readFileSync(full,'utf8');};
 for(const [index,source] of course.sequenceSources.entries()){
  if(!source.key||![source.startFs,source.endFs,source.offsetFs].every(Number.isFinite)||source.endFs<=source.startFs)throw new Error('Invalid sequence source interval.');
  const xyz=R.parseXYZ(read(source.xyz),path.basename(source.xyz)),energy=R.parseEnergyCSV(read(source.energy),path.basename(source.energy));
  if(elements&&JSON.stringify(elements)!==JSON.stringify(xyz.elements))throw new Error('Sequence atom identities differ.');elements=xyz.elements;
  const selected=xyz.frames.filter(frame=>Number.isFinite(frame.time)&&frame.time>=source.startFs-1e-9&&frame.time<=source.endFs+1e-9);
  if(!selected.length)throw new Error(`No XYZ frames for sequence source ${source.key}.`);
  const shifted=selected.map(frame=>({time:frame.time+source.offsetFs,step:null,sourceTime:frame.time,sourceStep:frame.step,sourceKey:source.key,sourceStage:source.label||source.key,coords:frame.coords,segment:index}));
  const previous=frames.at(-1),first=shifted[0];
  if(previous&&first.time<previous.time-1e-9)throw new Error('Overlapping sequence clocks.');
  if(previous&&Math.abs(first.time-previous.time)<=1e-9){
   const maxDifference=Math.max(...first.coords.flatMap((point,atom)=>point.map((value,axis)=>Math.abs(value-previous.coords[atom][axis]))));
   if(maxDifference>1e-7)throw new Error(`Sequence boundary coordinates differ by ${maxDifference} A.`);
   // ORCA's input/XYZ representation can differ below 1e-7 A. Keep the
   // following stage's actual frame so its source clock identifies its energy.
   frames.pop();boundaryFrames.add(frames.length);
  }else if(previous){
   // A normal restart may first dump the next recorded step, rather than
   // repeat its starting geometry. Accept one actual source sampling interval.
   const interval=shifted[1]?.time-first.time;
   if(source.velocityReset||!Number.isFinite(interval)||interval<=0||Math.abs(first.time-previous.time-interval)>1e-7)throw new Error('Sequence stages have a missing boundary interval.');
  }
  boundaryFrames.add(frames.length);for(const frame of shifted)frames.push(frame);boundaryFrames.add(frames.length-1);
  const selectedRows=energy.rows.filter(row=>row.time>=source.startFs-1e-9&&row.time<=source.endFs+1e-9);
  if(!selectedRows.length)throw new Error(`No energy rows for sequence source ${source.key}.`);
  const segments=new Map();for(const row of selectedRows){if(!segments.has(row.segment))segments.set(row.segment,energySegment++);rows.push({...row,time:row.time+source.offsetFs,step:null,sourceTime:row.time,sourceStep:row.step,sourceKey:source.key,sourceStage:source.label||source.key,segment:segments.get(row.segment)});}
  for(const [relative,kind] of [[source.xyz,'xyz'],[source.energy,'energy']])if(!files.some(file=>file.relative===relative))files.push({relative,kind});
  warnings.push(...xyz.warnings,...energy.warnings);
 }
 const stride=Math.ceil(frames.length/previewLimit),retained=frames.filter((frame,index)=>index%stride===0||index===frames.length-1||boundaryFrames.has(index));
 const xyz={kind:'xyz',name:key+' (sequência de etapas)',key,elements,frames:retained,warnings:[]};
 if(stride>1){xyz.previewStride=stride;xyz.originalFrameCount=frames.length;xyz.warnings.push(`Prévia da sequência: 1 a cada ${stride} quadros, mais o último e as fronteiras das etapas. Coordenadas e relógios originais preservados; tempo da sequência = relógio original + deslocamento documentado. Sem interpolação. Os XYZ por etapa mantêm todos os quadros.`);}
 return {xyz,energy:{kind:'energy',name:key+' (energias por etapa)',key,rows,warnings:[],source:'csv',units:{time:'fs',energy:'Eh',temperature:'K'}},files,warnings:[...new Set(warnings)]};
}
module.exports={buildSequence};
