const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {buildSequence}=require('../../scripts/build_viewer_sequence.cjs');
function fixture(t){
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'aimd-sequence-'));t.after(()=>fs.rmSync(folder,{recursive:true,force:true}));
 const course={metadata:{clockMode:'sequence_elapsed'},sequenceSources:[]};
 for(const [index,key] of ['before','after'].entries()){
  fs.writeFileSync(path.join(folder,key+'.xyz'),Array.from({length:7},(_,i)=>`2\nStep ${i} t = ${i*.5} fs Unit is Angstrom\nZn ${index*3+i*.5+index*1e-8} 0 0\nN 0 2 0\n`).join(''));
  fs.writeFileSync(path.join(folder,key+'.csv'),'Step;Sim. Time;E_Kin;E_Pot;E_Tot;Temp;Cons.Qty;E.Drift\n'+Array.from({length:7},(_,i)=>`${i};${i*.5};${.1+index*.01};-1;${-.9+index*.01};${280+index*20};0;0`).join('\n'));
  course.sequenceSources.push({key,xyz:key+'.xyz',energy:key+'.csv',startFs:0,endFs:3,offsetFs:index*3,velocityReset:!!index});
 }
 return {folder,course};
}
test('sequence assembly keeps source values, distinguishes the velocity reset and samples actual boundary frames',t=>{
 const {folder,course}=fixture(t),result=buildSequence(folder,'sequence',course,{previewLimit:3});
 assert.equal(result.xyz.originalFrameCount,13);assert.equal(result.xyz.previewStride,5);
 assert.deepEqual(result.xyz.frames.map(frame=>frame.time),[0,2.5,3,5,6]);
 const boundary=result.xyz.frames.find(frame=>frame.time===3);assert.equal(boundary.sourceKey,'after');assert.equal(boundary.sourceTime,0);assert.equal(boundary.sourceStep,0);assert.equal(boundary.coords[0][0],3+1e-8);
 assert.ok(result.xyz.frames.every(frame=>frame.step===null));assert.ok(result.energy.rows.every(row=>row.step===null));
 assert.deepEqual(result.energy.rows.filter(row=>row.time===3).map(row=>[row.sourceKey,row.sourceTime,row.temperature,row.total]),[['before',3,280,-.9],['after',0,300,-.89]]);
 assert.notEqual(result.energy.rows[6].segment,result.energy.rows[7].segment);
 assert.equal(result.files.length,4);assert.match(result.xyz.warnings[0],/fronteiras.*Sem interpolação/);
});
test('sequence assembly rejects an unsupported coordinate join, overlapping clocks and duplicate source identity',t=>{
 const {folder,course}=fixture(t);
 const original=fs.readFileSync(path.join(folder,'after.xyz'),'utf8');fs.writeFileSync(path.join(folder,'after.xyz'),original.replace('3.00000001','3.001'));
 assert.throws(()=>buildSequence(folder,'sequence',course),/boundary coordinates/);
 fs.writeFileSync(path.join(folder,'after.xyz'),original);course.sequenceSources[1].offsetFs=2;assert.throws(()=>buildSequence(folder,'sequence',course),/Overlapping/);
 course.sequenceSources[1].offsetFs=3;course.sequenceSources[1].key='before';assert.throws(()=>buildSequence(folder,'sequence',course),/unique/);
});

test('a normal restart may begin at the next recorded dump without adding a fabricated boundary frame',t=>{
 const {folder,course}=fixture(t),file=path.join(folder,'after.xyz');
 fs.writeFileSync(file,fs.readFileSync(file,'utf8').split('\n').slice(4).join('\n'));course.sequenceSources[1].velocityReset=false;
 const result=buildSequence(folder,'sequence',course),frames=result.xyz.frames;
 assert.equal(frames.length,13);assert.equal(frames.find(frame=>frame.time===3).sourceKey,'before');assert.equal(frames.find(frame=>frame.sourceKey==='after').time,3.5);
 course.sequenceSources[1].velocityReset=true;assert.throws(()=>buildSequence(folder,'sequence',course),/missing boundary interval/);
});
