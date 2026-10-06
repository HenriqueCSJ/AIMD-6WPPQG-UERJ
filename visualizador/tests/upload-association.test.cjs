const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const R=require('../orca-parser.js'),A=require('../run-association.js');
const rows=()=>[0,1,2,3].map(step=>({step,time:step*.5,potential:-1-step*.01,kinetic:.01,total:-.99-step*.01,temperature:300,segment:0}));
function trajectory(name='renamed.xyz',unit='Hartree'){
  const text=rows().map(row=>`1\n# ORCA AIMD Position Step ${row.step}, t=${row.time} fs, E_Pot=${row.potential*(unit==='Hartree'?1:R.HARTREE_TO_KJMOL)} ${unit}, Unit is Angstrom\nH 0 0 ${row.step*.01}\n`).join('');
  return {id:1,key:'renamed',xyz:R.parseXYZ(text,name),files:[{name,kind:'xyz'}]};
}
const calculation=()=>({id:2,key:'calculation',energy:{kind:'energy',rows:rows()},files:[]});

test('renamed uploads associate by recorded steps, times and potential energies in Hartree or kJ/mol',()=>{
  for(const unit of ['Hartree','kJ mol^-1','kJ/mol']){
    const xyz=trajectory('renamed.xyz',unit),data=calculation(),original=JSON.stringify([xyz,data]);
    assert.equal(A.find([xyz,data]).length,1);assert.equal(A.check(xyz,data).compared,4);
    assert.equal(JSON.stringify([xyz,data]),original);
  }
});
test('same clocks do not identify a calculation and conflicting energies override a declared filename',()=>{
  const xyz=trajectory(),data=calculation();data.out={metadata:{trajectoryFiles:['renamed.xyz']},rows:[]};
  data.energy.rows[2].potential+=.001;
  assert.equal(A.check(xyz,data).compatible,false);assert.equal(A.find([xyz,data]).length,0);
  const noSignature=trajectory();noSignature.xyz.frames.forEach(frame=>frame.comment='ordinary XYZ');
  assert.equal(A.check(noSignature,calculation()).automatic,false);assert.equal(A.check(noSignature,calculation()).compatible,true);
});
test('declared custom trajectory can match partial energy columns; independent competing candidates remain separate',()=>{
  const xyz=trajectory(),data=calculation();data.out={metadata:{trajectoryFiles:['folder/renamed.xyz']},rows:[]};
  data.energy.rows.forEach(row=>row.potential=null);assert.equal(A.check(xyz,data).automatic,true);
  assert.equal(A.find([xyz,data,{...calculation(),id:3}]).length,0);
  assert.equal(A.find([xyz,trajectory(),data]).length,0);
  assert.equal(A.find([xyz,{...data,reference:true}]).length,0);
});
test('time or step disagreements and insufficient potential evidence are not automatic associations',()=>{
  const xyz=trajectory(),data=calculation();data.energy.rows.forEach(row=>row.step+=10);
  assert.equal(A.check(xyz,data).compatible,false);
  const short=trajectory();short.xyz.frames=short.xyz.frames.slice(0,2);
  assert.equal(A.check(short,calculation()).automatic,false);
  const shifted=calculation();shifted.energy.rows.forEach(row=>row.time+=100);assert.equal(A.check(xyz,shifted).compatible,false);
});
test('identical reimports compare content without collapsing changed calculations',()=>{
  const a=trajectory().xyz,b=trajectory('other.xyz').xyz;assert.equal(A.sameData(a,b),true);
  b.frames[3].coords[0][0]=.1;assert.equal(A.sameData(a,b),false);
  const x=calculation().energy,y=calculation().energy;assert.equal(A.sameData(x,y),true);
  y.rows[0].temperature=450;assert.equal(A.sameData(x,y),false);
});
test('ORCA 5 two-line MD header and custom Dump Position filenames are read without a CSV',()=>{
  const header=['','Sim. Time','Temp','E_Kin','E_Pot','E_Tot'].map(s=>s.padStart(12)).join('|');
  const units=['Step','[fs]','[K]','[Hartree]','[Hartree]','[Hartree]'].map(s=>s.padStart(12)).join('|');
  const line=values=>values.map((value,i)=>String(value).padStart(i?13:12)).join('');
  const text=['Program Version 5.0.4','| 1> ! MD','| 2> %md','| 3> Dump Position Stride 1 Filename "custom motion.xyz"','| 4> end',header,units,line([0,0,300,.01,-1,-.99]),line([1,.5,310,.011,-1.02,-1.009]),'ORCA TERMINATED NORMALLY'].join('\n');
  const out=R.parseOut(text,'calculation.out');assert.deepEqual(out.metadata.trajectoryFiles,['custom motion.xyz']);assert.equal(out.rows.length,2);
  assert.equal(out.rows[1].time,.5);assert.equal(out.rows[1].temperature,310);assert.equal(out.rows[1].potential,-1.02);assert.equal(out.rows[1].total,-1.009);
});

const readRetained=(key,suffix)=>fs.readFileSync(path.resolve(__dirname,'../../exercicios/7-dinamica-complexo/resultados',key,key+suffix),'utf8');
function retainedRuns(){
  return [
    {id:1,key:'movement',xyz:R.parseXYZ(readRetained('zn_parede','-traj.xyz'),'movement.xyz')},
    {id:2,key:'energy',energy:R.parseEnergyCSV(readRetained('zn_parede','-md-ener.csv'),'energy.csv')},
    {id:3,key:'output',out:R.parseOut(readRetained('zn_parede','.out'),'output.out')}
  ];
}
function settle(runs){
  while(true){
    const matches=A.find(runs);assert.ok(matches.length<=1);if(!matches.length)return runs;
    const {source,target}=matches[0];
    for(const slot of ['xyz','out','energy','colvars'])if(!target[slot])target[slot]=source[slot];
    assert.equal(A.validateRun(target),null);runs=runs.filter(run=>run!==source);
  }
}
test('three different upload names first unite output and CSV, then the retained trajectory',()=>{
  const runs=retainedRuns(),before=JSON.stringify(runs),first=A.find(runs);
  assert.equal(first.length,1);assert.equal(first[0].target,runs[1]);assert.equal(first[0].source,runs[2]);
  assert.equal(JSON.stringify(runs),before,'finding candidates must not mutate uploads');
  const united=settle(runs);assert.equal(united.length,1);assert.equal(united[0].xyz.frames.length,1000);
  assert.equal(united[0].energy.rows.length,1001);assert.equal(united[0].out.metadata.colvars.length,12);
});
test('an output arriving after a renamed XYZ and CSV adds its conditions without changing the energy source',()=>{
  const [xyz,csv,out]=retainedRuns(),initial=settle([xyz,csv]),energy=initial[0].energy;
  assert.equal(initial.length,1);assert.equal(initial[0].out,undefined);
  const united=settle([...initial,out]);assert.equal(united.length,1);assert.equal(united[0].energy,energy);
  assert.equal(united[0].out,out.out);assert.ok(united[0].out.metadata.method.includes('XTB2'));
});
test('renamed Colvars attach only after output definitions and coordinates confirm their distances',()=>{
  const [xyz,csv,out]=retainedRuns(),colvars={id:4,key:'distances',colvars:R.parseColvars(readRetained('zn_parede','-colvars.csv'),'distances.csv')};
  assert.deepEqual(A.find([xyz,colvars]),[],'no automatic association without atom definitions');
  const united=settle([xyz,csv,out,colvars]);assert.equal(united.length,1);
  assert.equal(united[0].colvars.rows.length,1001);assert.equal(united[0].out.metadata.colvars.length,12);
});
test('foreign Colvars conflict even with the same name, including when the output supplies definitions last',()=>{
  const [xyz,csv,out]=retainedRuns(),foreign=R.parseColvars(readRetained('zn_sem_parede','-colvars.csv'),'movement-colvars.csv');
  const partial={...xyz,energy:csv.energy,colvars:foreign};assert.equal(A.validateRun(partial),null);
  const complete={...partial,out:out.out};assert.match(A.validateRun(complete),/distâncias.*diferentes/);
  assert.deepEqual(A.find([partial,out]),[]);
  const valid=settle([xyz,csv,out])[0];assert.deepEqual(A.find([valid,{id:4,colvars:foreign}]),[]);
});
test('output and CSV matching requires three distinct energy samples and mutually unique candidates',()=>{
  const csv=calculation(),output={id:3,out:{kind:'out',rows:rows(),metadata:{}}};
  assert.equal(A.find([csv,output]).length,1);
  assert.deepEqual(A.find([csv,output,{...output,id:4}]),[]);
  assert.deepEqual(A.find([csv,{...csv,id:5},output]),[]);
  const short={id:6,out:{...output.out,rows:rows().slice(0,2)}};assert.deepEqual(A.find([csv,short]),[]);
  const repeated={id:7,out:{...output.out,rows:Array(4).fill(rows()[0])}};assert.deepEqual(A.find([csv,repeated]),[]);
  const temperatureOnly={id:8,out:{...output.out,rows:rows().map(row=>({...row,potential:null,kinetic:null,total:null}))}};
  assert.deepEqual(A.find([csv,temperatureOnly]),[]);
  const wrong={id:9,out:{...output.out,rows:rows().map(row=>({...row,potential:row.potential+.001}))}};
  assert.match(A.validateRun({...csv,out:wrong.out}),/valores diferentes/);assert.deepEqual(A.find([csv,wrong]),[]);
});
test('Colvars without enough evidence, with a competing trajectory, or in a reference never auto-associate',()=>{
  const [xyz,,out]=retainedRuns(),run={...xyz,out:out.out};
  const cv=R.parseColvars(readRetained('zn_parede','-colvars.csv'),'distances.csv'),source={id:4,colvars:cv};
  assert.deepEqual(A.find([run,{...run,id:5},source]),[]);
  assert.deepEqual(A.find([{...run,reference:true},source]),[]);
  assert.deepEqual(A.find([run,{id:6,colvars:{...cv,rows:cv.rows.slice(1,3)}}]),[]);
  const repeated={...cv,rows:Array(4).fill(cv.rows[1])};assert.deepEqual(A.find([run,{id:7,colvars:repeated}]),[]);
  const shifted={...cv,rows:cv.rows.map(row=>({...row,time:row.time+10000}))};
  assert.match(A.validateRun({...run,colvars:shifted}),/tempos.*correspondentes/);
});
test('Hartree matching stays strict while legacy ORCA kJ/mol conversion roundoff is accepted',()=>{
  const data=calculation(),hartree=trajectory();
  data.energy.rows.forEach(row=>row.potential-=2.1e-6);
  assert.equal(A.check(hartree,data).compatible,false);
  const [xyz,csv,out]=retainedRuns();assert.equal(A.check(xyz,csv).compatible,true);
  assert.equal(A.validateRun({...xyz,energy:csv.energy,out:out.out}),null);
});
test('rounded CSV clocks cannot conceal conflicting values at a corresponding output step',()=>{
  const csv=calculation(),out={kind:'out',metadata:{},rows:rows().map(row=>({...row,time:row.step*.25}))};
  csv.energy.rows=out.rows.map(row=>({...row,time:Math.round(row.time*10)/10}));
  assert.equal(A.find([csv,{id:3,out}]).length,1);
  csv.energy.rows[1].potential+=.001;
  assert.equal(R.validateEnergySources(csv.energy,out),null,'the legacy exact-clock comparison skips this rounded timestamp');
  assert.match(A.validateRun({...csv,out}),/valores diferentes/);
  assert.deepEqual(A.find([csv,{id:3,out}]),[]);
});
