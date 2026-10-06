const test=require('node:test'),assert=require('node:assert/strict');
const R=require('../orca-parser.js'),A=require('../run-association.js');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');

// Bounded excerpts follow the retained ORCA 6.1.1 probe's exact wall-info
// and CSV formats. Only the fixtures' sparse energy rows are synthetic.
const initialWall=`>>> Initial Wall Info >>>
    Active wall has spherical geometry.
    Wall centered at ( 0.000 | 0.000 | 0.000 ) with radius 3.000 Angstrom.
    Wall volume:     113.097 Angstrom^3
    Cell mass density: 0.2645 g/cm^3
    Wall is elastic with t_avg = 5.0 fs and c_response = 0.00100 Angstrom bar^-1.
    External pressure is 1000.00 bar (isotropic).
<<< Initial Wall Info <<<`;
const finalWall=initialWall.replaceAll('Initial','Final').replace('3.000 Angstrom','2.908 Angstrom').replace('113.097','103.058').replace('0.2645','0.2903');
const header='# Step; Sim. Time; Temp; E_Kin; E_Pot; E_Tot; Av.Press.; Cell Dens.';
const csv=header+'\n0;100;300;.004275;-5.070451;-5.066175;;\n1;100.5;304.19;.004335;-5.070467;-5.066132;0;.2645\n40;120;201.01;.002865;-5.067903;-5.065038;478.5;.2903';
function fixture({fixed=false,staged=false}={}){
  const commands=['! MD XTB2','%md','Restart "original.mdrestart"','Thermostat CSVR 300_K Timecon 100_fs','Cell Sphere 0, 0, 0, 3_A Spring 10 Elastic 5_fs, 0.001 Pressure 1000',...(fixed?['Cell Fixed']:[]),'Run 40',...(staged?['Cell None','Run 10']:[]),'end'];
  const headings=['Step','Sim. Time','Temp','E_Kin','E_Pot','E_Tot','Av.Press.','Cell Dens.'];
  const table=headings.map(value=>value.padStart(14)).join('|');
  const line=values=>values.map((value,i)=>String(value).padStart(i?15:14)).join('');
  const info=fixed?initialWall.replace(/    Wall is elastic[^\n]*\n/,''):initialWall;
  const text=['Program Version 6.1.1',...commands.map((line,i)=>`| ${i+1}> ${line}`),info,table,line([0,100,300,.004275,-5.070451,-5.066175,'','']),line([1,100.5,304.19,.004335,-5.070467,-5.066132,0,.2645]),line([40,120,201.01,.002865,-5.067903,-5.065038,478.5,.2903]),finalWall,'ORCA TERMINATED NORMALLY'].join('\n');
  return {text,out:R.parseOut(text),energy:R.parseEnergyCSV(csv)};
}

test('pressure and density are independent observables with preserved missing initial samples',()=>{
  const {energy,out}=fixture();
  for(const data of [energy,out]){
    assert.equal(data.rows[0].averagePressure,null);assert.equal(data.rows[0].cellDensity,null);
    assert.equal(data.rows[1].averagePressure,0);assert.equal(data.rows.at(-1).averagePressure,478.5);
    assert.equal(data.rows.at(-1).cellDensity,.2903);assert.equal(data.units.averagePressure,'bar');
  }
  assert.equal(out.metadata.ensemble,'unknown');assert.equal(out.metadata.thermostat,'CSVR');
  assert.equal(out.metadata.dynamicCell,true);assert.equal(out.metadata.wallSphere,null);
  assert.equal(out.metadata.initialWallInfo.time,100);assert.equal(out.metadata.initialWallInfo.step,0);
  assert.equal(out.metadata.initialWallInfo.targetPressure,1000);assert.equal(out.metadata.finalWallInfo.sphere.radius,2.908);
  assert.equal(R.validateEnergySources(energy,out),null);
});

test('each density reconstructs its own approximate sphere, including a restart initial clock',()=>{
  const run=fixture(),original=JSON.stringify(run),index=A.cellIndex(run);
  const first=A.cellState(run,{time:100,step:0},index),final=A.cellState(run,{time:120,step:40},index);
  assert.equal(first.status,'initial');assert.equal(first.sphere.radius,3);assert.equal(first.volume,113.097);
  assert.equal(final.status,'reconstructed');assert.equal(final.sphere.radius,3*Math.cbrt(.2645/.2903));
  assert.equal(final.volume,4*Math.PI*final.sphere.radius**3/3);
  assert.equal(final.averagePressure,478.5);assert.equal(final.targetPressure,1000);
  assert.ok(Math.abs(final.sphere.radius-run.out.metadata.finalWallInfo.sphere.radius)<.001);
  assert.equal(JSON.stringify(run),original,'The measured data and initial/final output stay unchanged');
});

test('missing, negative, mismatched and ambiguous cell states never reuse a previous wall',()=>{
  const run=fixture();
  for(const frame of [{time:110,step:20},{time:120,step:1},{time:120,step:40,sourceKey:'foreign'}])assert.equal(A.cellState(run,frame).sphere,null);
  assert.equal(A.cellState(run,{time:null,step:0}),null);
  run.energy.rows.at(-1).cellDensity=-1;assert.equal(A.cellState(run,{time:120,step:40}).sphere,null);
  run.energy.rows.at(-1).cellDensity=null;assert.equal(A.cellState(run,{time:120,step:40}).sphere,null);
  run.energy.rows.push({...run.energy.rows[0],cellDensity:.2903});
  assert.equal(A.cellState(run,{time:100,step:0}).sphere,null,'Ambiguous restart states cannot fall back to an initial sphere');
});

test('source clock and source step must both match a reconstructed sphere',()=>{
  const run=fixture();run.energy.rows.forEach(row=>{row.sourceKey='compressed';row.sourceStep=row.step;row.step=null;});
  assert.equal(A.cellState(run,{time:120,sourceKey:'compressed',sourceStep:40}).status,'reconstructed');
  assert.equal(A.cellState(run,{time:120,sourceKey:'compressed',sourceStep:1}).sphere,null);
  assert.equal(A.cellState(run,{time:120,sourceKey:'other',sourceStep:40}).sphere,null);
});

test('one executed fixed sphere resolves setup directives, while later switches are unsupported',()=>{
  const fixed=fixture({fixed:true}),staged=fixture({staged:true});
  assert.equal(fixed.out.metadata.dynamicCell,false);assert.equal(fixed.out.metadata.cellProgramUnsupported,false);
  assert.equal(fixed.out.metadata.ensemble,'NVT');assert.equal(A.cellState(fixed,{time:120,step:40}).status,'fixed');
  assert.equal(staged.out.metadata.cellProgramUnsupported,true);assert.equal(A.cellState(staged,{time:120,step:40}).status,'unsupported');
  assert.equal(A.cellState(staged,{time:120,step:40}).sphere,null);
  const none=R.parseOut('Program Version 6.1.1\n| 1> ! MD XTB2\n| 2> %md\n| 3> Thermostat CSVR 300_K\n| 4> Cell None\n| 5> Run 10\n| 6> end\nORCA TERMINATED NORMALLY');
  assert.equal(none.metadata.wall,false);assert.equal(none.metadata.ensemble,'NVT');assert.equal(A.cellState({out:none},{time:100,step:200}),null);
});

test('density conflicts prevent matching output and CSV even when every energy agrees',()=>{
  const run=fixture();run.energy.rows[1].cellDensity=.9;
  assert.ok(R.validateEnergySources(run.energy,run.out));assert.ok(A.validateRun(run));
  const changed=fixture().out;changed.metadata.initialWallInfo.density=.7;
  assert.equal(A.sameData(run.out,changed),false);
});

test('chunked output and CSV readers preserve cell metadata and observables at arbitrary splits',async()=>{
  const run=fixture();
  assert.deepEqual(await R.parseBlob(new Blob([run.text]),run.out.name,()=>{},17),run.out);
  assert.deepEqual(await R.parseBlob(new Blob([csv]),run.energy.name,()=>{},11),run.energy);
});

test('six real Cell references reproduce retained trajectories, pressure and final wall sizes',()=>{
  const context={window:{}};vm.runInNewContext(read('visualizador/examples.js'),context);
  for(const key of ['zn_cell_spring10','zn_cell_spring50','zn_cell_1bar','zn_cell_1000bar','zn_cell_fixed','zn_cell_none']){
    const base=`exercicios/13-cell-pressao/resultados/${key}/${key}`;
    const run={out:R.parseOut(read(base+'.out')),energy:R.parseEnergyCSV(read(base+'-md-ener.csv'))};
    const xyz=R.parseXYZ(read(base+'-traj.xyz')),index=A.cellIndex(run);
    assert.equal(run.out.metadata.normal,true,key);assert.equal(R.validateEnergySources(run.energy,run.out),null,key);
    vm.runInNewContext(read(`visualizador/examples/${key}.js`),context);
    const built=JSON.parse(JSON.stringify(context.window.AIMD_EXAMPLES.runs[key]));
    const byStep=new Map(xyz.frames.map(frame=>[frame.step,frame]));
    for(const frame of built.xyz.frames){
      assert.deepEqual(frame.coords,JSON.parse(JSON.stringify(byStep.get(frame.step).coords)),key);
      const wall=A.cellState(run,frame,index);
      if(key==='zn_cell_none')assert.equal(wall,null);
      else {assert.ok(wall.sphere.radius>0,key);assert.equal(wall.status,/bar$/.test(key)?'reconstructed':'fixed');}
    }
    const final=A.cellState(run,xyz.frames.at(-1),index);
    if(final){const expected=/bar$/.test(key)?run.out.metadata.finalWallInfo.sphere.radius:key==='zn_cell_fixed'?4.985:6;assert.ok(Math.abs(final.sphere.radius-expected)<.002,key);}
    if(/bar$/.test(key))assert.equal(run.out.metadata.ensemble,'unknown');
  }
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.AIMD_EXAMPLES.presets.cell_pressure.runs)),['zn_cell_1bar','zn_cell_1000bar']);
});

test('real water velocity and force dumps preserve units and agree with independent energy and gradient outputs',()=>{
  const parseDump=text=>{
    const lines=text.trim().split(/\r?\n/),frames=[];
    for(let i=0;i<lines.length;){const n=Number(lines[i]);frames.push({comment:lines[i+1],atoms:lines.slice(i+2,i+2+n).map(line=>line.trim().split(/\s+/))});i+=n+2;}
    return frames;
  };
  const base='exercicios/1-agua-dft/resultados/agua_dump/agua_dump';
  const velocity=parseDump(read(base+'-vel.xyz')),force=parseDump(read(base+'-force.xyz')),energy=R.parseEnergyCSV(read(base+'-md-ener.csv'));
  assert.equal(velocity.length,201);assert.equal(force.length,201);assert.equal(energy.rows.length,201);
  assert.match(velocity[1].comment,/Angstrom fs\^-1/);assert.match(force[1].comment,/kJ mol\^-1 Angstrom\^-1/);
  const masses={O:15.999,H:1.008};
  velocity.forEach((frame,i)=>{const kinetic=5000*frame.atoms.reduce((sum,[el,...v])=>sum+masses[el]*v.reduce((s,x)=>s+Number(x)**2,0),0);assert.ok(Math.abs(kinetic-energy.rows[i].kinetic*2625.4996394799)<.0014);});
  const dft='exercicios/1-agua-dft/verificacao-dump/probe_properties_dft',dftForce=parseDump(read(dft+'-force.xyz'));
  for(const step of [2,4]){
    const gradient=read(`${dft}-step00000${step}.engrad`).split('The current gradient in Eh/bohr')[1].split('The atomic numbers')[0].split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('#')).map(Number);
    const f=dftForce[step].atoms.flatMap(a=>a.slice(1).map(Number));assert.equal(gradient.length,f.length);
    gradient.forEach((g,i)=>assert.ok(Math.abs(f[i]+g*2625.4996394799/.529177210903)<.0001));
  }
  assert.equal((read(dft+'.prop.log').match(/Total Dipole Moment\s*:/g)||[]).length,5);
});
