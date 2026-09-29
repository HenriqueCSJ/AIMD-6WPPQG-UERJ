const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../orca-parser.js'),root=path.resolve(__dirname,'../..');
const csv=(name,lesson)=>fs.readFileSync(path.join(root,`exercicios/${lesson}/resultados/${name}/${name}-md-ener.csv`),'utf8');
const header='# Step; Sim. Time; Iter; t_Ener; t_Grad; Temp; E_Kin; E_Pot; E_Tot; Cons.Qty; E.Drift';
const row=(step,time,T=300)=>`${step};${time};;;;${T};0.01;-1;-0.99;;`;
test('all retained MD outputs agree with CSV values; input metadata recognizes None as NVE',()=>{
 let checked=0;for(const lesson of fs.readdirSync(path.join(root,'exercicios')).filter(s=>/^[1-7]-/.test(s))){const results=path.join(root,'exercicios',lesson,'resultados');for(const name of fs.readdirSync(results)){
  const dir=path.join(results,name),ener=path.join(dir,name+'-md-ener.csv');if(!fs.existsSync(ener))continue;
  const c=R.parseEnergyCSV(fs.readFileSync(ener,'utf8')),o=R.parseOut(fs.readFileSync(path.join(dir,name+'.out'),'utf8'));
  assert.equal(R.validateEnergySources(c,o),null,name);assert.equal(o.rows.length,c.rows.length,name);
  assert.equal(c.rows[0].total,o.rows[0].total);assert.equal(c.rows.at(-1).total,o.rows.at(-1).total);
  assert.equal(o.metadata.ensemble,/csvr|parede|termica/.test(name)?'NVT':'NVE',name);checked++;
 }}assert.equal(checked,9);
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
