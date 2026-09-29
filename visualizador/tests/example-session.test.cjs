/* App lifecycle tests use a small DOM double; actual WebGL is checked in-browser. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const OrcaReader=require('../orca-parser.js'),Geometry=require('../geometry.js');
const viewer=path.resolve(__dirname,'..');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
class Element{
  constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.dataset={};this.attributes={};this.value='';this.hidden=false;this.checked=false;this.innerHTML='';this.textContent='';this.classList={add(){},remove(){},toggle(){}};}
  addEventListener(type,callback){this.listeners[type]=callback;}
  fire(type,event={}){return this.listeners[type]?.(event);}
  setAttribute(key,value){this.attributes[key]=value;}
  replaceChildren(...children){this.children=[];this.innerHTML='';this.textContent='';if(this.tag==='select')this.value='';this.append(...children);}
  append(...children){for(const child of children){this.children.push(child);if(this.tag==='select'&&this.value==='')this.value=child.value;}}
  get options(){return this.children;}
  set innerHTML(html){
    this.html=html;this.controls=[];
    for(const match of html.matchAll(/<(input|button)\b([^>]*\bdata-(run|remove)="(\d+)"[^>]*)>/g)){
      const control=new Element(match[1]);control.dataset[match[3]]=match[4];control.checked=/\bchecked\b/.test(match[2]);this.controls.push(control);
    }
  }
  get innerHTML(){return this.html;}
  set value(value){this.selectedValue=String(value);}
  get value(){return this.selectedValue;}
  querySelectorAll(selector){return this.controls.filter(control=>selector==='[data-run]'?control.dataset.run:selector==='[data-remove]'?control.dataset.remove:false);}
  scrollIntoView(){}
}
function session(){
  const html=fs.readFileSync(path.join(viewer,'index.html'),'utf8'),nodes={};
  for(const match of html.matchAll(/<([\w-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g))nodes[match[2]]=new Element(match[1]);
  for(const [id,value] of Object.entries({'energy-mode':'delta','energy-unit':'kj','time-unit':'fs','distance-source':'xyz','geometry-type':'distance'}))nodes[id].value=value;
  nodes['distance-source'].append(...['xyz','colvars'].map(value=>Object.assign(new Element('option'),{value})));
  const checkboxes=['total','potential','kinetic'].map(value=>Object.assign(new Element('input'),{value,checked:true}));
  const tabs=['energy','trajectory','distance'].map(tab=>Object.assign(nodes['tab-'+tab],{dataset:{tab}}));
  const card=new Element(),requests=[],cancelled=[];
  const context=vm.createContext({
    console,URLSearchParams,location:{search:''},OrcaReader,Geometry,
    chartNumber:value=>String(value),ScientificChart:class{constructor(node,options){node.chart=options;}},
    cancelAnimationFrame(id){cancelled.push(id);},requestAnimationFrame(){return 1;},setTimeout,clearTimeout,
    document:{body:new Element('body'),getElementById:id=>nodes[id],createElement:tag=>new Element(tag),addEventListener(){},
      querySelector:selector=>selector==='.example-card'?card:null,
      querySelectorAll:selector=>selector==='[data-tab]'?tabs:selector==='[name="energy-series"]:checked'?checkboxes.filter(box=>box.checked):selector==='[name="energy-series"]'?checkboxes:[]},
    addEventListener(){},AIMDExampleLoader:{loadPreset:key=>{const pending=deferred();requests.push({key,...pending});return pending.promise;}}
  });
  context.window=context;
  vm.runInContext(fs.readFileSync(path.join(viewer,'app.js'),'utf8'),context);
  const choose=(key,trajectory=false)=>{nodes['example-select'].value=key;return nodes[trajectory?'example-trajectory-button':'example-button'].fire('click');};
  const toggle=(index,checked)=>{const box=nodes.runs.querySelectorAll('[data-run]')[index];box.checked=checked;box.fire('change');};
  const remove=index=>nodes.runs.querySelectorAll('[data-remove]')[index].fire('click');
  return {nodes,requests,choose,toggle,remove,cancelled};
}
function preset(key,{staticOnly=false}={}){
  const xyz={elements:['O','H'],frames:[{time:0,step:0,coords:[[0,0,0],[0,0,1]]}],warnings:[]};
  const run={key,label:key,files:[],warnings:[],xyz};
  if(!staticOnly)run.energy={rows:[{time:0,step:0,total:-1,potential:-1.1,kinetic:.1,temperature:300}],warnings:[]};
  return {config:{runs:[key]},runs:[run]};
}

test('a slower earlier preset cannot overwrite the newer selection',async()=>{
  const ui=session(),first=ui.choose('old'),second=ui.choose('new');
  ui.requests[1].resolve(preset('new'));await second;
  assert.match(ui.nodes.runs.innerHTML,/<strong>new<\/strong>/);
  ui.requests[0].resolve(preset('old'));await first;
  assert.match(ui.nodes.runs.innerHTML,/<strong>new<\/strong>/);
  assert.doesNotMatch(ui.nodes.runs.innerHTML,/<strong>old<\/strong>/);
  assert.equal(ui.nodes['example-load-status'].hidden,true);
});

test('loading failure preserves the previous selection and retry opens the requested one',async()=>{
  const ui=session(),first=ui.choose('previous');ui.requests[0].resolve(preset('previous'));await first;
  const pending=ui.choose('complex');
  assert.match(ui.nodes.runs.innerHTML,/<strong>previous<\/strong>/);
  ui.requests[1].reject(new Error('network unavailable'));await pending;
  assert.match(ui.nodes.runs.innerHTML,/<strong>previous<\/strong>/);
  assert.equal(ui.nodes['example-retry'].hidden,false);
  const retry=ui.nodes['example-retry'].fire('click');
  assert.equal(ui.requests[2].key,'complex');ui.requests[2].resolve(preset('complex'));await retry;
  // The event callback intentionally does not return its inner async load.
  await new Promise(setImmediate);
  assert.match(ui.nodes.runs.innerHTML,/<strong>complex<\/strong>/);
  assert.equal(ui.nodes['example-retry'].hidden,true);
});

test('clearing the session cancels a pending preset without resurrecting it later',async()=>{
  const ui=session(),load=ui.choose('complex');ui.nodes['clear-button'].fire('click');
  ui.requests[0].resolve(preset('complex'));await load;
  assert.equal(ui.nodes.workspace.hidden,true);
  assert.match(ui.nodes.message.textContent,/Sessão limpa/);
  assert.equal(ui.nodes['example-load-status'].hidden,true);
});

test('an upload during preset loading cancels the preset and remains selected',async()=>{
  const ui=session(),load=ui.choose('complex');
  await ui.nodes['file-input'].fire('change',{target:{files:[{name:'my-water.xyz',size:35,text:async()=>'2\nmy structure\nO 0 0 0\nH 0 0 1\n'}]}});
  ui.requests[0].resolve(preset('complex'));await load;
  assert.match(ui.nodes.runs.innerHTML,/my-water/);
  assert.doesNotMatch(ui.nodes.runs.innerHTML,/<strong>complex<\/strong>/);
  assert.equal(ui.nodes['trajectory-run'].options.length,1);
});

test('a ready preset selects its reference before rendering while retaining uploads',async()=>{
  const ui=session();
  await ui.nodes['file-input'].fire('change',{target:{files:[{name:'upload.xyz',size:30,text:async()=>'2\nmy structure\nO 0 0 0\nH 0 0 1\n'}]}});
  const load=ui.choose('complex',true);ui.requests[0].resolve(preset('complex'));await load;
  assert.match(ui.nodes.runs.innerHTML,/upload/);
  assert.equal(ui.nodes['trajectory-run'].options.length,1);
  assert.equal(ui.nodes['trajectory-run'].value,ui.nodes['trajectory-run'].options[0].value);
  assert.equal(ui.nodes['distance-run'].value,ui.nodes['distance-run'].options[0].value);
});

test('static SOLVATOR explains the absence of animation and energy',async()=>{
  const ui=session(),load=ui.choose('solvator');ui.requests[0].resolve(preset('solvator',{staticOnly:true}));await load;
  assert.match(ui.nodes.message.textContent,/não contém uma dinâmica/);
  assert.equal(ui.nodes['energy-content'].hidden,true);
  assert.equal(ui.nodes['energy-empty'].hidden,false);
});

async function comparison(){
  const ui=session(),load=ui.choose('complex',true),runs=['with-wall','without-wall'].map(key=>preset(key).runs[0]);
  runs[0].xyz.frames.push({...runs[0].xyz.frames[0],time:1,step:1});
  ui.requests[0].resolve({config:{runs:runs.map(run=>run.key)},runs});await load;return ui;
}

test('unchecking the displayed complex selects the remaining run in all three tabs',async()=>{
  const ui=await comparison();ui.toggle(0,false);
  for(const id of ['trajectory-run','distance-run']){
    assert.equal(ui.nodes[id].options.length,1);
    assert.equal(ui.nodes[id].options[0].textContent,'without-wall');
    assert.equal(ui.nodes[id].value,ui.nodes[id].options[0].value);
  }
  ui.nodes['tab-energy'].fire('click');
  assert.match(ui.nodes['time-summary'].textContent,/without-wall/);
  assert.doesNotMatch(ui.nodes['time-summary'].textContent,/with-wall/);
  ui.toggle(0,true);
  assert.equal(ui.nodes['trajectory-run'].value,ui.nodes['trajectory-run'].options[1].value);
});

test('unchecking all clears each panel and rechecking restores the available selection',async()=>{
  const ui=await comparison();ui.toggle(0,false);ui.toggle(1,false);
  assert.equal(ui.nodes['trajectory-run'].value,'');
  assert.equal(ui.nodes['trajectory-run'].disabled,true);
  assert.equal(ui.nodes['trajectory-content'].hidden,true);
  assert.equal(ui.nodes['play-button'].disabled,true);
  assert.match(ui.nodes['trajectory-empty'].innerHTML,/Marque uma simulação/);
  ui.nodes['tab-distance'].fire('click');
  assert.equal(ui.nodes['distance-content'].hidden,true);
  assert.equal(ui.nodes['export-distance'].disabled,true);
  assert.match(ui.nodes['distance-empty'].innerHTML,/Marque uma simulação/);
  ui.nodes['tab-energy'].fire('click');
  assert.equal(ui.nodes['energy-content'].hidden,true);
  assert.equal(ui.nodes['export-energy'].disabled,true);
  assert.match(ui.nodes['energy-empty'].innerHTML,/Marque uma simulação/);
  ui.toggle(1,true);
  assert.equal(ui.nodes['trajectory-run'].options[0].textContent,'without-wall');
  assert.equal(ui.nodes['energy-content'].hidden,false);
});

test('selection changes cancel active playback before switching to a shorter trajectory',async()=>{
  const ui=await comparison();ui.nodes['play-button'].fire('click');
  assert.equal(ui.nodes['play-button'].textContent,'Ⅱ Pausar');
  ui.toggle(0,false);
  assert.equal(ui.nodes['play-button'].textContent,'▶ Reproduzir');
  assert.deepEqual(ui.cancelled,[1]);
  assert.equal(ui.nodes['trajectory-run'].options[0].textContent,'without-wall');
});

test('removing another run preserves the selection; removing the selected run falls back',async()=>{
  const ui=await comparison();ui.nodes['trajectory-run'].value=ui.nodes['trajectory-run'].options[1].value;
  ui.remove(0);
  assert.equal(ui.nodes['trajectory-run'].value,ui.nodes['trajectory-run'].options[0].value);
  assert.equal(ui.nodes['trajectory-run'].options[0].textContent,'without-wall');
  const second=await comparison();second.remove(0);
  assert.equal(second.nodes['trajectory-run'].options[0].textContent,'without-wall');
});

test('a new XYZ stays selected even when four other simulations were selected',async()=>{
  const ui=session();
  for(let i=0;i<5;i++)await ui.nodes['file-input'].fire('change',{target:{files:[{name:`upload${i}.xyz`,size:30,text:async()=>'2\nstructure\nO 0 0 0\nH 0 0 1\n'}]}});
  const selected=ui.nodes['trajectory-run'];
  assert.equal(selected.options.length,4);
  assert.equal(selected.options.find(option=>option.value===selected.value).textContent,'upload4');
  assert.equal(ui.nodes.runs.querySelectorAll('[data-run]').length,5);
  assert.equal(ui.nodes.runs.querySelectorAll('[data-run]').filter(box=>box.checked).length,4);
});

test('an XYZ added to a previously unchecked energy run reactivates that run',async()=>{
  const ui=session();
  await ui.nodes['file-input'].fire('change',{target:{files:[{name:'sample-md-ener.csv',size:50,text:async()=>'# Step; Sim. Time; E_Tot\n0;0;-1\n1;.5;-0.9\n'}]}});
  ui.toggle(0,false);
  await ui.nodes['file-input'].fire('change',{target:{files:[{name:'sample-traj.xyz',size:30,text:async()=>'2\nstructure\nO 0 0 0\nH 0 0 1\n'}]}});
  assert.equal(ui.nodes.runs.querySelectorAll('[data-run]').length,1);
  assert.equal(ui.nodes.runs.querySelectorAll('[data-run]')[0].checked,true);
  assert.equal(ui.nodes['trajectory-run'].options[0].textContent,'sample');
  assert.equal(ui.nodes['trajectory-run'].value,ui.nodes['trajectory-run'].options[0].value);
});
