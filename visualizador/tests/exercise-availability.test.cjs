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
 const directOnly=['water_nve','water_csvr','solvator','complex','complex_short','solvator_two','water_short','ethanol_short','proton_shared_short','chelation_previous'];
 assert.deepEqual([...options,...directOnly].sort(),Object.keys(store.presets).sort());
 const main=select.match(/<optgroup label="Durante a aula · cinco blocos">([\s\S]*?)<\/optgroup>/)[1];
 assert.deepEqual([...main.matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]),['water_single','water_thermostat','water','ethanol','timestep','thermostat','zn_solvation','zn_hydration','chelation','zn_pressure','proton_shared']);
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


test('the new primary SOLVATOR preserves raw assembly separately from the rigid radial hydration preparation',()=>{
 const keys=Array.from(store.presets.zn_solvation.runs);assert.deepEqual(keys,['zn2_isolado','zn_ion_20h2o_solvator','zn_20h2o_inicial']);
 const raw=bundle('zn_ion_20h2o_solvator'),prepared=bundle('zn_20h2o_inicial'),ion=bundle('zn2_isolado');
 assert.deepEqual(ion.xyz.elements,['Zn']);assert.equal(ion.xyz.frames.length,1);
 assert.equal(raw.out.metadata.normal,true);assert.equal(raw.xyz.elements.length,61);assert.equal(raw.xyz.frames.length,1);assert.equal(raw.energy,undefined);
 assert.deepEqual(prepared.xyz.elements,raw.xyz.elements);assert.equal(prepared.xyz.frames.length,1);assert.equal(prepared.out,undefined);assert.equal(prepared.energy,undefined);
 const a=raw.xyz.frames[0].coords,b=prepared.xyz.frames[0].coords,d=(c,i,j)=>Math.hypot(...c[i].map((v,k)=>v-c[j][k]));
 assert.deepEqual(a[0],b[0]);
 const oxygens=raw.xyz.elements.map((e,i)=>e==='O'?i:null).filter(i=>i!==null);assert.equal(oxygens.length,20);
 assert.equal(oxygens.filter(i=>d(a,0,i)<2.6).length,3);assert.equal(oxygens.filter(i=>d(b,0,i)<2.6).length,0);
 for(const i of oxygens){
  assert.equal(raw.xyz.elements[i+1],'H');assert.equal(raw.xyz.elements[i+2],'H');
  assert.ok(Math.abs(d(b,0,i)-d(a,0,i)-.8)<2e-7);
  for(const j of [i+1,i+2])for(let k=0;k<3;k++)assert.ok(Math.abs((b[j][k]-a[j][k])-(b[i][k]-a[i][k]))<2e-7,'Water translates rigidly');
  assert.ok(Math.abs(d(a,i,i+1)-d(b,i,i+1))<2e-7);assert.ok(Math.abs(d(a,i,i+2)-d(b,i,i+2))<2e-7);
 }
 const menu=read('visualizador/index.html').match(/<optgroup label="Durante a aula · cinco blocos">([\s\S]*?)<\/optgroup>/)[1];
 assert.doesNotMatch(menu,/value="(?:solvator|complex|complex_short|solvator_two)"/);
 const lesson=read('exercicios/11-formacao-quelato/README.md');assert.match(lesson,/referência independente de 97 átomos/);assert.match(lesson,/não foi calculada a partir da nova saída do SOLVATOR/);
});


test('the hydration comparison loads four complete original 61-atom runs with common initial coordinates',()=>{
 const config=store.presets.zn_hydration;
 if(config.awaitingResults){assert.deepEqual(Array.from(config.runs),[]);return;}
 const keys=['zn_h2o_sem_parede','zn_h2o_spring10','zn_h2o_spring50','zn_h2o_spring200'];assert.deepEqual(Array.from(config.runs),keys);
 const loaded=keys.map(key=>bundle(key));
 for(const run of loaded){
  const key=run.key,base=`exercicios/7-dinamica-complexo/resultados/${key}/${key}`;
  const xyz=R.parseXYZ(read(base+'-traj.xyz'),key+'-traj.xyz'),csv=R.parseEnergyCSV(read(base+'-md-ener.csv'),key+'-md-ener.csv');
  assert.equal(run.xyz.elements.length,61);assert.equal(run.xyz.elements.filter(e=>e==='Zn').length,1);assert.equal(run.xyz.elements.filter(e=>e==='O').length,20);assert.equal(run.xyz.elements.filter(e=>e==='H').length,40);assert.equal(run.xyz.elements.includes('N'),false);
  assert.equal(run.out.metadata.normal,true);assert.equal(run.out.metadata.timestep,.25);
  assert.equal(run.xyz.frames.length,2001);assert.equal(run.energy.rows.length,4001);assert.equal(run.xyz.previewStride,undefined);
  assert.deepEqual(run.energy.rows,JSON.parse(JSON.stringify(csv.rows)));
  assert.deepEqual(run.xyz.frames[0].coords,loaded[0].xyz.frames[0].coords);
  for(let i=0;i<2001;i++){
   assert.equal(run.xyz.frames[i].time,i*.5);assert.equal(run.xyz.frames[i].time,xyz.frames[i].time);assert.deepEqual(run.xyz.frames[i].coords,JSON.parse(JSON.stringify(xyz.frames[i].coords)));
  }
  assert.equal(run.energy.rows[0].time,0);assert.equal(run.energy.rows.at(-1).time,1000);
 }
 assert.deepEqual(Array.from(store.presets.complex.runs),['zn_parede_longo','zn_sem_parede_longo']);
 assert.deepEqual(Array.from(store.presets.solvator.runs),['zn_solvator','preparar_complexo']);
});


test('04d pressure comparison preserves all three unassisted 97-atom 5 ps trajectories and their original records',()=>{
 const keys=['zn_en_1bar','zn_en_1000bar','zn_en_4000bar'];assert.deepEqual(Array.from(store.presets.zn_pressure.runs),keys);
 const loaded=keys.map(key=>bundle(key));
 for(const run of loaded){
  const basename=run.key+'_5ps',base=`exercicios/14-zn-en-pressao/resultados/${basename}/${basename}`;
  const rawXYZ=R.parseXYZ(read(base+'-traj.xyz'),basename+'-traj.xyz'),rawCSV=R.parseEnergyCSV(read(base+'-md-ener.csv'),basename+'-md-ener.csv'),input=read(base+'.inp');
  assert.equal(run.out.metadata.normal,true);assert.equal(run.out.metadata.timestep,.25);
  assert.equal(run.xyz.elements.length,97);assert.equal(run.xyz.elements.filter(e=>e==='Zn').length,1);assert.equal(run.xyz.elements.filter(e=>e==='O').length,20);assert.equal(run.xyz.elements.filter(e=>e==='N').length,6);
  assert.equal(run.xyz.frames.length,10001);assert.equal(run.xyz.previewStride,undefined);assert.equal(run.xyz.originalFrameCount,undefined);
  assert.deepEqual(run.xyz.elements,rawXYZ.elements);assert.deepEqual(run.xyz.frames[0].coords,loaded[0].xyz.frames[0].coords);
  for(let i=0;i<10001;i++){assert.equal(run.xyz.frames[i].time,i*.5);assert.equal(run.xyz.frames[i].time,rawXYZ.frames[i].time);assert.deepEqual(run.xyz.frames[i].coords,JSON.parse(JSON.stringify(rawXYZ.frames[i].coords)));}
  assert.deepEqual(run.energy.rows,JSON.parse(JSON.stringify(rawCSV.rows)));assert.equal(run.energy.rows[0].time,0);assert.equal(run.energy.rows.at(-1).time,5000);
  assert.doesNotMatch(input,/^\s*Restraint\b/im,'Pressure reference contains no Zn-N restraint');assert.match(input,/Thermostat CSVR 300_K Timecon 20_fs/);assert.match(input,/Thermostat CSVR 300_K Timecon 100_fs/);
  assert.equal((input.match(/^\s*Run\s+/gm)||[]).length,2);assert.match(input,/Run 2000/);assert.match(input,/Run 18000/);
  for(const file of run.files)assert.ok(fs.existsSync(path.join(root,file.path)),file.path);
 }
 const lesson=read('exercicios/14-zn-en-pressao/README.md');assert.match(lesson,/seis O e nenhum N/);assert.match(lesson,/não começam no quelato final nem na geometria de encontro/);
});
