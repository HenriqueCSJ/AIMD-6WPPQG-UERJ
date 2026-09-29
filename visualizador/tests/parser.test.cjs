const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../orca-parser.js'),root=path.resolve(__dirname,'../..');
const csv=(name,lesson)=>fs.readFileSync(path.join(root,`exercicios/${lesson}/resultados/${name}/${name}-md-ener.csv`),'utf8');
const header='# Step; Sim. Time; Iter; t_Ener; t_Grad; Temp; E_Kin; E_Pot; E_Tot; Cons.Qty; E.Drift';
const row=(step,time,T=300)=>`${step};${time};;;;${T};0.01;-1;-0.99;;`;
test('all retained MD outputs agree with CSV values; input metadata recognizes None as NVE',()=>{
 let checked=0;for(const lesson of fs.readdirSync(path.join(root,'exercicios')).filter(s=>/^[1-8]-/.test(s))){const results=path.join(root,'exercicios',lesson,'resultados');for(const name of fs.readdirSync(results)){
  const dir=path.join(results,name),ener=path.join(dir,name+'-md-ener.csv');if(!fs.existsSync(ener))continue;
  const c=R.parseEnergyCSV(fs.readFileSync(ener,'utf8')),o=R.parseOut(fs.readFileSync(path.join(dir,name+'.out'),'utf8'));
  assert.equal(R.validateEnergySources(c,o),null,name);assert.equal(o.rows.length,c.rows.length,name);
  assert.equal(c.rows[0].total,o.rows[0].total);assert.equal(c.rows.at(-1).total,o.rows.at(-1).total);
  assert.equal(o.metadata.ensemble,name==='etanol_etapas'?'unknown':/csvr|parede|termica|agua_c60/.test(name)?'NVT':'NVE',name);checked++;
 }}assert.equal(checked,18);
});
test('real timestep controls retain the full duration and measured energy amplitudes',()=>{
 for(const [name,lesson,count,span] of [['etanol_dt025','4-timestep',2001,.000038],['etanol_nve','3-xtb2-etanol',1001,.000114],['etanol_dt200','4-timestep',251,.002526]]){
  const data=R.parseEnergyCSV(csv(name,lesson));assert.equal(data.rows.length,count);assert.equal(data.rows.at(-1).time,500);assert.ok(Math.abs(R.stats(data.rows,'total').span-span)<1e-10);
 }
});
test('CSV handles BOM, CRLF, D exponent, empty optional cells, and exact zero',()=>{
 const data=R.parseEnergyCSV('\ufeff'+header+'\r\n'+row(0,0,0)+'\r\n'+row(1,.5).replace('0.01','1D-2'));
 assert.equal(data.rows[0].temperature,0);assert.equal(data.rows[0].conserved,null);assert.equal(data.rows[1].kinetic,.01);
});
test('missing columns and partial rows are disclosed, never silently zero-filled',()=>{
 const data=R.parseEnergyCSV('# Step; Sim. Time; E_Tot\n0;0;-1\n1;.5;-0.9\n2;');
 assert.equal(data.rows.length,2);assert.equal(data.rows[0].temperature,null);assert.ok(data.warnings.some(w=>w.includes('ausente')));assert.ok(data.warnings.some(w=>w.includes('incompleta')));
});
test('restarts and omitted step ranges break plotted segments',()=>{
 const data=R.parseEnergyCSV(header+'\n'+[row(0,0),row(1,.5),row(10,5),row(0,0)].join('\n'));
 assert.notEqual(data.rows[1].segment,data.rows[2].segment);assert.notEqual(data.rows[2].segment,data.rows[3].segment);
});
test('XYZ restart alignment and all twelve distances reproduce the ORCA Colvars',()=>{
 const base=path.join(root,'exercicios/7-dinamica-complexo/resultados/zn_parede/zn_parede');
 const xyz=R.parseXYZ(fs.readFileSync(base+'-traj.xyz','utf8')),cv=R.parseColvars(fs.readFileSync(base+'-colvars.csv','utf8')),out=R.parseOut(fs.readFileSync(base+'.out','utf8'));
 assert.equal(xyz.frames.length,1000);assert.equal(cv.rows.length,1001);assert.equal(xyz.frames[0].time,100.5);assert.equal(cv.rows[0].time,100);
 assert.equal(cv.columns.length,12);assert.equal(out.metadata.colvars.length,12);
 const byTime=new Map(cv.rows.map(r=>[r.time,r]));
 for(const def of out.metadata.colvars)for(const p of R.distanceSeries(xyz,def.a,def.b))assert.ok(Math.abs(p.value-byTime.get(p.time).values[def.id])<1e-8);
});
test('XYZ incomplete tail is ignored; atom-order changes and non-position XYZ are rejected',()=>{
 const frame='2\nt=0.0 fs\nH 0 0 0\nH 0 0 1\n';const partial=frame+'2\nt=0.5 fs\nH 0 0 0\n';
 assert.equal(R.parseXYZ(partial).frames.length,1);assert.ok(R.parseXYZ(partial).warnings.length);
 assert.throws(()=>R.parseXYZ(frame+'2\nt=0.5 fs\nH 0 0 0\nO 0 0 1\n'),/ordem/);
 assert.throws(()=>R.parseXYZ(frame.replace('t=0.0 fs','ORCA AIMD Velocity')),/velocidades/);
 assert.throws(()=>R.parseXYZ(frame.replace('t=0.0 fs','Unit is Bohr')),/Unidade/);
});
test('generic XYZ preserves frame indices, not an invented femtosecond clock',()=>{
 const data=R.parseXYZ('2\nNo clock\nH 0 0 0\nH 0 0 1\n2\nNo clock\nH 0 0 0\nH 0 0 2\n');
 assert.equal(data.frames[0].time,null);assert.deepEqual(R.distanceSeries(data,0,1).map(r=>[r.time,r.value]),[[1,1],[2,2]]);
});
test('mismatched energy files are not silently merged',()=>{
 const a=R.parseEnergyCSV(header+'\n'+row(0,0));const b=R.parseEnergyCSV(header+'\n'+row(0,0).replace('-0.99','-0.89'));assert.ok(R.validateEnergySources(a,b));
});
test('Colvars only accepts Position / Angstrom, not Internal Force or angular CVs',()=>{
 const p=R.parseColvars('# Simulation Time; Colvar 1 Position / Angstrom; Colvar 1 Internal Force / kJ mol^-1 Angstrom^-1\n0;2;99');assert.equal(p.rows[0].values[1],2);assert.equal(p.columns.length,1);
 assert.throws(()=>R.parseColvars('# Simulation Time; Colvar 1 Position / Degree\n0;90'),/Angstrom/);
});
test('empty files are rejected clearly',()=>{assert.throws(()=>R.parseEnergyCSV(''),/cabeçalho/);assert.throws(()=>R.parseXYZ(''),/quadros/);});

test('real 5fs failure is explicit and partial; corrected run reaches 500fs',()=>{
 const base=path.join(root,'exercicios/4-timestep/resultados/etanol_dt500/etanol_dt500');
 const out=R.parseOut(fs.readFileSync(base+'.out','utf8')),energy=R.parseEnergyCSV(fs.readFileSync(base+'-md-ener.csv','utf8'));
 assert.equal(out.metadata.failed,true);assert.equal(out.metadata.normal,false);
 assert.equal(energy.rows.at(-1).time,15);assert.ok(energy.rows.at(-1).temperature>1e6);
 assert.equal(R.parseEnergyCSV(csv('etanol_corrigido','4-timestep')).rows.at(-1).time,500);
});

test('fixed sphere geometry is read without inventing unknown units or elastic boundaries',()=>{
 const parse=line=>R.parseOut('ORCA\n| 1> ! MD XTB2\n| 2> '+line).metadata;
 assert.deepEqual(parse('Walls Sphere 0, 0, 0, 6.0_A Spring 50.0').wallSphere,{center:{x:0,y:0,z:0},radius:6});
 assert.equal(parse('Walls Sphere 0, 0, 0, 6.0_Bohr Spring 50.0').wallSphere,null);
 assert.equal(parse('Walls Sphere 0, 0, 0, 6.0_A Spring 50.0 Elastic 10, 0.01').wallSphere,null);
});

test('a sequential thermostat program preserves ramp endpoints and later holds',()=>{
 const input=['! MD XTB2 PAL8','%md','Initvel 300_K','Timestep 0.5_fs','Thermostat CSVR 300_K Timecon 100_fs','Run 1000','Thermostat CSVR 300_K Timecon 100_fs Ramp 600_K','Run 2000','Run 4000','Thermostat CSVR 600_K Timecon 100_fs Ramp 300_K','Run 2000','Run 1000','end'];
 const read=lines=>R.parseOut('ORCA\n'+lines.map((line,i)=>`| ${i+1}> ${line}`).join('\n')).metadata;
 const m=read(input);assert.equal(m.ensemble,'unknown');assert.equal(m.targetTemperature,null);assert.equal(m.changingConditions,true);
 assert.deepEqual(m.stages.map(s=>[s.startFs,s.endFs,s.targetStartK,s.targetEndK,s.ramp]),[[0,500,300,300,false],[500,1500,300,600,true],[1500,3500,600,600,false],[3500,4500,600,300,true],[4500,5000,300,300,false]]);
 assert.deepEqual(read([...input.slice(0,-1),'Restart "state.mdrestart"','end']).stages,[]);
 assert.deepEqual(read(input.map(l=>l.replace('Thermostat CSVR 300_K','Thermostat CSVR 300_C'))).stages,[]);
 const changed=read(input.map(l=>l==='Run 4000'?'Timestep 2.0_fs\nRun 100':l).flatMap(l=>l.split('\n')));assert.equal(changed.timestep,null);
});

test('new real failure lasts 325fs and new protocol completes all five stages',()=>{
 const base=path.join(root,'exercicios/4-timestep/resultados/etanol_instavel/etanol_instavel');
 const out=R.parseOut(fs.readFileSync(base+'.out','utf8')),e=R.parseEnergyCSV(fs.readFileSync(base+'-md-ener.csv','utf8'));
 assert.equal(out.metadata.failed,true);assert.equal(e.rows.at(-1).time,325);
 const early=e.rows.find(r=>r.time===75);assert.equal(early.temperature,269);assert.ok((early.total-e.rows[0].total)*R.HARTREE_TO_KJMOL>40);
 const b=path.join(root,'exercicios/5-termostato/resultados/etanol_etapas/etanol_etapas');
 const program=R.parseOut(fs.readFileSync(b+'.out','utf8')),data=R.parseEnergyCSV(fs.readFileSync(b+'-md-ener.csv','utf8'));
 assert.equal(program.metadata.stages.length,5);assert.equal(program.metadata.normal,true);assert.equal(data.rows.at(-1).time,5000);assert.equal(R.validateEnergySources(data,program),null);
});
