/* Exercise links must reach retained datasets without duplicating the course menu. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../orca-parser.js'),root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const context={window:{}};vm.runInNewContext(read('visualizador/examples.js'),context);
const store=context.window.AIMD_EXAMPLES;
const bundle=key=>{vm.runInNewContext(read(`visualizador/examples/${key}.js`),context);return JSON.parse(JSON.stringify(store.runs[key]));};
const normalized=text=>text.replace(/\r\n/g,'\n').trim();

test('exercise links resolve retained data while the main menu stays focused',()=>{
 const html=read('visualizador/index.html'),select=html.match(/<select id="example-select">([\s\S]*?)<\/select>/)[1];
 const options=[...select.matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(options).size,options.length,'No duplicate menu choices');
 const directOnly=['water_nve','water_csvr','solvator_two','water_short','ethanol_short','proton_shared_short','chelation_previous'];
 assert.deepEqual([...options,...directOnly].sort(),Object.keys(store.presets).sort());
 const main=select.match(/<optgroup label="Durante a aula · cinco blocos">([\s\S]*?)<\/optgroup>/)[1];
 assert.deepEqual([...main.matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]),['water_single','water_thermostat','water','ethanol','timestep','thermostat','solvator','complex','chelation','proton_shared']);
 assert.equal((select.match(/<optgroup /g)||[]).length,2);
 for(const key of directOnly)assert.ok(!options.includes(key),key+' is linked from its exercise, not duplicated in the menu');
 for(const [name,preset] of Object.entries(store.presets))for(const key of preset.runs){
  assert.ok(store.sources[key],`${name}: missing manifest source ${key}`);
  const run=bundle(key);assert.ok(run.xyz?.frames.length,`${name}: no geometry`);
  for(const file of run.files)assert.ok(fs.existsSync(path.join(root,file.path)),`${name}: ${file.path}`);
 }
 for(const entry of fs.readdirSync(path.join(root,'exercicios'),{withFileTypes:true}).filter(e=>e.isDirectory())){
  for(const name of ['README.md','apoio.md','hidratacao.md']){
   const relative=`exercicios/${entry.name}/${name}`;if(!fs.existsSync(path.join(root,relative)))continue;
   for(const match of read(relative).matchAll(/\]\(([^)]+)\)/g)){
    const target=match[1];if(/^(https?:|mailto:|#)/.test(target))continue;
    const [file]=target.split(/[?#]/);assert.ok(fs.existsSync(path.resolve(root,'exercicios',entry.name,file)),`${relative}: ${target}`);
    const preset=target.match(/[?&]exemplo=([^&#]+)/)?.[1];if(preset)assert.ok(store.presets[preset],`${relative}: missing ${preset}`);
   }
  }
 }
});

test('water comparison contains both exact 500 fs inputs and all measured frames/rows',()=>{
 assert.deepEqual(Array.from(store.presets.water_thermostat.runs),['agua_xtb2_nve','agua_xtb2_csvr']);
 const runs=[];
 for(const [suffix,ensemble] of [['nve','NVE'],['csvr','NVT']]){
  const key=`agua_xtb2_${suffix}`,base=`exercicios/1-agua-dft/resultados/${key}/${key}`,run=bundle(key);
  assert.equal(normalized(read(base+'.inp')),normalized(read(`exercicios/1-agua-dft/inputs/${key}.inp`)));
  const xyz=R.parseXYZ(read(base+'-traj.xyz'),key+'-traj.xyz'),csv=R.parseEnergyCSV(read(base+'-md-ener.csv'),key+'-md-ener.csv');
  assert.deepEqual(run.xyz.elements,['O','H','H']);assert.equal(run.xyz.frames.length,1001);assert.equal(run.energy.rows.length,1001);
  assert.equal(run.out.metadata.normal,true);assert.equal(run.out.metadata.ensemble,ensemble);assert.equal(run.out.metadata.timestep,.5);
  assert.equal(R.validateEnergySources(csv,run.out),null);assert.equal(run.energy.rows[0].temperature,100);
  assert.deepEqual(run.energy.rows,JSON.parse(JSON.stringify(csv.rows)));
  for(let i=0;i<1001;i++){
   assert.equal(run.xyz.frames[i].time,i*.5);assert.equal(run.energy.rows[i].time,i*.5);
   assert.deepEqual(run.xyz.frames[i].coords,JSON.parse(JSON.stringify(xyz.frames[i].coords)));
  }
  assert.deepEqual(Array.from(store.presets[`water_${suffix}`].runs),[key]);runs.push(run);
 }
 assert.deepEqual(runs[0].xyz.frames[0].coords,runs[1].xyz.frames[0].coords);
 assert.equal(runs[1].out.metadata.thermostat,'CSVR');assert.equal(runs[1].out.metadata.targetTemperature,300);
 const conditions=suffix=>normalized(read(`exercicios/1-agua-dft/inputs/agua_xtb2_${suffix}.inp`)).replace(/Thermostat .*/,'Thermostat CONDITION').replaceAll(`agua_xtb2_${suffix}`,'water');
 assert.equal(conditions('nve'),conditions('csvr'),'The pair differs only in thermostat and output name');
});

test('two-water SOLVATOR shows the retained static structure and the unchanged starting complex',()=>{
 assert.deepEqual(Array.from(store.presets.solvator_two.runs),['zn_solvator_2aguas','preparar_complexo']);
 const after=bundle('zn_solvator_2aguas'),before=bundle('preparar_complexo');
 assert.equal(after.xyz.frames.length,1);assert.equal(after.xyz.elements.length,31);assert.equal(before.xyz.elements.length,25);
 assert.equal(after.out.metadata.normal,true);assert.equal(after.energy,undefined);
 const raw=R.parseXYZ(read('exercicios/6-complexo-solvator/resultados/zn_solvator_2aguas/zn_solvator_2aguas.solvator.xyz'),'zn_solvator_2aguas.solvator.xyz');
 assert.deepEqual(after.xyz.frames[0].coords,JSON.parse(JSON.stringify(raw.frames[0].coords)));
});
