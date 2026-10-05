/* Retained NVE extensions: complete measured frames and matched short controls. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../orca-parser.js'),root=path.resolve(__dirname,'../..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
function loadStore(){const context={window:{}};vm.runInNewContext(read('visualizador/examples.js'),context);return context;}
const cases=[
 {key:'dimero_xtb2_5ps',short:'dimero_xtb2_2ps',lesson:'1-agua-dft',preset:'water',boundary:2000,elements:['O','H','H','O','H','H']},
 {key:'etanol_nve_5ps',short:'etanol_nve',lesson:'3-xtb2-etanol',preset:'ethanol',boundary:500,elements:['C','C','O','H','H','H','H','H','H']}
];
for(const c of cases)test(`${c.key} keeps 10001 measured frames, original prefix, and the exact restart clock`,()=>{
 const folder=`exercicios/${c.lesson}/resultados`,file=(key,suffix)=>`${folder}/${key}/${key}${suffix}`;
 const parse=key=>({xyz:R.parseXYZ(read(file(key,'-traj.xyz')),key+'-traj.xyz'),energy:R.parseEnergyCSV(read(file(key,'-md-ener.csv')),key+'-md-ener.csv')});
 const short=parse(c.short),long=parse(c.key),context=loadStore();
 vm.runInNewContext(read(`visualizador/examples/${c.key}.js`),context);
 const store=JSON.parse(JSON.stringify(context.window.AIMD_EXAMPLES)),run=store.runs[c.key],course=JSON.parse(read(`${folder}/${c.key}/curso.json`));
 assert.equal(long.xyz.frames.length,10001);assert.equal(long.energy.rows.length,10001);
 assert.equal(short.xyz.frames.length,c.boundary/.5+1);
 assert.deepEqual(long.xyz.elements,c.elements);assert.deepEqual(run.xyz.elements,c.elements);
 assert.equal(run.xyz.frames.length,10001);assert.equal(run.xyz.previewStride,undefined);assert.equal(run.xyz.originalFrameCount,undefined);
 assert.equal(run.out,undefined,'No fabricated combined output');
 for(let i=0;i<10001;i++){
  const frame=long.xyz.frames[i],row=long.energy.rows[i],displayed=run.xyz.frames[i];
  assert.equal(frame.step,i);assert.equal(frame.time,i*.5);assert.equal(row.step,i);assert.equal(row.time,i*.5);
  assert.deepEqual(displayed.coords,frame.coords);assert.equal(displayed.time,frame.time);assert.equal(displayed.step,frame.step);
  if(i<short.xyz.frames.length){assert.deepEqual(frame.coords,short.xyz.frames[i].coords);assert.deepEqual(row,short.energy.rows[i]);}
  const {segment:actualSegment,...actual}=run.energy.rows[i],{segment:sourceSegment,...source}=row;
  // The ordinary JSON transport canonicalizes -0 to 0 without changing its value.
  assert.deepEqual(actual,JSON.parse(JSON.stringify(source)));assert.equal(actualSegment,sourceSegment+(row.time>c.boundary?1:0));
 }
 assert.equal(long.xyz.frames.filter(frame=>frame.time===c.boundary).length,1);
 assert.equal(long.energy.rows.filter(row=>row.time===c.boundary).length,1);
 assert.equal(long.xyz.frames.at(-1).time,5000);
 assert.deepEqual(course.energyBreaksAfterFs,[c.boundary]);
 assert.deepEqual(run.metadata.stages.map(stage=>[stage.startFs,stage.endFs]),[[0,c.boundary],[c.boundary,5000]]);
 assert.equal(run.metadata.timestep,.5);assert.equal(run.metadata.ensemble,'NVE');assert.equal(run.metadata.thermostat,'None');
 const outputs=run.files.filter(file=>file.kind==='stage-output'&&file.name.endsWith('.out'));
 assert.equal(outputs.length,2);for(const output of outputs)assert.equal(R.parseOut(read(output.path),output.name).metadata.normal,true);
 assert.deepEqual(store.presets[c.preset].runs,[c.key]);assert.deepEqual(store.presets[c.preset+'_short'].runs,[c.short]);
});

test('timestep and thermostat controls retain the original short matched ethanol series',()=>{
 const store=JSON.parse(JSON.stringify(loadStore().window.AIMD_EXAMPLES));
 assert.deepEqual(store.presets.timestep_accuracy.runs,['etanol_dt025','etanol_nve','etanol_dt200']);
 assert.deepEqual(store.presets.thermostat_compare.runs,['etanol_nve','etanol_csvr']);
 assert.deepEqual(store.presets.timestep.runs,['etanol_instavel','etanol_corrigido']);
 const html=read('visualizador/index.html');
 for(const c of cases){assert.match(html,new RegExp(`<option value="${c.preset}"[^>]*>[^<]*5 ps<\\/option>`));assert.match(html,new RegExp(`<option\\b[^>]*value="${c.preset}_short"`));}
});
