const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createLoader}=require('../example-loader.js');
const viewer=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(viewer,file),'utf8');

function bundledLoader(){
  const context=vm.createContext({window:{}}),requested=[];
  vm.runInContext(read('examples.js'),context);
  const store=context.window.AIMD_EXAMPLES;
  const loader=createLoader(store,{loadScript:async src=>{
    requested.push(src);vm.runInContext(read(src.split('?')[0]),context);
  }});
  return {store,loader,requested};
}
const simpleRun=key=>({key,label:key,files:[],out:{rows:[],metadata:{}}});
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};

test('startup manifest contains no trajectories and only the requested calculation is loaded',async()=>{
  const {store,loader,requested}=bundledLoader();
  assert.ok(Buffer.byteLength(read('examples.js'))<10000);
  assert.equal(Object.keys(store.runs).length,0);
  const result=await loader.loadPreset('water');
  assert.equal(requested.length,1);
  assert.match(requested[0],/examples\/dimero_xtb2_2ps\.js/);
  assert.equal(result.runs[0].xyz.elements.length,6);
  assert.equal(result.runs[0].xyz.frames.length,4001);
  assert.equal(Object.keys(store.runs).length,1);
});

test('every exposed preset resolves all retained runs and original download links',async()=>{
  const {store,loader}=bundledLoader();
  assert.equal(Object.keys(store.presets).length,24);
  for(const [key,preset] of Object.entries(store.presets)){
    const {runs}=await loader.loadPreset(key);
    assert.equal(runs.length,preset.runs.length,key);
    assert.deepEqual(runs.map(run=>run.key),Array.from(preset.runs),key);
    for(const run of runs){
      assert.ok(run.xyz.frames.length,run.key);
      for(const frame of run.xyz.frames){
        assert.equal(frame.coords.length,run.xyz.elements.length,run.key);
        assert.ok(frame.coords.every(coord=>coord.length===3&&coord.every(Number.isFinite)),run.key);
      }
      for(const file of run.files)assert.ok(fs.existsSync(path.join(viewer,'..',file.path)),file.path);
    }
  }
  assert.equal(Object.keys(store.runs).length,30);
  for(const key of ['zn_parede_longo','zn_sem_parede_longo']){
    assert.equal(store.runs[key].xyz.elements.length,43);
    assert.equal(store.runs[key].xyz.frames.length,1001);
    assert.equal(store.runs[key].energy.rows.length,4001);
    assert.equal(store.runs[key].xyz.originalFrameCount,4000);
  }
  assert.equal(store.runs.zn_solvator.xyz.frames.length,1);
  assert.equal(store.runs.preparar_complexo.xyz.frames.length,1);
  assert.equal(store.runs.zn_solvator.energy,undefined);
  assert.equal(store.runs.etanol_etapas.xyz.frames.length,10001);
  for(const key of ['controle_dt025_31A','hidratacao_associacao_31A']){
    const run=store.runs[key],xyz=run.xyz;
    assert.equal(xyz.elements.length,43);
    assert.equal(xyz.elements[31],'N');assert.equal(xyz.elements[34],'N');
    assert.equal(xyz.frames[0].time,0);
    assert.equal(xyz.frames.at(-1).time,key==='controle_dt025_31A'?250:5000);
    assert.equal(run.out.metadata.ensemble,'NVT');assert.equal(run.out.metadata.normal,true);
    const coords=xyz.frames[0].coords;
    for(let i=1;i<=28;i+=3)assert.ok(Math.abs(Math.hypot(...coords[i].map((v,k)=>v-coords[0][k]))-3.1)<1e-6);
  }
});

test('overlapping preset requests share a pending script and reuse its loaded data',async()=>{
  const store={presets:{a:{runs:['shared']},b:{runs:['shared']}},sources:{shared:{src:'shared.js'}},runs:{}};
  const wait=deferred();let count=0;
  const loader=createLoader(store,{loadScript:async()=>{count++;await wait.promise;store.runs.shared=simpleRun('shared');}});
  const first=loader.loadPreset('a'),second=loader.loadPreset('b');
  await Promise.resolve();assert.equal(count,1);
  wait.resolve();const [a,b]=await Promise.all([first,second]);
  assert.strictEqual(a.runs[0],b.runs[0]);
  await loader.loadPreset('a');assert.equal(count,1);
});

test('aluminum examples preserve both timesteps and the resolved proton-transfer sequence',async()=>{
  const {loader}=bundledLoader();const {runs}=await loader.loadPreset('aluminum');
  for(const run of runs){
    const xyz=run.xyz,dt=run.key.endsWith('dt05')?0.5:1;
    assert.equal(xyz.elements.length,23);assert.equal(xyz.elements[0],'Al');
    assert.equal(xyz.elements[7],'O');assert.equal(xyz.elements[9],'H');assert.equal(xyz.elements[19],'N');
    assert.equal(xyz.frames.length,2000/dt+1);assert.equal(run.energy.rows.length,xyz.frames.length);
    assert.equal(xyz.frames[0].time,0);assert.equal(xyz.frames.at(-1).time,2000);
    assert.equal(run.out.metadata.normal,true);
    const distance=(c,a,b)=>Math.hypot(...c[a].map((v,k)=>v-c[b][k]));
    const changes=[];let last='O';
    for(const frame of xyz.frames){
      const host=distance(frame.coords,9,7)<distance(frame.coords,9,19)?'O':'N';
      if(host!==last){changes.push(frame.time);last=host;}
      assert.ok(distance(frame.coords,0,19)>4,'No direct Al-N coordination in this reference');
    }
    assert.deepEqual(changes,dt===0.5?[147,154.5,163.5,172,178.5]:[148,155,164,173,178]);
    assert.equal(last,'N');assert.ok(distance(xyz.frames.at(-1).coords,9,19)<1.1);
  }
});

test('a preset is not returned partially; a failed run can be retried without reloading its successful partner',async()=>{
  const store={presets:{complex:{runs:['wall','no_wall']}},sources:{wall:{src:'wall.js'},no_wall:{src:'no_wall.js'}},runs:{}};
  const requests=[];let fail=true;
  const loader=createLoader(store,{loadScript:async src=>{
    requests.push(src);const key=src.replace('.js','');
    if(key==='no_wall'&&fail)throw new Error('network unavailable');
    store.runs[key]=simpleRun(key);
  }});
  await assert.rejects(loader.loadPreset('complex'),/network unavailable/);
  assert.ok(store.runs.wall);assert.equal(store.runs.no_wall,undefined);
  fail=false;const loaded=await loader.loadPreset('complex');
  assert.equal(loaded.runs.length,2);
  assert.deepEqual(requests,['wall.js','no_wall.js','no_wall.js']);
});

test('missing or malformed script registration gives an error and allows another attempt',async()=>{
  const store={presets:{one:{runs:['one']}},sources:{one:{src:'one.js'}},runs:{}};
  let attempt=0;
  const loader=createLoader(store,{loadScript:async()=>{attempt++;if(attempt===2)store.runs.one={...simpleRun('one'),xyz:{elements:['H'],frames:[]}};if(attempt===3)store.runs.one=simpleRun('one');}});
  await assert.rejects(loader.loadPreset('one'),/incompleto/);
  await assert.rejects(loader.loadPreset('one'),/trajetória.*incompleta/);
  assert.equal((await loader.loadPreset('one')).runs[0].key,'one');
  await assert.rejects(loader.loadPreset('missing'),/não foi encontrado/);
});

test('browser transport uses ordinary scripts, removes failed elements, and permits retry',async()=>{
  const scripts=[],timers=new Map();let timerId=0;
  const context=vm.createContext({
    AIMD_EXAMPLES:{presets:{one:{runs:['one']}},sources:{one:{src:'examples/one.js'}},runs:{}},
    document:{createElement:tag=>({tag,remove(){this.removed=true;}}),head:{append:script=>scripts.push(script)}},
    setTimeout:callback=>{timers.set(++timerId,callback);return timerId;},clearTimeout:id=>timers.delete(id)
  });
  vm.runInContext(read('example-loader.js'),context);
  const first=context.AIMDExampleLoader.loadPreset('one');
  await Promise.resolve();assert.equal(scripts[0].tag,'script');assert.equal(scripts[0].src,'examples/one.js');
  scripts[0].onerror();await assert.rejects(first,/Não foi possível ler/);
  assert.equal(scripts[0].removed,true);assert.equal(timers.size,0);
  const second=context.AIMDExampleLoader.loadPreset('one');await Promise.resolve();
  context.AIMD_EXAMPLES.runs.one=simpleRun('one');scripts[1].onload();
  assert.equal((await second).runs[0].key,'one');assert.equal(scripts[1].removed,true);
});

test('a timed out browser script rejects instead of keeping the loading state forever',async()=>{
  let timeout,script;
  const context=vm.createContext({
    AIMD_EXAMPLES:{presets:{one:{runs:['one']}},sources:{one:{src:'one.js'}},runs:{}},
    document:{createElement:()=>({remove(){this.removed=true;}}),head:{append:value=>{script=value;}}},
    setTimeout:callback=>{timeout=callback;return 1;},clearTimeout:()=>{}
  });
  vm.runInContext(read('example-loader.js'),context);
  const request=context.AIMDExampleLoader.loadPreset('one');await Promise.resolve();timeout();
  await assert.rejects(request,/demorou demais/);assert.equal(script.removed,true);
});
