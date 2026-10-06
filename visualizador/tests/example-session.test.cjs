/* App lifecycle tests use a small DOM double; actual WebGL is checked in-browser. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const OrcaReader=require('../orca-parser.js'),Geometry=require('../geometry.js'),HighlightSelection=require('../highlight-selection.js');
const {timeIndex}=require('../charts.js');
const viewer=path.resolve(__dirname,'..');
const inputFile=(name,text)=>new File([text],name);
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
  querySelector(selector){return this.children.find(child=>selector.startsWith('.')?child.className===selector.slice(1):selector.startsWith('#')?child.id===selector.slice(1):false)||null;}
  querySelectorAll(selector){if(selector==='a[href],button,input,select,textarea,[tabindex]'){const found=[];for(const child of this.children){if(child.tabIndex>=0)found.push(child);found.push(...child.querySelectorAll(selector));}return found;}return this.controls.filter(control=>selector==='[data-run]'?control.dataset.run:selector==='[data-remove]'?control.dataset.remove:false);}
  scrollIntoView(){}
}
function session({inspectState=false,search='?exemplo=__test_no_auto__',presets={water:true}}={}){
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
    addEventListener(){},AIMD_EXAMPLES:{presets},AIMDExampleLoader:{loadPreset:key=>{const pending=deferred();requests.push({key,...pending});return pending.promise;}}
  });
  context.window=context;
  for(const node of Object.values(nodes))node.ownerDocument=context.document;context.document.body.ownerDocument=context.document;
  nodes.molecule.tabIndex=0;
  let source=fs.readFileSync(path.join(viewer,'app.js'),'utf8');
  // A test-only bridge supplies a renderer double without creating WebGL.
  if(inspectState)source=source.replace(/\}\)\(\);\s*$/,'globalThis.__testExports={energyRows:energyExportRows};globalThis.__testState=state;globalThis.__testHighlights={drawHighlights,selectTrajectoryAtom};globalThis.__testTrajectory={renderTrajectoryChart,updateTrajectoryCursor};globalThis.__testRendering={drawFrame,clearTrajectoryScene,drawContactSuggestions};})();');
  vm.runInContext(source,context);
  // Preserve the old helper meaning: `true` opens Trajectory 3D through the
  // primary action, while the default opens the explicit energy comparison.
  const choose=(key,trajectory=false)=>{nodes['example-select'].value=key;return nodes[trajectory?'example-button':'example-energy-button'].fire('click');};
  const toggle=(index,checked)=>{const box=nodes.runs.querySelectorAll('[data-run]')[index];box.checked=checked;box.fire('change');};
  const remove=index=>nodes.runs.querySelectorAll('[data-remove]')[index].fire('click');
  return {html,nodes,requests,choose,toggle,remove,cancelled,animationTick,playbackNote,document:context.document,key:event=>documentListeners.keydown(event),state:context.__testState,exports:context.__testExports,highlightHooks:context.__testHighlights,trajectoryHooks:context.__testTrajectory,renderHooks:context.__testRendering};
}
function preset(key,{staticOnly=false,frames,energyRows}={}){
  const xyz={elements:['O','H'],frames:frames||[{time:0,step:0,coords:[[0,0,0],[0,0,1]]}],warnings:[]};
  const run={key,label:key,files:[],warnings:[],xyz};
  if(!staticOnly)run.energy={rows:energyRows||[{time:0,step:0,total:-1,potential:-1.1,kinetic:.1,temperature:300}],warnings:[]};
  return {config:{runs:[key]},runs:[run]};
}

test('oversized upload is rejected before reading and preserves the selected reference',async()=>{
  const ui=session({inspectState:true}),load=ui.choose('water',true);
  ui.requests[0].resolve(preset('water'));await load;
  let reads=0;
  await ui.nodes['file-input'].fire('change',{target:{files:[{name:'too-large.xyz',size:OrcaReader.MAX_FILE_BYTES+1,slice(){reads++;throw new Error('Must not read');}}]}});
  assert.equal(reads,0);assert.match(ui.nodes.message.textContent,/1 GB por arquivo/);
  assert.equal(ui.state.runs.length,1);assert.equal(ui.nodes['trajectory-run'].value,String(ui.state.runs[0].id));
  assert.equal(ui.state.busy,false);
});

test('the trajectory tab is first and a no-query laboratory opens isolated water in trajectory mode',async()=>{
  const ui=session({search:'',inspectState:true,presets:{water_single:true}});
  assert.ok(ui.html.indexOf('id="tab-trajectory"')<ui.html.indexOf('id="tab-energy"'));
  assert.equal(ui.requests.length,1);assert.equal(ui.requests[0].key,'water_single');
  const load=ui.requests[0].promise;ui.requests[0].resolve(preset('water_single'));await load;await new Promise(setImmediate);
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

test('linked variants keep valid reopen buttons without permanent menu entries',async()=>{
  for(const key of ['water_nve','water_csvr','solvator_two','proton_shared_short','water_short','ethanol_short','chelation_previous']){
    const ui=session({search:`?exemplo=${key}&aba=trajetoria`,inspectState:true,presets:{[key]:true}});
    assert.doesNotMatch(ui.html,new RegExp(`<option\\b[^>]*value="${key}"`));
    assert.equal(ui.requests.length,1);assert.equal(ui.requests[0].key,key);
    const load=ui.requests[0].promise;ui.requests[0].resolve(preset(key));await load;await new Promise(setImmediate);
    assert.equal(ui.state.tab,'trajectory');assert.equal(ui.nodes['trajectory-run'].options.length,1);
    assert.equal(ui.nodes['example-select'].value,key);
    const linked=ui.nodes['example-select'].options.find(option=>option.value===key);
    assert.equal(linked.hidden,true);
    assert.ok(linked.textContent);
    const reopen=ui.nodes['example-energy-button'].fire('click');
    assert.equal(ui.requests[1].key,key);
    ui.requests[1].resolve(preset(key));await reopen;
    assert.equal(ui.state.tab,'energy');

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
  await ui.nodes['file-input'].fire('change',{target:{files:[inputFile('my-water.xyz','2\nmy structure\nO 0 0 0\nH 0 0 1\n')]}});
  ui.requests[0].resolve(preset('complex'));await load;
  assert.match(ui.nodes.runs.innerHTML,/my-water/);
  assert.doesNotMatch(ui.nodes.runs.innerHTML,/<strong>complex<\/strong>/);
  assert.equal(ui.nodes['trajectory-run'].options.length,1);
});

test('a ready preset selects its reference before rendering while retaining uploads',async()=>{
  const ui=session();
  await ui.nodes['file-input'].fire('change',{target:{files:[inputFile('upload.xyz','2\nmy structure\nO 0 0 0\nH 0 0 1\n')]}});
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
  for(let i=0;i<5;i++)await ui.nodes['file-input'].fire('change',{target:{files:[inputFile(`upload${i}.xyz`,'2\nstructure\nO 0 0 0\nH 0 0 1\n')]}});
  const selected=ui.nodes['trajectory-run'];
  assert.equal(selected.options.length,4);
  assert.equal(selected.options.find(option=>option.value===selected.value).textContent,'upload4');
  assert.equal(ui.nodes.runs.querySelectorAll('[data-run]').length,5);
  assert.equal(ui.nodes.runs.querySelectorAll('[data-run]').filter(box=>box.checked).length,4);
});

test('an XYZ added to a previously unchecked energy run reactivates that run',async()=>{
  const ui=session();
  await ui.nodes['file-input'].fire('change',{target:{files:[inputFile('sample-md-ener.csv','# Step; Sim. Time; E_Tot\n0;0;-1\n1;.5;-0.9\n')]}});
  ui.toggle(0,false);
  await ui.nodes['file-input'].fire('change',{target:{files:[inputFile('sample-traj.xyz','2\nstructure\nO 0 0 0\nH 0 0 1\n')]}});
  assert.equal(ui.nodes.runs.querySelectorAll('[data-run]').length,1);
  assert.equal(ui.nodes.runs.querySelectorAll('[data-run]')[0].checked,true);
  assert.equal(ui.nodes['trajectory-run'].options[0].textContent,'sample');
  assert.equal(ui.nodes['trajectory-run'].value,ui.nodes['trajectory-run'].options[0].value);
});

test('a CSV without its own XYZ stays in energy mode beside a reference trajectory',async()=>{
  const ui=session({inspectState:true}),example=ui.choose('water',true);
  ui.requests[0].resolve(preset('water'));await example;
  assert.ok(ui.state.runs.some(run=>run.reference&&run.xyz));
  await ui.nodes['file-input'].fire('change',{target:{files:[inputFile('water-md-ener.csv','# Step; Sim. Time; E_Tot\n0;0;-1\n1;.5;-.9\n')]}});
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

test('the shared-proton shortcut marks H2 for both retained references and no other identity',async()=>{
  for(const key of ['proton_shared','proton_shared_10ps']){
    const ui=session({inspectState:true}),data=preset(key);
    data.runs[0].xyz.elements=['O','O','H','H','H','H','H'];data.runs[0].xyz.frames[0].coords=Array.from({length:7},(_,i)=>[i,0,0]);
    const pending=ui.choose(key,true);ui.requests[0].resolve(data);await pending;
    assert.equal(ui.nodes['highlight-proton'].hidden,false);
    ui.nodes['highlight-proton'].fire('click');assert.deepEqual(Array.from(ui.state.runs[0].highlights[0].indices),[2]);
    const run=ui.state.runs[0];run.highlights=[];run.reference=false;ui.nodes['highlight-proton'].fire('click');
    assert.equal(run.highlights.length,0);
    run.reference=true;run.key='another_h5o2';ui.nodes['highlight-proton'].fire('click');assert.equal(run.highlights.length,0);
    run.key=key;run.xyz.elements[2]='O';ui.nodes['highlight-proton'].fire('click');assert.equal(run.highlights.length,0);
  }
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

async function playbackSession(stages,{stride=1}={}){
  const ui=session({inspectState:true}),load=ui.choose('movement',true);
  const frames=Array.from({length:1000},(_,i)=>({time:i*.25,step:i,coords:[[0,0,0],[0,0,1+i*.0001]]}));
  const data=preset('movement',{frames:frames.filter((frame,i)=>i%stride===0||i===frames.length-1)});if(stages)data.runs[0].metadata={stages};
  if(stride>1)Object.assign(data.runs[0].xyz,{previewStride:stride,originalFrameCount:frames.length});
  ui.requests[0].resolve(data);await load;return ui;
}

test('stage playback defaults to full, loops only retained interval frames and preserves the physical clock',async()=>{
  const ui=await playbackSession([{startFs:0,endFs:49.75,label:'Hidratação'},{startFs:50,endFs:99.75,label:'Encontro'}]);
  assert.equal(ui.nodes['playback-interval'].value,'full');assert.equal(ui.nodes['playback-interval-field'].hidden,false);
  assert.equal(ui.nodes['playback-interval'].options.length,3);
  const before=JSON.stringify(ui.state.runs[0].xyz.frames);
  ui.nodes['playback-interval'].value='stage-1';ui.nodes['playback-interval'].fire('change');
  assert.equal(ui.state.frame,200);assert.equal(ui.state.playing,false);assert.match(ui.playbackNote.textContent,/Encontro/);
  ui.nodes['play-button'].fire('click');ui.animationTick(0);ui.animationTick(30000);
  assert.equal(ui.state.frame,300);assert.equal(ui.state.runs[0].xyz.frames[ui.state.frame].time,75);
  ui.animationTick(59999);assert.equal(ui.state.frame,399);ui.animationTick(60000);assert.equal(ui.state.frame,200);
  assert.equal(JSON.stringify(ui.state.runs[0].xyz.frames),before);
});

test('stage pause, manual whole-trajectory inspection, duration and interval changes stay within the selected range on replay',async()=>{
  const ui=await playbackSession([{startFs:50,endFs:99.75,label:'Encontro'},{startFs:100,endFs:149.75,label:'Continuação'}]);
  ui.nodes['playback-interval'].value='stage-0';ui.nodes['playback-interval'].fire('change');
  ui.nodes['play-button'].fire('click');ui.animationTick(0);ui.animationTick(15000);assert.equal(ui.state.frame,250);
  ui.nodes['play-button'].fire('click');ui.animationTick(45000);assert.equal(ui.state.frame,250);assert.equal(ui.state.playing,false);
  ui.nodes['play-button'].fire('click');ui.animationTick(45000);ui.animationTick(60000);assert.equal(ui.state.frame,300);
  ui.nodes['playback-duration'].value='30';ui.nodes['playback-duration'].fire('change');
  assert.equal(ui.state.frame,300);ui.animationTick(67500);assert.equal(ui.state.frame,350);
  ui.nodes['playback-interval'].value='stage-1';ui.nodes['playback-interval'].fire('change');
  assert.equal(ui.state.playing,false);assert.equal(ui.state.frame,400);ui.animationTick(97500);assert.equal(ui.state.frame,400);
  ui.nodes['frame-slider'].value='900';ui.nodes['frame-slider'].fire('input');assert.equal(ui.state.frame,900);
  ui.nodes['previous-frame'].fire('click');assert.equal(ui.state.frame,899);
  ui.nodes['play-button'].fire('click');assert.equal(ui.state.frame,400);ui.animationTick(100000);ui.animationTick(115000);assert.equal(ui.state.frame,500);
  ui.nodes['playback-interval'].value='full';ui.nodes['playback-interval'].fire('change');assert.equal(ui.state.frame,0);assert.equal(ui.state.playing,false);
});

test('stage playback on a sampled preview uses only existing frames inside the physical boundaries',async()=>{
  const ui=await playbackSession([{startFs:50.1,endFs:54.9,label:'Trecho entre amostras'}],{stride:5}),run=ui.state.runs[0];
  const before=JSON.stringify(run.xyz);
  assert.match(ui.playbackNote.textContent,/Prévia: 1 a cada 5 quadros/);
  ui.nodes['playback-interval'].value='stage-0';ui.nodes['playback-interval'].fire('change');
  assert.equal(run.xyz.frames[ui.state.frame].time,51.25);
  ui.nodes['play-button'].fire('click');ui.animationTick(0);ui.animationTick(20000);assert.equal(run.xyz.frames[ui.state.frame].time,52.5);
  ui.animationTick(40000);assert.equal(run.xyz.frames[ui.state.frame].time,53.75);
  ui.animationTick(60000);assert.equal(run.xyz.frames[ui.state.frame].time,51.25);
  assert.equal(JSON.stringify(run.xyz),before,'Preview frames and timestamps are never interpolated or rewritten');
  ui.nodes['frame-slider'].value=String(run.xyz.frames.length-1);ui.nodes['frame-slider'].fire('input');
  assert.equal(run.xyz.frames[ui.state.frame].time,249.75,'The exact final off-grid frame remains manually accessible');
});

test('invalid or unsampled stages are omitted and a different run restores full playback',async()=>{
  const ui=await playbackSession([null,{startFs:null,endFs:10},{startFs:20,endFs:10},{startFs:300,endFs:400},{startFs:0,endFs:.1},{startFs:50,endFs:99.75,label:'Válida'}]);
  assert.deepEqual(ui.nodes['playback-interval'].options.map(option=>option.value),['full','stage-5']);
  ui.nodes['playback-interval'].value='stage-5';ui.nodes['playback-interval'].fire('change');
  const load=ui.choose('other',true);ui.requests.at(-1).resolve(preset('other'));await load;
  assert.equal(ui.nodes['playback-interval'].value,'full');assert.equal(ui.nodes['playback-interval-field'].hidden,true);assert.equal(ui.state.playing,false);
});

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

async function renderingSession(){
  const ui=session({inspectState:true}),pending=ui.choose('water-grid',true);
  const elements=[],coords=[];for(let i=0;i<32;i++){elements.push('O','H','H');coords.push([i*2.8,0,0],[i*2.8+.96,0,0],[i*2.8-.24,.93,0]);}
  const frames=[0,1].map(step=>({step,time:step*.5,coords:coords.map(p=>[p[0]+step*.1,p[1],p[2]])}));
  const data=preset('water-grid',{frames});data.runs[0].xyz.elements=elements;
  ui.requests[0].resolve(data);await pending;
  const counts={addedAtoms:0,clickable:0,render:0,labelsCreated:0,labelsDisposed:0,labelBatchesRemoved:0,shapesCreated:0,shapesRemoved:0},labels=[],shapes=[];
  let atoms=[];
  const model={addAtoms(input){counts.addedAtoms++;atoms=input.map(a=>({...a}));},selectedAtoms(){return atoms;},setClickable(){counts.clickable++;},setStyle(){}};
  const viewer={
    render(){counts.render++;},removeAllModels(){atoms=[];},removeAllShapes(){},
    addLabel(text,style,selection,noshow){assert.equal(noshow,true,'Labels must be added without per-atom scene draws');counts.labelsCreated++;const label={text,style,sprite:{position:{set(x,y,z){this.x=x;this.y=y;this.z=z;}}},dispose(){counts.labelsDisposed++;this.disposed=true;}};labels.push(label);return label;},
    removeAllLabels(){counts.labelBatchesRemoved++;},
    addShape(style){counts.shapesCreated++;const shape={style,cylinders:[],addDashedCylinders(cylinders){this.cylinders.push(...cylinders);},finalize(){this.finalized=true;}};shapes.push(shape);return shape;},
    removeShape(){counts.shapesRemoved++;}
  };
  Object.assign(ui.state,{viewer,model,timeFormat:{fsDigits:1,psDigits:4,secondsExponent:-15,secondsDigits:1}});
  ui.nodes['frame-time'].dataset.ready='1';ui.nodes['frame-values'].dataset.ready='1';
  for(const name of ['frame-index','frame-time-value']){const span=new Element('span');span.className=name;ui.nodes['frame-time'].append(span);}
  for(const name of ['time-fs','time-ps','time-s','temperature','kinetic','potential','total','atoms'])ui.nodes['frame-'+name]=new Element();
  return {...ui,counts,labels,shapes,liveAtoms:()=>atoms};
}

test('stage playback and manual seeking retain matching physical energy and temperature cursors',async()=>{
  const ui=await renderingSession(),run=ui.state.runs[0],original=run.xyz.frames[0].coords;
  run.xyz.frames=Array.from({length:10},(_,step)=>({step,time:step*.25,coords:original.map(p=>[p[0]+step*.01,p[1],p[2]])}));
  run.energy.rows=run.xyz.frames.map(frame=>({time:frame.time,step:frame.step,total:-1,potential:-1.1,kinetic:.1,temperature:300}));
  run.metadata={stages:[{startFs:.5,endFs:1.25,label:'Trecho'}]};
  ui.trajectoryHooks.renderTrajectoryChart(run);ui.nodes['playback-duration'].fire('change');
  ui.nodes['playback-interval'].value='stage-0';ui.nodes['playback-interval'].fire('change');
  ui.nodes['play-button'].fire('click');ui.animationTick(0);ui.animationTick(30000);
  assert.equal(ui.state.frame,4);assert.equal(ui.nodes['trajectory-energy-chart'].chartCursor,1);assert.equal(ui.nodes['trajectory-temperature-chart'].chartCursor,1);
  assert.match(ui.nodes['trajectory-energy-status'].textContent,/1 fs/);assert.match(ui.nodes['trajectory-temperature-status'].textContent,/300 K/);
  assert.equal(ui.liveAtoms()[0].x,run.xyz.frames[4].coords[0][0]);
  ui.nodes['frame-slider'].value='8';ui.nodes['frame-slider'].fire('input');
  assert.equal(ui.state.playing,false);assert.equal(ui.state.frame,8);
  assert.equal(ui.nodes['trajectory-energy-chart'].chartCursor,2);assert.equal(ui.nodes['trajectory-temperature-chart'].chartCursor,2);
});

test('sequence clock readouts and stage playback keep original source time and energy at a velocity reset',async()=>{
 const ui=await renderingSession(),run=ui.state.runs[0],coords=run.xyz.frames[0].coords;
 run.xyz.frames=[
  {time:7082.5,sourceTime:7082.5,sourceStep:28330,sourceKey:'before',step:null,segment:0,coords},
  {time:7083,sourceTime:0,sourceStep:0,sourceKey:'after',step:null,segment:1,coords},
  {time:7083.5,sourceTime:.5,sourceStep:2,sourceKey:'after',step:null,segment:1,coords}
 ];
 run.energy.rows=[{time:7083,sourceTime:7083,sourceKey:'before',sourceStep:28332,step:null,total:-1,potential:-1.1,kinetic:.1,temperature:284.9,segment:0},...run.xyz.frames.slice(1).map(frame=>({...frame,total:-.99,potential:-1.1,kinetic:.11,temperature:300}))];
 run.metadata={clockMode:'sequence_elapsed',clockNote:'Em 7083 fs: velocidades reinicializadas a 300 K; não é calor de reação.',stages:[{startFs:7083,endFs:7083.5,label:'N assistido'}]};
 const original=JSON.stringify([run.xyz,run.energy]);ui.nodes['frame-time-heading']=new Element();
 ui.trajectoryHooks.renderTrajectoryChart(run);ui.nodes['playback-duration'].fire('change');ui.nodes['playback-interval'].value='stage-0';ui.nodes['playback-interval'].fire('change');
 assert.equal(ui.state.frame,1);assert.equal(ui.nodes['trajectory-energy-chart'].chart.xLabel,'Tempo da sequência (fs)');assert.equal(ui.nodes['trajectory-temperature-chart'].chart.xLabel,'Tempo da sequência (fs)');
 assert.equal(ui.nodes['frame-temperature'].textContent,'300 K');assert.equal(ui.nodes['frame-time-heading'].textContent,'Tempo da sequência');
 assert.match(ui.nodes['frame-time'].querySelector('.frame-time-value').textContent,/7083.*da sequência.*Relógio original: 0 fs/);
 assert.match(ui.nodes['trajectory-stage-summary'].innerHTML,/Tempo da sequência/);assert.doesNotMatch(ui.nodes['trajectory-stage-summary'].innerHTML,/velocidades reinicializadas/);assert.match(ui.playbackNote.textContent,/tempo abaixo é acumulado/);
 assert.equal(ui.nodes['trajectory-energy-chart'].chartCursor,7083);assert.equal(JSON.stringify([run.xyz,run.energy]),original);
 run.metadata={};ui.renderHooks.drawFrame();assert.equal(ui.nodes['frame-time-heading'].textContent,'Tempo físico');
});

test('the 97-atom sequence has both N and two water measurements without assuming the old 43-atom system',async()=>{
 const ui=session({inspectState:true}),load=ui.choose('chelation');
 const data=preset('chelation_continuous'),run=data.runs[0];run.xyz.elements=Array(97).fill('H');
 for(const [index,element] of [[0,'Zn'],[61,'N'],[64,'N'],[19,'O'],[7,'O']])run.xyz.elements[index]=element;
 run.xyz.frames[0].coords=Array.from({length:97},(_,i)=>[i,0,0]);ui.requests[0].resolve(data);await load;
 ui.nodes['tab-distance'].fire('click');assert.deepEqual(JSON.parse(JSON.stringify(ui.state.pairs[ui.state.runs[0].id])),[[0,61],[0,64],[0,19],[0,7]]);
 assert.match(ui.nodes['energy-guide'].innerHTML,/primeiro N é assistida/);assert.doesNotMatch(ui.nodes['energy-guide'].innerHTML,/N 31|N 34/);
});

test('energy export distinguishes elapsed sequence time from every original clock and step',async()=>{
 const ui=session({inspectState:true}),load=ui.choose('sequence'),data=preset('sequence');
 data.runs[0].metadata={clockMode:'sequence_elapsed'};
 data.runs[0].energy.rows=[{time:7083,step:null,sourceKey:'m01',sourceTime:0,sourceStep:0,segment:1,kinetic:.11,potential:-1.1,total:-.99,temperature:300,conserved:null}];
 ui.requests[0].resolve(data);await load;
 const exported=JSON.parse(JSON.stringify(ui.exports.energyRows()));
 assert.deepEqual(exported[0].slice(-4),['relogio','fonte','tempo_original_fs','passo_original']);
 assert.equal(exported[0][3],'tempo_exibido_fs');assert.equal(exported[1][2],null);assert.equal(exported[1][3],7083);
 assert.deepEqual(exported[1].slice(-4),['sequence_elapsed','m01',0,0]);assert.equal(exported[1][7],-.99);
 ui.state.runs[0].metadata={};const ordinary=ui.exports.energyRows();assert.equal(ordinary[0][3],'tempo_fs');assert.equal(ordinary[0].length,10);
});

test('all atom indices reuse textures and model objects across frames, then release on disable',async()=>{
  const ui=await renderingSession(),run=ui.state.runs[0],original=JSON.stringify(run.xyz);
  ui.nodes['atom-labels'].checked=true;ui.nodes['proximity-lines'].checked=true;
  ui.renderHooks.drawFrame();const atoms=ui.liveAtoms(),labels=ui.state.labelRecords.map(record=>record.label);
  assert.equal(ui.counts.labelsCreated,96);assert.equal(ui.counts.render,1);assert.equal(ui.counts.addedAtoms,1);assert.equal(ui.counts.clickable,1);
  ui.state.frame=1;ui.renderHooks.drawFrame();
  assert.equal(ui.liveAtoms(),atoms);assert.equal(ui.counts.addedAtoms,1);assert.equal(ui.counts.clickable,1);
  assert.equal(ui.counts.labelsCreated,96);assert.equal(ui.counts.labelsDisposed,0);assert.equal(ui.counts.render,2);
  for(let i=0;i<96;i++){assert.equal(ui.state.labelRecords[i].label,labels[i]);assert.equal(labels[i].sprite.position.x,run.xyz.frames[1].coords[i][0]);assert.equal(labels[i].style.position.x,atoms[i].x);}
  assert.equal(JSON.stringify(run.xyz),original,'Source positions and times remain untouched');
  ui.nodes['atom-labels'].checked=false;ui.renderHooks.drawFrame();
  assert.equal(ui.counts.labelsDisposed,96);assert.equal(ui.counts.labelBatchesRemoved,1);assert.equal(ui.state.labelRecords.length,0);
  ui.renderHooks.drawFrame();assert.equal(ui.counts.labelsDisposed,96);
});

test('contact cylinders are grouped by kind and not rebuilt for an index-only toggle',async()=>{
  const ui=await renderingSession(),run=ui.state.runs[0];ui.nodes['hydrogen-bonds'].checked=true;
  ui.renderHooks.drawFrame();const expected=Geometry.hydrogenBonds(run.xyz.elements,run.xyz.frames[0].coords);
  assert.ok(expected.length>1);assert.equal(ui.counts.shapesCreated,1);assert.equal(ui.shapes[0].cylinders.length,expected.length);assert.equal(ui.shapes[0].finalized,true);
  ui.nodes['atom-labels'].checked=true;ui.renderHooks.drawFrame();assert.equal(ui.counts.shapesCreated,1);assert.equal(ui.counts.shapesRemoved,0);
  ui.state.frame=1;ui.renderHooks.drawFrame();assert.equal(ui.counts.shapesCreated,2);assert.equal(ui.counts.shapesRemoved,1);
  ui.nodes['hydrogen-bonds'].checked=false;ui.renderHooks.drawFrame();assert.equal(ui.counts.shapesRemoved,2);
});

test('clearing a loaded session releases labels, models, contact shapes and cached frame references',async()=>{
  const ui=await renderingSession();ui.nodes['atom-labels'].checked=true;ui.nodes['hydrogen-bonds'].checked=true;ui.nodes['proximity-lines'].checked=true;ui.renderHooks.drawFrame();
  ui.nodes['clear-button'].fire('click');
  assert.equal(ui.counts.labelsDisposed,96);assert.equal(ui.counts.shapesRemoved,1);
  assert.equal(ui.state.model,null);assert.equal(ui.state.renderAtoms,null);assert.equal(ui.state.renderFrame,null);assert.equal(ui.state.frameGeometry,null);assert.equal(ui.state.labelRecords.length,0);
  assert.equal(ui.nodes.workspace.hidden,true);
});
