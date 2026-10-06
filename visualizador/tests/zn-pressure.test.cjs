const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../orca-parser.js'),A=require('../run-association.js');
const root=path.resolve(__dirname,'../..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const base=p=>`exercicios/14-zn-en-pressao/resultados/zn_en_${p}bar_5ps/zn_en_${p}bar_5ps`;

test('04d preserves all three unassisted pressure trajectories and their elastic wall histories',()=>{
  const context={window:{}};vm.runInNewContext(read('visualizador/examples.js'),context);
  let firstCoords=null;
  for(const pressure of [1,1000,4000]){
    const key=`zn_en_${pressure}bar`,out=R.parseOut(read(base(pressure)+'.out'));
    const energy=R.parseEnergyCSV(read(base(pressure)+'-md-ener.csv'));
    const xyz=R.parseXYZ(read(base(pressure)+'-traj.xyz'));
    assert.equal(out.metadata.normal,true);assert.equal(out.metadata.cellProgramUnsupported,false);
    assert.equal(out.metadata.continuousCellRuns,2);assert.equal(out.metadata.initialWallInfo.targetPressure,pressure);
    assert.equal(out.metadata.ensemble,'unknown');assert.deepEqual(out.metadata.colvars,[]);
    assert.equal(xyz.elements.length,97);assert.equal(xyz.frames.length,10001);
    assert.equal(xyz.frames[0].time,0);assert.equal(xyz.frames.at(-1).time,5000);
    if(firstCoords)assert.deepEqual(xyz.frames[0].coords,firstCoords);else firstCoords=xyz.frames[0].coords;
    vm.runInNewContext(read(`visualizador/examples/${key}.js`),context);
    const built=JSON.parse(JSON.stringify(context.window.AIMD_EXAMPLES.runs[key]));
    assert.equal(built.xyz.frames.length,10001);
    const run={out,energy},index=A.cellIndex(run);
    for(let i=0;i<xyz.frames.length;i++){
      const frame=xyz.frames[i];assert.deepEqual(built.xyz.frames[i].coords,frame.coords);
      assert.equal(built.xyz.frames[i].time,frame.time);
      assert.ok(A.cellState(run,frame,index)?.sphere?.radius>0,`${pressure}bar at ${frame.time}fs`);
    }
    const final=A.cellState(run,xyz.frames.at(-1),index);
    assert.ok(pressure===1?final.sphere.radius>40:final.sphere.radius<9);
    // Low-density rounding at 1 bar limits radius reconstruction precision.
    const rho=energy.rows.at(-1).cellDensity,rho0=out.metadata.initialWallInfo.density;
    const lower=9*Math.cbrt((rho0-.00005)/(rho+.00005));
    const upper=9*Math.cbrt((rho0+.00005)/(rho-.00005));
    assert.ok(out.metadata.finalWallInfo.sphere.radius>=lower-.0005&&out.metadata.finalWallInfo.sphere.radius<=upper+.0005);
  }
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.AIMD_EXAMPLES.presets.zn_pressure.runs)),['zn_en_1bar','zn_en_1000bar','zn_en_4000bar']);
});

test('multiple Run cell support rejects a changed boundary, cell redeclaration, restart or clock reset',()=>{
  const text=read(base(1000)+'.out');
  const badBoundary=text.replace(/(>>> Initial Wall Info >>>[\s\S]*?radius )7\.876/, '$17.800');
  assert.notEqual(text,badBoundary);
  const redeclared=text.replace(/(\|\s*\d+>\s*)Run 18000/, '$1Cell None\n| 999> Run 18000');
  const restarted=text.replace(/(\|\s*\d+>\s*)Run 18000/, '$1Restart "foreign.mdrestart"\n| 999> Run 18000');
  const wrongTime=text.replace(/(\|\s*\d+>\s*)Run 2000/, '$1Run 1999');
  for(const modified of [badBoundary,redeclared,restarted,wrongTime]){
    const out=R.parseOut(modified);
    assert.equal(out.metadata.cellProgramUnsupported,true);
    assert.equal(A.cellState({out},{time:1000,step:4000}).sphere,null);
  }
});

test('continuous cell boundary handling does not hide conflicting positive measurements',()=>{
  const run={out:R.parseOut(read(base(1000)+'.out')),energy:R.parseEnergyCSV(read(base(1000)+'-md-ener.csv'))};
  assert.ok(A.cellState(run,{time:500,step:2000}).sphere);
  run.energy.rows.push({...run.energy.rows.find(r=>r.time===500&&r.cellDensity>0),cellDensity:9});
  assert.equal(A.cellState(run,{time:500,step:2000}).sphere,null);
});
