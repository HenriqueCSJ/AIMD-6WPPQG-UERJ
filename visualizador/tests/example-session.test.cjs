/* App lifecycle tests use a small DOM double; actual WebGL is checked in-browser. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const OrcaReader=require('../orca-parser.js'),Geometry=require('../geometry.js'),HighlightSelection=require('../highlight-selection.js');
const {timeIndex}=require('../charts.js');
const viewer=path.resolve(__dirname,'..');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
class Element{
  constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.dataset={};this.attributes={};this.value='';this.hidden=false;this.checked=false;this.inert=false;this.isConnected=true;this.tabIndex=['button','input','select','textarea','a'].includes(tag)?0:-1;this.innerHTML='';this.textContent='';this.style={removeProperty(key){delete this[key];}};const classes=new Set();this.classList={add:value=>classes.add(value),remove:value=>classes.delete(value),contains:value=>classes.has(value),toggle(value,force){const on=force??!classes.has(value);if(on)classes.add(value);else classes.delete(value);return on;}};}
  addEventListener(type,callback){this.listeners[type]=callback;}
  fire(type,event={}){return this.listeners[type]?.(event);}
  setAttribute(key,value){this.attributes[key]=value;}
  getAttribute(key){return this.attributes[key]??null;}
  removeAttribute(key){delete this.attributes[key];}
  focus(){if(this.ownerDocument)this.ownerDocument.activeElement=this;}
  getClientRects(){for(let node=this;node;node=node.parentElement)if(node.hidden||node.inert)return [];return [{}];}
  replaceChildren(...children){this.children=[];this.innerHTML='';this.textContent='';if(this.tag==='select')this.value='';this.append(...children);}
  append(...children){for(const child of children){this.children.push(child);child.parentElement=this;if(this.tag==='select'&&this.value==='')this.value=child.value;}}
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
  querySelectorAll(selector){if(selector==='a[href],button,input,select,textarea,[tabindex]'){const found=[];for(const child of this.children){if(child.tabIndex>=0)found.push(child);found.push(...child.querySelectorAll(selector));}return found;}return this.controls.filter(control=>selector==='[data-run]'?control.dataset.run:selector==='[data-remove]'?control.dataset.remove:false);}
  scrollIntoView(){}
}
function session({inspectState=false,search='?exemplo=__test_no_auto__'}={}){
  const html=fs.readFileSync(path.join(viewer,'index.html'),'utf8'),nodes={};
  for(const match of html.matchAll(/<([\w-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g))nodes[match[2]]=new Element(match[1]);
  for(const [id,value] of Object.entries({'energy-mode':'delta','energy-unit':'kj','time-unit':'fs','distance-source':'xyz','geometry-type':'distance','highlight-kind':'atom','highlight-color':'#e6007e','highlight-size':'1.6','highlight-atom':'0','playback-duration':'60','playback-speed':'1'}))nodes[id].value=value;
  nodes['distance-source'].append(...['xyz','colvars'].map(value=>Object.assign(new Element('option'),{value})));
  const checkboxes=['total','potential','kinetic'].map(value=>Object.assign(new Element('input'),{value,checked:true}));
  for(const key of ['kinetic','potential','total'])nodes['trajectory-show-'+key].checked=true;
  const tabs=['energy','trajectory','distance'].map(tab=>Object.assign(nodes['tab-'+tab],{dataset:{tab}}));
  const card=new Element(),playbackNote=new Element(),requests=[],cancelled=[],documentListeners={},animationFrames=new Map();let animationId=0;
  const animationTick=timestamp=>{const callbacks=[...animationFrames.values()];animationFrames.clear();for(const callback of callbacks)callback(timestamp);};
  class RendererDouble{
    constructor(node,options){this.node=node;this.options=options;this.currentTime=null;node.chart=options;node.chartRenderer=this;}
    setCursorX(value){this.currentTime=value;this.node.chartCursor=value;}
  }
  const context=vm.createContext({
    console,URLSearchParams,location:{search},OrcaReader,Geometry,HighlightSelection,TrajectoryTime:{index:timeIndex},
    chartNumber:value=>String(value),ScientificChart:RendererDouble,
    cancelAnimationFrame(id){cancelled.push(id);animationFrames.delete(id);},requestAnimationFrame(callback){const id=++animationId;animationFrames.set(id,callback);return id;},setTimeout,clearTimeout,
    document:{body:new Element('body'),getElementById:id=>nodes[id],createElement:tag=>new Element(tag),addEventListener(type,callback){documentListeners[type]=callback;},
      querySelector:selector=>selector==='.example-card'?card:selector==='.playback-note'?playbackNote:null,
      querySelectorAll:selector=>selector==='[data-tab]'?tabs:selector==='[name="energy-series"]:checked'?checkboxes.filter(box=>box.checked):selector==='[name="energy-series"]'?checkboxes:[]},
    addEventListener(){},AIMD_EXAMPLES:{presets:{water:true}},AIMDExampleLoader:{loadPreset:key=>{const pending=deferred();requests.push({key,...pending});return pending.promise;}}
  });
  context.window=context;
  for(const node of Object.values(nodes))node.ownerDocument=context.document;context.document.body.ownerDocument=context.document;
  nodes.molecule.tabIndex=0;
  let source=fs.readFileSync(path.join(viewer,'app.js'),'utf8');
  // A test-only bridge supplies a renderer double without creating WebGL.
  if(inspectState)source=source.replace(/\}\)\(\);\s*$/,'globalThis.__testState=state;globalThis.__testHighlights={drawHighlights,selectTrajectoryAtom};globalThis.__testTrajectory={renderTrajectoryChart,updateTrajectoryCursor};})();');
  vm.runInContext(source,context);
  // Preserve the old helper meaning: `true` opens Trajectory 3D through the
  // primary action, while the default opens the explicit energy comparison.
  const choose=(key,trajectory=false)=>{nodes['example-select'].value=key;return nodes[trajectory?'example-button':'example-energy-button'].fire('click');};
  const toggle=(index,checked)=>{const box=nodes.runs.querySelectorAll('[data-run]')[index];box.checked=checked;box.fire('change');};
  const remove=index=>nodes.runs.querySelectorAll('[data-remove]')[index].fire('click');
  return {html,nodes,requests,choose,toggle,remove,cancelled,animationTick,playbackNote,document:context.document,key:event=>documentListeners.keydown(event),state:context.__testState,highlightHooks:context.__testHighlights,trajectoryHooks:context.__testTrajectory};
}
function preset(key,{staticOnly=false,frames,energyRows}={}){
  const xyz={elements:['O','H'],frames:frames||[{time:0,step:0,coords:[[0,0,0],[0,0,1]]}],warnings:[]};
  const run={key,label:key,files:[],warnings:[],xyz};
  if(!staticOnly)run.energy={rows:energyRows||[{time:0,step:0,total:-1,potential:-1.1,kinetic:.1,temperature:300}],warnings:[]};
  return {config:{runs:[key]},runs:[run]};
}

test('the trajectory tab is first and a no-query laboratory opens water in trajectory mode',async()=>{
  const ui=session({search:'',inspectState:true});
  assert.ok(ui.html.indexOf('id="tab-trajectory"')<ui.html.indexOf('id="tab-energy"'));
  assert.equal(ui.requests.length,1);assert.equal(ui.requests[0].key,'water');
  const load=ui.requests[0].promise;ui.requests[0].resolve(preset('water'));await load;await new Promise(setImmediate);
  assert.equal(ui.state.tab,'trajectory');assert.equal(ui.nodes['trajectory-run'].options.length,1);
});

test('the main example action defaults to trajectory while explicit tabs remain respected',async()=>{
  const trajectory=session({inspectState:true}),trajectoryLoad=trajectory.choose('water',true);
  trajectory.requests[0].resolve(preset('water'));await trajectoryLoad;
  assert.equal(trajectory.state.tab,'trajectory');
  for(const [search,expected] of [['?exemplo=water&aba=energias','energy'],['?exemplo=water&aba=geometria','distance']]){
    const ui=session({search,inspectState:true}),load=ui.requests[0].promise;
    assert.equal(ui.requests[0].key,'water');ui.requests[0].resolve(preset('water'));await load;await new Promise(setImmediate);
    assert.equal(ui.state.tab,expected);
  }
});

test('the primary example action falls back to energy when the preset has no XYZ',async()=>{
  const ui=session({inspectState:true}),load=ui.choose('energy-only',true);
  ui.requests[0].resolve({config:{runs:['energy-only']},runs:[{key:'energy-only',label:'energy-only',files:[],warnings:[],energy:{rows:[{time:0,step:0,total:-1,potential:-1.1,kinetic:.1,temperature:300}],warnings:[]}}]});
  await load;assert.equal(ui.state.tab,'energy');
});

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

test('a CSV without its own XYZ stays in energy mode beside a reference trajectory',async()=>{
  const ui=session({inspectState:true}),example=ui.choose('water',true);
  ui.requests[0].resolve(preset('water'));await example;
  assert.ok(ui.state.runs.some(run=>run.reference&&run.xyz));
  await ui.nodes['file-input'].fire('change',{target:{files:[{name:'water-md-ener.csv',size:50,text:async()=>'# Step; Sim. Time; E_Tot\n0;0;-1\n1;.5;-.9\n'}]}});
  const upload=ui.state.runs.find(run=>!run.reference);
  assert.ok(upload?.energy);
  assert.equal(upload?.xyz,undefined);
  assert.equal(ui.state.tab,'energy');
});

function expandedSession(){
  const ui=session(),panel=ui.nodes['panel-trajectory'],workspace=ui.nodes.workspace,background=ui.nodes['clear-button'],previouslyInert=new Element();
  previouslyInert.inert=true;
  ui.document.body.append(ui.nodes['upload-button'],workspace,previouslyInert);
  workspace.append(background,panel);
  panel.append(ui.nodes['trajectory-run'],ui.nodes['expand-trajectory'],ui.nodes.molecule,ui.nodes['goto-distances']);
  ui.nodes['expand-trajectory'].focus();ui.nodes['expand-trajectory'].fire('click');
  return {...ui,panel,background,previouslyInert};
}

test('expanded view contains keyboard focus and Escape restores focus and previous inert states',()=>{
  const ui=expandedSession();let prevented=0;
  assert.equal(ui.background.inert,true);assert.equal(ui.nodes['upload-button'].inert,true);
  assert.equal(ui.panel.getAttribute('role'),'dialog');assert.equal(ui.panel.getAttribute('aria-modal'),'true');
  ui.nodes['goto-distances'].focus();ui.key({key:'Tab',preventDefault(){prevented++;}});
  assert.equal(ui.document.activeElement,ui.nodes['trajectory-run']);
  ui.key({key:'Tab',shiftKey:true,preventDefault(){prevented++;}});
  assert.equal(ui.document.activeElement,ui.nodes['goto-distances']);assert.equal(prevented,2);
  ui.key({key:'Escape',preventDefault(){}});
  assert.equal(ui.document.activeElement,ui.nodes['expand-trajectory']);
  assert.equal(ui.background.inert,false);assert.equal(ui.nodes['upload-button'].inert,false);assert.equal(ui.previouslyInert.inert,true);
  assert.equal(ui.document.body.classList.contains('trajectory-open'),false);assert.equal(ui.panel.getAttribute('role'),'tabpanel');assert.equal(ui.panel.getAttribute('aria-modal'),null);
});

test('clearing an expanded session unlocks scrolling, restores the background, and focuses upload',()=>{
  const ui=expandedSession();ui.nodes['clear-button'].fire('click');
  assert.equal(ui.nodes.workspace.hidden,true);assert.equal(ui.document.body.classList.contains('trajectory-open'),false);
  assert.equal(ui.panel.classList.contains('trajectory-expanded'),false);assert.equal(ui.nodes['expand-trajectory'].getAttribute('aria-expanded'),'false');
  assert.equal(ui.background.inert,false);assert.equal(ui.document.activeElement,ui.nodes['upload-button']);
});

test('Mover focuses the canvas and arrow keys pan without changing frame or allowing browser shortcuts',()=>{
  const ui=session({inspectState:true}),moves=[];let prevented=0;
  ui.state.viewer={translateScene:(x,y)=>moves.push([x,y])};ui.state.frame=7;
  const key=(key,extra={})=>ui.nodes.molecule.fire('keydown',{key,preventDefault(){prevented++;},stopPropagation(){},...extra});
  key('ArrowRight');assert.equal(moves.length,0);
  ui.nodes['pan-molecule'].fire('click');assert.equal(ui.document.activeElement,ui.nodes.molecule);
  key('ArrowRight');key('ArrowUp',{shiftKey:true});key('ArrowLeft',{altKey:true});key('ArrowDown',{ctrlKey:true});key('ArrowLeft',{metaKey:true});
  assert.deepEqual(moves,[[12,0],[0,-40]]);assert.equal(prevented,2);assert.equal(ui.state.frame,7);
  ui.nodes['rotate-molecule'].fire('click');key('ArrowDown');assert.equal(moves.length,2);
});

test('a highlighted molecule retains its atom identities when a hydrogen changes neighbor',async()=>{
  const ui=session({inspectState:true}),data=preset('reactive-water');
  data.runs[0].xyz={elements:['O','H','H','O','H','H'],frames:[
    {time:0,coords:[[0,0,0],[.96,0,0],[-.24,.93,0],[3,0,0],[3.96,0,0],[3.24,.93,0]]},
    {time:1,coords:[[0,0,0],[2.04,0,0],[-.24,.93,0],[3,0,0],[3.96,0,0],[3.24,.93,0]]}
  ],warnings:[]};
  const original=JSON.stringify(data.runs[0].xyz),pending=ui.choose('reactive-water',true);ui.requests[0].resolve(data);await pending;
  ui.nodes['highlight-kind'].value='molecule';ui.nodes['highlight-atom'].value='0';ui.nodes['highlight-add'].fire('click');
  const run=ui.state.runs[0];assert.deepEqual(Array.from(run.highlights[0].indices),[0,1,2]);
  ui.state.frame=1;
  const calls=[];ui.state.model={setStyle:(selection,style)=>calls.push({selection,style})};
  const map=ui.highlightHooks.drawHighlights(run,run.xyz.elements.map(elem=>({elem})));
  assert.equal(map.get(1),'#e6007e');assert.equal(map.has(3),false);
  assert.equal(calls.find(call=>call.selection.index===1).style.sphere.color,'#e6007e');
  assert.deepEqual(Array.from(run.highlights[0].indices),[0,1,2]);assert.equal(JSON.stringify(data.runs[0].xyz),original);
});

test('colors are isolated per simulation; recoloring replaces a selection and clearing restores the base display',async()=>{
  const ui=session({inspectState:true}),pending=ui.choose('pair',true);
  ui.requests[0].resolve({config:{runs:['one','two']},runs:[preset('one').runs[0],preset('two').runs[0]]});await pending;
  ui.nodes['highlight-atom'].value='1';ui.nodes['highlight-add'].fire('click');
  const [first,second]=ui.state.runs;assert.equal(first.highlights.length,1);assert.equal(second.highlights,undefined);
  ui.nodes['highlight-color'].value='#009dcc';ui.nodes['highlight-add'].fire('click');
  assert.equal(first.highlights.length,1);assert.equal(first.highlights[0].color,'#009dcc');
  ui.nodes['trajectory-run'].value=String(second.id);ui.nodes['highlight-atom'].value='0';ui.nodes['highlight-add'].fire('click');
  assert.deepEqual(Array.from(second.highlights[0].indices),[0]);assert.deepEqual(Array.from(first.highlights[0].indices),[1]);
  ui.nodes['highlight-clear'].fire('click');assert.equal(second.highlights.length,0);assert.equal(first.highlights.length,1);
  assert.match(ui.nodes['highlight-status'].textContent,/Cores originais restauradas/);
});

test('invalid manual indices preserve an existing selection instead of applying a partial highlight',async()=>{
  const ui=session({inspectState:true}),pending=ui.choose('water',true);ui.requests[0].resolve(preset('water'));await pending;
  ui.nodes['highlight-atom'].value='1';ui.nodes['highlight-add'].fire('click');
  const run=ui.state.runs[0],original=JSON.stringify(run.highlights);
  ui.nodes['highlight-kind'].value='indices';ui.nodes['highlight-indices'].value='0,999';ui.nodes['highlight-add'].fire('click');
  assert.match(ui.nodes['highlight-status'].textContent,/fora dos limites/);assert.equal(JSON.stringify(run.highlights),original);
});

test('the shared-proton shortcut marks H2 only for the identified course reference',async()=>{
  const ui=session({inspectState:true}),data=preset('proton_shared');
  data.runs[0].xyz.elements=['O','O','H','H','H','H','H'];data.runs[0].xyz.frames[0].coords=Array.from({length:7},(_,i)=>[i,0,0]);
  const pending=ui.choose('proton_shared',true);ui.requests[0].resolve(data);await pending;
  ui.nodes['highlight-proton'].fire('click');assert.deepEqual(Array.from(ui.state.runs[0].highlights[0].indices),[2]);
  ui.state.runs[0].reference=false;ui.state.runs[0].highlights=[];ui.nodes['highlight-proton'].fire('click');
  assert.equal(ui.state.runs[0].highlights.length,0);
});

test('trajectory temperature is rendered from T alone, preserving gaps and segments',async()=>{
  const frames=[
    {time:0,step:0,segment:0,coords:[[0,0,0],[0,0,1]]},
    {time:.8,step:1,segment:0,coords:[[0,0,0],[0,0,1]]},
    {time:1.2,step:2,segment:1,coords:[[0,0,0],[0,0,1]]},
    {time:1.5,step:3,segment:1,coords:[[0,0,0],[0,0,1]]}
  ];
  const energyRows=[
    {time:0,step:0,segment:0,temperature:300},
    {time:.8,step:1,segment:0,temperature:315},
    {time:1.2,step:2,segment:1,temperature:null},
    {time:1.5,step:3,segment:1,temperature:330}
  ];
  const ui=session({inspectState:true}),load=ui.choose('temperature-only',true);
  ui.requests[0].resolve(preset('temperature-only',{frames,energyRows}));await load;
  const run=ui.state.runs[0];ui.nodes['trajectory-temperature-mode'].value='delta';ui.trajectoryHooks.renderTrajectoryChart(run);
  const temperature=ui.nodes['trajectory-temperature-chart'].chart;
  assert.equal(ui.nodes['trajectory-energy-chart'].hidden,true);
  assert.equal(ui.nodes['trajectory-temperature-chart'].hidden,false);
  assert.equal(ui.state.hasTrajectoryTemperature,true);
  assert.equal(ui.state.temperatureIndex.exact(1.2,{step:2}),null);
  assert.ok(ui.state.trajectoryTemperatureChart);
  assert.equal(temperature.series.length,1);
  assert.deepEqual(temperature.series[0].points.map(point=>[point.x,point.y,point.segment]),[
    [0,0,0],[.8,15,0],[1.2,null,1],[1.5,30,1]
  ]);
  assert.equal(temperature.series[0].points.some(point=>point.y===0),true);
  assert.equal(run.energy.rows[2].temperature,null);
});

test('temperature and energy cursors match the same recorded time and step',async()=>{
  const frames=[
    {time:.25,step:1,segment:0,coords:[[0,0,0],[0,0,1]]},
    {time:.75,step:3,segment:0,coords:[[0,0,0],[0,0,1]]},
    {time:1.25,step:5,segment:1,coords:[[0,0,0],[0,0,1]]}
  ];
  const energyRows=[
    {time:.2,step:1,segment:0,total:-1,potential:-1.1,kinetic:.1,temperature:300},
    {time:.8,step:3,segment:0,total:-.9,potential:-1,kinetic:.1,temperature:310},
    {time:1.25,step:5,segment:1,total:-.8,potential:-.9,kinetic:.1,temperature:320}
  ];
  const ui=session({inspectState:true}),load=ui.choose('aligned',true);
  ui.requests[0].resolve(preset('aligned',{frames,energyRows}));await load;
  const run=ui.state.runs[0];ui.trajectoryHooks.renderTrajectoryChart(run);
  assert.equal(ui.state.temperatureIndex.exact(.75,{step:3}),run.energy.rows[1]);
  assert.equal(ui.state.energyIndex.exact(.75,{step:3}),run.energy.rows[1]);
  ui.state.frame=1;ui.trajectoryHooks.updateTrajectoryCursor(run);
  assert.equal(ui.state.trajectoryChart.currentTime,.75);
  assert.equal(ui.state.trajectoryTemperatureChart.currentTime,.75);
});

test('missing temperature leaves the energy chart usable without inventing zero values',async()=>{
  const energyRows=[
    {time:0,step:0,total:-1,potential:-1.1,kinetic:.1},
    {time:1,step:1,total:-.9,potential:-1,kinetic:.1}
  ];
  const ui=session({inspectState:true}),load=ui.choose('energy-only',true);
  ui.requests[0].resolve(preset('energy-only',{energyRows}));await load;
  const run=ui.state.runs[0];ui.trajectoryHooks.renderTrajectoryChart(run);
  assert.equal(ui.nodes['trajectory-energy-chart'].hidden,false);
  assert.equal(ui.nodes['trajectory-temperature-chart'].hidden,true);
  assert.equal(ui.nodes['trajectory-temperature-empty'].hidden,false);
  assert.match(ui.nodes['trajectory-temperature-status'].textContent,/temperatura/i);
  assert.equal(ui.state.hasTrajectoryTemperature,false);
  assert.equal(ui.state.temperatureIndex.exact(0,{step:0}),null);
  assert.equal(ui.state.trajectoryTemperatureChart,null);
  assert.ok(ui.nodes['trajectory-energy-chart'].chart.series[0].points.every(point=>Number.isFinite(point.y)));
});

async function playbackSession(){
  const ui=session({inspectState:true}),load=ui.choose('movement',true);
  const frames=Array.from({length:1000},(_,i)=>({time:i*.25,step:i,coords:[[0,0,0],[0,0,1+i*.0001]]}));
  ui.requests[0].resolve(preset('movement',{frames}));await load;return ui;
}

test('default playback takes sixty seconds per cycle and preserves original frame times',async()=>{
  const ui=await playbackSession(),before=ui.state.runs[0].xyz.frames.map(frame=>frame.time);
  assert.match(ui.html,/<option value="60" selected>60 s<\/option>/);
  assert.equal(ui.nodes['playback-duration'].disabled,false);
  assert.match(ui.playbackNote.textContent,/60 s de reprodução/);
  ui.nodes['play-button'].fire('click');ui.animationTick(1000);
  ui.animationTick(16000);assert.equal(ui.state.frame,250);
  ui.animationTick(61000);assert.equal(ui.state.frame,0);
  assert.deepEqual(ui.state.runs[0].xyz.frames.map(frame=>frame.time),before);
});

test('chosen duration is divided by the speed multiplier in both playback and its note',async()=>{
  const ui=await playbackSession();
  ui.nodes['playback-duration'].value='30';ui.nodes['playback-duration'].fire('change');
  ui.nodes['playback-speed'].value='2';ui.nodes['playback-speed'].fire('change');
  assert.match(ui.playbackNote.textContent,/15 s de reprodução/);
  ui.nodes['play-button'].fire('click');ui.animationTick(0);
  ui.animationTick(7500);assert.equal(ui.state.frame,500);
  ui.animationTick(15000);assert.equal(ui.state.frame,0);
});

test('changing duration or speed during playback retains phase and current frame',async()=>{
  const ui=await playbackSession();ui.nodes['play-button'].fire('click');ui.animationTick(0);
  ui.animationTick(15000);assert.equal(ui.state.frame,250);
  ui.nodes['playback-duration'].value='120';ui.nodes['playback-duration'].fire('change');
  assert.equal(ui.state.frame,250);assert.equal(ui.state.playback.phase,.25);assert.equal(ui.state.playing,true);
  assert.match(ui.playbackNote.textContent,/120 s de reprodução/);
  ui.animationTick(45000);assert.equal(ui.state.frame,500);
  ui.nodes['playback-speed'].value='2';ui.nodes['playback-speed'].fire('change');
  assert.equal(ui.state.frame,500);assert.equal(ui.state.playback.phase,.5);
  assert.match(ui.playbackNote.textContent,/60 s de reprodução/);
  ui.animationTick(75000);assert.equal(ui.state.frame,0);
});

test('static structures disable playback controls and explain why they do not animate',async()=>{
  const ui=session({inspectState:true}),load=ui.choose('solvator',true);
  ui.requests[0].resolve(preset('solvator',{staticOnly:true}));await load;
  for(const id of ['play-button','playback-duration','playback-speed'])assert.equal(ui.nodes[id].disabled,true);
  assert.equal(ui.playbackNote.textContent,'Estrutura estática: um único quadro.');
  ui.nodes['play-button'].fire('click');ui.animationTick(60000);
  assert.equal(ui.state.playing,false);assert.equal(ui.state.frame,0);
});
