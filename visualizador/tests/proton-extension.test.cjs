/* Physical restart continuity and full-resolution lazy delivery of retained H5O2+. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../orca-parser.js'),root=path.resolve(__dirname,'../..');
const folder='exercicios/10-proton-compartilhado/resultados';
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const parse=key=>({
 xyz:R.parseXYZ(read(`${folder}/${key}/${key}-traj.xyz`),`${key}-traj.xyz`),
 energy:R.parseEnergyCSV(read(`${folder}/${key}/${key}-md-ener.csv`),`${key}-md-ener.csv`)
});
function store(){
 const context={window:{}};vm.runInNewContext(read('visualizador/examples.js'),context);
 for(const key of ['proton_shared','proton_shared_10ps'])vm.runInNewContext(read(`visualizador/examples/${key}.js`),context);
 return JSON.parse(JSON.stringify(context.window.AIMD_EXAMPLES));
}

test('long proton trajectory preserves the exact 2 ps prefix and every quarter-fs frame through 10 ps',()=>{
 const short=parse('proton_shared'),long=parse('proton_shared_10ps');
 assert.deepEqual(long.xyz.elements,['O','O','H','H','H','H','H']);
 assert.deepEqual(long.xyz.elements,short.xyz.elements);
 assert.equal(short.xyz.frames.length,8001);assert.equal(short.energy.rows.length,8001);
 assert.equal(long.xyz.frames.length,40001);assert.equal(long.energy.rows.length,40001);
 for(let i=0;i<long.xyz.frames.length;i++){
  const frame=long.xyz.frames[i],row=long.energy.rows[i];
  assert.equal(frame.time,i*.25,`XYZ clock at frame ${i}`);assert.equal(frame.step,i,`XYZ step at frame ${i}`);
  assert.equal(row.step,i,`energy step at row ${i}`);
  assert.ok(Math.abs(row.time-frame.time)<=.050001,`original CSV rounding at step ${i}`);
  if(i<short.xyz.frames.length){
   assert.deepEqual(frame.coords,short.xyz.frames[i].coords,`unaltered prefix coordinates at ${i}`);
   assert.deepEqual(row,short.energy.rows[i],`unaltered prefix energy at ${i}`);
  }
 }
 assert.equal(long.xyz.frames.filter(frame=>frame.time===2000).length,1);
 assert.equal(long.energy.rows.filter(row=>row.step===8000).length,1);
 assert.equal(long.xyz.frames[8001].time,2000.25);
 assert.equal(long.xyz.frames.at(-1).time,10000);assert.equal(long.energy.rows.at(-1).time,10000);
});

test('long proton reference keeps all 40001 measured frames and separates the restart energy baseline',()=>{
 const original=parse('proton_shared_10ps'),examples=store(),run=examples.runs.proton_shared_10ps;
 const course=JSON.parse(read(`${folder}/proton_shared_10ps/curso.json`));
 assert.equal(run.out,undefined,'No fabricated combined ORCA output');
 assert.equal(run.xyz.frames.length,40001);assert.equal(run.energy.rows.length,40001);
 assert.equal(run.xyz.previewStride,undefined);assert.equal(run.xyz.originalFrameCount,undefined);
 assert.deepEqual(run.xyz.elements,original.xyz.elements);
 for(let i=0;i<run.xyz.frames.length;i++){
  const frame=run.xyz.frames[i],raw=original.xyz.frames[i],row=run.energy.rows[i],source=original.energy.rows[i];
  assert.equal(frame.time,raw.time);assert.equal(frame.step,raw.step);assert.deepEqual(frame.coords,raw.coords);
  const {segment:actualSegment,...actualValues}=row,{segment:originalSegment,...originalValues}=source;
  // JSON represents both signed zeros as 0; all measured numeric values remain equal.
  assert.deepEqual(actualValues,JSON.parse(JSON.stringify(originalValues)),`measured energy unchanged at step ${i}`);
  assert.equal(actualSegment,originalSegment+(source.time>2000?1:0));
 }
 assert.deepEqual(course.energyBreaksAfterFs,[2000]);
 assert.deepEqual(run.metadata.stages.map(stage=>[stage.startFs,stage.endFs]),[[0,2000],[2000,10000]]);
 assert.equal(run.metadata.timestep,.25);assert.equal(run.metadata.thermostat,'CSVR');assert.equal(run.metadata.targetTemperature,300);
 const outputs=run.files.filter(file=>file.kind==='stage-output'&&file.name.endsWith('.out'));
 assert.equal(outputs.length,2,'Both original ORCA stage outputs remain accessible');
 for(const file of outputs){assert.ok(fs.existsSync(path.join(root,file.path)));assert.equal(R.parseOut(read(file.path),file.name).metadata.normal,true,file.path);}
 assert.equal(run.energy.rows[8000].segment,0);assert.equal(run.energy.rows[8001].segment,1);
});

test('main and short proton presets remain distinct and the manifest and browser cache versions agree',()=>{
 const examples=store();
 assert.deepEqual(examples.presets.proton_shared.runs,['proton_shared_10ps']);
 assert.deepEqual(examples.presets.proton_shared_short.runs,['proton_shared']);
 assert.equal(examples.runs.proton_shared.xyz.frames.length,8001);
 assert.equal(examples.runs.proton_shared.xyz.frames.at(-1).time,2000);
 assert.equal(examples.version,'20261006-playback2');
 assert.match(examples.sources.proton_shared_10ps.src,/\?v=20261006-playback2$/);
 const html=read('visualizador/index.html');
 assert.match(html,/<option value="proton_shared">[^<]*10 ps<\/option>/);
 assert.doesNotMatch(html,/<option\b[^>]*value="proton_shared_short"/);
 assert.match(html,/examples\.js\?v=20261006-playback2/);assert.match(html,/app\.js\?v=20261006-native-cadence1/);
 assert.match(html,/geometry\.js\?v=20261006-native-cadence1/);assert.match(html,/vendor\/3Dmol-min\.js\?v=20261001-performance1/);
});
