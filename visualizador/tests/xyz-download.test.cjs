const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const X=require('../xyz-download.js'),R=require('../orca-parser.js');
test('the same original partial trajectory is labelled partial in individual and combined views',()=>{
 const vm=require('node:vm'),context={window:{}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../examples.js'),'utf8'),context);
 const sources=context.window.AIMD_EXAMPLES.sources;
 const individual=sources.r9_rep1_05000_10000fs.resultXYZ.find(file=>file.name==='r9_rep1_05000_10000fs-traj.xyz');
 const combined=sources.chelation_continuous.resultXYZ.find(file=>file.path===individual.path);
 assert.equal(individual.partial,true);assert.equal(combined.partial,true);
});
test('XYZ snapshots preserve the chosen original coordinates and its physical time',()=>{
 const xyz={elements:['Zn','O'],frames:[{coords:[[0,0,0],[2.5,0,0]],time:0},{coords:[[.125,-.25,1e-9],[2.123456789012345,1,-2]],time:.5}]};
 const text=X.frameText(xyz,1,'Resultado\nparcial'),parsed=R.parseXYZ(text,'last.xyz');
 assert.equal(text.split('\n')[0],'2');assert.match(text,/t= 0.5 fs/);
 assert.equal(parsed.frames[0].time,xyz.frames[1].time);
 assert.deepEqual(parsed.frames[0].coords,xyz.frames[1].coords);
 assert.deepEqual(parsed.elements,xyz.elements);assert.equal(xyz.frames.length,2);
 assert.throws(()=>X.frameText(xyz,3),/indisponível/);
 assert.throws(()=>X.frameText({elements:['O'],frames:[{coords:[[NaN,0,0]]}]},0),/inválidas/);
});
test('the laboratory exposes original XYZ links and actual snapshots independently of CSV export',()=>{
 const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 assert.match(html,/id="trajectory-xyz-downloads"/);assert.match(html,/xyz-download\.js/);
 assert.match(app,/Baixar quadro atual \(XYZ\)/);assert.match(app,/Baixar último quadro \(XYZ\)/);
 assert.match(app,/a\.download=file\.name/);assert.match(app,/chemical\/x-xyz/);
});
test('sequence snapshots retain the original source clock independently from elapsed teaching time',()=>{
 const xyz={elements:['Zn'],frames:[{coords:[[1,2,3]],time:8016,sourceTime:433,sourceKey:'livre_apos_N1'}]};
 const text=X.frameText(xyz,0,'Sequência'),parsed=R.parseXYZ(text,'snapshot.xyz');
 assert.equal(parsed.frames[0].time,433);
 assert.match(text,/sequence_time= 8016 fs; source= livre_apos_N1/);
 assert.deepEqual(parsed.frames[0].coords,xyz.frames[0].coords);
});
