/* Real retained datasets: joins, clocks, atom identities and lazy previews. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../orca-parser.js'),root=path.resolve(__dirname,'../..');
const entries=[['10-proton-compartilhado','proton_shared',7,8001,8001,2000],['11-formacao-quelato','chelation',97,3001,12001,3000],...[300,400,500,600].map(t=>['12-gota-protonada',`proton_droplet_${t}k`,97,5001,10001,2500])];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=new Map();
for(const [lesson,key] of entries){const base=`exercicios/${lesson}/resultados/${key}/${key}`;data.set(key,{xyz:R.parseXYZ(read(base+'-traj.xyz'),key+'-traj.xyz'),energy:R.parseEnergyCSV(read(base+'-md-ener.csv'),key+'-md-ener.csv')});}
function bundle(key){const context={window:{AIMD_EXAMPLES:{runs:{}}}};vm.runInNewContext(read(`visualizador/examples/${key}.js`),context);return JSON.parse(JSON.stringify(context.window.AIMD_EXAMPLES.runs[key]));}
const distance=(f,a,b)=>Math.hypot(...f.coords[a].map((v,i)=>v-f.coords[b][i]));

test('new downloaded references retain real complete clocks and bounded lazy previews',()=>{
 for(const [lesson,key,atoms,frames,rows,end] of entries){
  const {xyz,energy}=data.get(key),run=bundle(key);
  assert.equal(xyz.elements.length,atoms,key);assert.equal(xyz.frames.length,frames,key);assert.equal(energy.rows.length,rows,key);
  assert.equal(xyz.frames[0].time,0);assert.equal(xyz.frames.at(-1).time,end);assert.equal(energy.rows.at(-1).time,end);
  assert.equal(energy.rows.at(-1).step,end/.25);assert.ok(xyz.frames.every((f,i)=>!i||f.time>xyz.frames[i-1].time));
  assert.equal(run.xyz.frames[0].time,0);assert.equal(run.xyz.frames.at(-1).time,end);
  const original=new Map(xyz.frames.map(f=>[f.time,f]));
  for(const frame of run.xyz.frames)assert.deepEqual(frame.coords,original.get(frame.time).coords);
  assert.ok(fs.statSync(path.join(root,`visualizador/examples/${key}.js`)).size<8*1024*1024);
  if(key==='proton_shared'){assert.equal(run.xyz.frames.length,8001);assert.equal(run.out.metadata.normal,true);assert.equal(R.validateEnergySources(energy,run.out),null);}
  else{
   assert.equal(run.out,undefined,'No fabricated output for a composite trajectory');assert.equal(run.metadata.timestep,.25);
   assert.equal(run.xyz.originalFrameCount,frames);assert.equal(run.xyz.previewStride,key==='chelation'?3:5);assert.ok(run.xyz.warnings.some(w=>w.includes('sem interpolação')));
   assert.ok(run.energy.rows.some(r=>r.segment>0),'Documented join boundaries break energy charts');
   for(const file of run.files.filter(f=>f.kind==='stage-output')){const out=R.parseOut(read(file.path),file.name);assert.equal(out.metadata.normal,true,file.name);assert.equal(R.validateEnergySources(energy,out),null,file.name);}
  }
 }
});

test('shared-proton fixture keeps H 2 and all 79 midpoint recrossings',()=>{
 const {xyz}=data.get('proton_shared');assert.deepEqual(xyz.elements,['O','O','H','H','H','H','H']);
 const values=xyz.frames.map(f=>distance(f,0,2)-distance(f,1,2));let crossings=0;
 for(let i=1;i<values.length;i++)if(values[i]*values[i-1]<0)crossings++;
 assert.equal(crossings,79);assert.equal(xyz.frames[1].time,.25);
});

test('chelation fixture preserves the assisted interval and persistent same-ligand contacts',()=>{
 const {xyz}=data.get('chelation'),run=bundle('chelation');
 assert.equal(xyz.elements[0],'Zn');for(const id of [61,64])assert.equal(xyz.elements[id],'N');for(const id of [7,25])assert.equal(xyz.elements[id],'O');
 assert.deepEqual(run.metadata.stages.map(s=>[s.startFs,s.endFs]),[[0,1000],[1000,3000]]);
 assert.match(run.metadata.stages[0].label,/Primeiro N assistido/);assert.match(run.metadata.stages[1].label,/Segundo N livre da restrição/);
 const first=xyz.frames.find(f=>distance(f,0,61)<2.6&&distance(f,0,64)<2.6);assert.equal(first.time,1554);
 assert.ok(xyz.frames.filter(f=>f.time>=1554).every(f=>distance(f,0,61)<2.6&&distance(f,0,64)<2.6));
 for(const id of [7,25])assert.ok(distance(xyz.frames.at(-1),0,id)>3);
});

test('four droplet branches share the exact common prefix and remain separate presets',()=>{
 const base=data.get('proton_droplet_300k').xyz.frames.filter(f=>f.time<=500);
 assert.equal(base.length,1001);
 const context={window:{}};vm.runInNewContext(read('visualizador/examples.js'),context);
 for(const temp of [300,400,500,600]){
  const key=`proton_droplet_${temp}k`,{xyz}=data.get(key),run=bundle(key);
  for(let i=0;i<base.length;i++){assert.equal(xyz.frames[i].time,base[i].time);assert.deepEqual(xyz.frames[i].coords,base[i].coords);}
  assert.equal(run.metadata.wallSphere.radius,8.5);
  const preset=context.window.AIMD_EXAMPLES.presets[temp===300?'proton_droplet':key];assert.deepEqual(Array.from(preset.runs),[key]);
  if(temp!==300)assert.deepEqual(run.metadata.stages.map(s=>[s.startFs,s.endFs,s.targetStartK,s.targetEndK]),[[0,500,300,300],[500,1000,300,temp],[1000,2500,temp,temp]]);
 }
});
