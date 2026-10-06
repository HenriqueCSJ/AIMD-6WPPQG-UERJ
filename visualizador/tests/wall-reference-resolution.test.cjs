const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../orca-parser.js'),root=path.resolve(__dirname,'../..');
test('wall references retain every calculated frame, timestamp and coordinate without thinning',()=>{
  const sets=[['13-cell-pressao',['zn_cell_spring10','zn_cell_spring50','zn_cell_1bar','zn_cell_1000bar','zn_cell_fixed','zn_cell_none']],['7-dinamica-complexo',['zn_parede','zn_sem_parede','zn_parede_longo','zn_sem_parede_longo']]];
  for(const [lesson,keys] of sets)for(const key of keys){
    const actual=R.parseXYZ(fs.readFileSync(path.join(root,'exercicios',lesson,'resultados',key,key+'-traj.xyz'),'utf8'));
    const context={window:{AIMD_EXAMPLES:{runs:{}}}};
    vm.runInNewContext(fs.readFileSync(path.join(root,'visualizador/examples',key+'.js'),'utf8'),context);
    const shown=JSON.parse(JSON.stringify(context.window.AIMD_EXAMPLES.runs[key].xyz));
    assert.equal(shown.frames.length,actual.frames.length,key);
    assert.ok(!shown.previewStride||shown.previewStride===1,key);
    assert.deepEqual(shown.elements,actual.elements,key);
    for(let i=0;i<actual.frames.length;i++){
      assert.equal(shown.frames[i].time,actual.frames[i].time,key+' time '+i);
      assert.equal(shown.frames[i].step,actual.frames[i].step,key+' step '+i);
      assert.deepEqual(shown.frames[i].coords,actual.frames[i].coords,key+' coordinates '+i);
    }
    if(/_\d+bar$/.test(key))assert.equal(shown.frames.length,2000,key);
    if(key.endsWith('_longo'))assert.equal(shown.frames.length,4000,key);
  }
});
