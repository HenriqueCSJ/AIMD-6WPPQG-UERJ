/* Actual retained sources: this test runs after the reference builder. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../orca-parser.js'),root=path.resolve(__dirname,'../..'),folder='exercicios/11-formacao-quelato/resultados/chelation_continuous';
const read=file=>fs.readFileSync(path.join(root,file),'utf8'),plain=value=>JSON.parse(JSON.stringify(value));
function prepared(){const context={window:{}};vm.runInNewContext(read('visualizador/examples.js'),context);for(const key of ['chelation_continuous','chelation'])vm.runInNewContext(read(`visualizador/examples/${key}.js`),context);return {store:plain(context.window.AIMD_EXAMPLES),course:JSON.parse(read(`${folder}/curso.json`))};}

test('the 97-atom preview and complete energy series retain source clocks, coordinates and values at every included stage',()=>{
 const {store,course}=prepared(),run=store.runs.chelation_continuous;let selectedFrames=0,selectedRows=0,lastTime=null;
 assert.equal(run.xyz.elements.length,97);assert.equal(run.xyz.frames[0].time,0);assert.equal(run.xyz.frames.at(-1).time,10083);
 assert.equal(run.metadata.clockMode,'sequence_elapsed');assert.match(run.metadata.clockNote,/7083.*velocidades.*reinicializadas/);
 assert.doesNotMatch(JSON.stringify([run.metadata,run.warnings]),/Ã|Â|�/,'Student-facing metadata must remain valid UTF-8 text');
 assert.match(run.warnings.join(" "),/não calor de reação|não é calor de reação/);assert.ok(run.xyz.frames.length<=6001+course.sequenceSources.length*2+1);
 for(const source of course.sequenceSources){
  const original=R.parseXYZ(read(`${folder}/${source.xyz}`),source.xyz),energy=R.parseEnergyCSV(read(`${folder}/${source.energy}`),source.energy);
  assert.deepEqual(run.xyz.elements,original.elements);
  const frames=original.frames.filter(frame=>frame.time>=source.startFs&&frame.time<=source.endFs),rows=energy.rows.filter(row=>row.time>=source.startFs&&row.time<=source.endFs);
  selectedFrames+=frames.length-(lastTime===frames[0].time+source.offsetFs?1:0);lastTime=frames.at(-1).time+source.offsetFs;selectedRows+=rows.length;
  const byTime=new Map(frames.map(frame=>[frame.time,frame])),preview=run.xyz.frames.filter(frame=>frame.sourceKey===source.key);
  assert.ok(preview.length,source.key);for(const frame of preview){const actual=byTime.get(frame.sourceTime);assert.ok(actual);assert.deepEqual(frame.coords,plain(actual.coords));assert.equal(frame.sourceStep,actual.step);assert.equal(frame.time,actual.time+source.offsetFs);assert.equal(frame.step,null);}
  const retained=run.energy.rows.filter(row=>row.sourceKey===source.key);assert.equal(retained.length,rows.length);
  for(let i=0;i<rows.length;i++){const row=retained[i],actual=rows[i];assert.equal(row.sourceTime,actual.time);assert.equal(row.time,actual.time+source.offsetFs);assert.equal(row.sourceStep,actual.step);assert.equal(row.step,null);for(const key of ['kinetic','potential','total','temperature','conserved','orcaDriftK'])assert.equal(row[key],plain(actual[key]));}
  assert.ok(run.files.some(file=>file.path.endsWith(source.xyz)));assert.ok(run.files.some(file=>file.path.endsWith(source.energy)));
  assert.ok(fs.statSync(path.join(root,folder,source.xyz)).size<=R.MAX_FILE_BYTES,'Stage XYZ remains within the upload limit');
 }
 assert.equal(run.xyz.originalFrameCount,selectedFrames);assert.equal(run.xyz.previewStride,Math.ceil(selectedFrames/6001));assert.equal(run.energy.rows.length,selectedRows);
 assert.ok(run.xyz.frames.every((frame,i)=>!i||frame.time>run.xyz.frames[i-1].time));
 const partial=course.sequenceSources.find(source=>source.partialSource);assert.ok(partial);assert.equal(partial.endFs,7083);assert.ok(partial.availableEndFs>partial.endFs);assert.match(run.warnings.join(' '),/interrompido.*9864.*7083/);
 assert.ok(!run.out,'No synthetic whole-sequence output is created');
});

test('velocity-reset boundary preserves both energies and selects the following real geometry; menu distinguishes the current and previous references',()=>{
 const {store,course}=prepared(),run=store.runs.chelation_continuous,boundary=7083;
 const energies=run.energy.rows.filter(row=>row.time===boundary);assert.equal(energies.length,2);assert.deepEqual(energies.map(row=>row.temperature),[284.9,300]);
 assert.notEqual(energies[0].segment,energies[1].segment);assert.ok(Math.abs(energies[1].total-energies[0].total-.006958)<1e-10);assert.equal(energies[0].potential,energies[1].potential);
 const frame=run.xyz.frames.find(frame=>frame.time===boundary);assert.ok(frame);assert.equal(frame.sourceKey,course.sequenceSources.find(source=>source.velocityReset).key);assert.equal(frame.sourceTime,0);
 for(const stage of course.metadata.stages){assert.ok(run.xyz.frames.some(frame=>frame.time===stage.startFs),`Stage start ${stage.startFs}`);assert.ok(run.xyz.frames.some(frame=>frame.time===stage.endFs),`Stage end ${stage.endFs}`);}
 assert.deepEqual(store.presets.chelation.runs,['chelation_continuous']);assert.deepEqual(store.presets.chelation_previous.runs,['chelation']);assert.equal(store.runs.chelation.xyz.elements.length,97);
 const html=read('visualizador/index.html');assert.equal((html.match(/<option value="chelation">/g)||[]).length,1);assert.match(html,/<option value="chelation_previous">/);assert.match(html,/Zn–en: hidratação e quelação/);
 assert.equal(store.version,'20261005-exercise-parity');assert.match(html,/examples\.js\?v=20261005-exercise-parity/);assert.match(html,/app\.js\?v=20261004-large-files1/);assert.match(html,/charts\.js\?v=20261001-sequence1/);
});
