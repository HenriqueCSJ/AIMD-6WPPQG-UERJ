const test=require('node:test');
const assert=require('node:assert/strict');
const {ScientificChart}=require('../charts.js');

class Element{
  constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.listeners={};this.style={};this.clientWidth=680;this.offsetHeight=28;this.captured=new Set();this.rect={left:0,top:0,width:680,height:250};}
  setAttribute(key,value){this.attributes[key]=String(value);}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=[...nodes];}
  addEventListener(type,callback){this.listeners[type]=callback;}
  getBoundingClientRect(){return this.rect;}
  setPointerCapture(id){this.captured.add(id);}
  hasPointerCapture(id){return this.captured.has(id);}
  releasePointerCapture(id){this.captured.delete(id);}
  focus(){this.emit('focus');}
  emit(type,values={}){const event={pointerId:1,button:0,isPrimary:true,clientX:0,clientY:0,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...values};this.listeners[type]?.(event);return event;}
}

const previousDocument=global.document;
global.document={createElement:tag=>new Element(tag),createElementNS:(_ns,tag)=>new Element(tag)};
test.after(()=>{global.document=previousDocument;});

function fixture(options={}){
    const host=new Element('div'),ranges=[],seeks=[];
    const chart=new ScientificChart(host,{title:'Energia',xLabel:'Tempo (fs)',yLabel:'Energia (Eh)',xUnit:'fs',yUnit:'Eh',xDomain:[0,100],yDomain:[-20,0],series:[{name:'E',color:'#006e66',points:[{x:0,y:-20,segment:0},{x:50,y:-10,segment:0},{x:100,y:0,segment:0}]}],onRangeSelect:range=>ranges.push(range),onSeek:time=>seeks.push(time),...options});
    const svg=host.children.find(n=>n.tag==='svg'),hit=svg.children.find(n=>n.tag==='rect'),selection=svg.children.find(n=>n.attributes.class==='chart-range-selection'),tip=host.children.find(n=>n.className==='chart-tip');
    return {chart,host,svg,hit,selection,tip,ranges,seeks};
}

const near=(actual,expected,tolerance=1e-10)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} differs from ${expected}`);
// Plot corners at this fixed viewport: (76,34) to (662,202).
const point=(xFraction,yFraction)=>({clientX:76+586*xFraction,clientY:34+168*yFraction});
function drag(f,from,to){f.hit.emit('pointerdown',from);f.hit.emit('pointermove',to);f.hit.emit('pointerup',to);}

test('explicit domains clip data and reference marks without mutating points or joining segments',()=>{
  const points=Object.freeze([{x:-10,y:-30,segment:0},{x:50,y:-10,segment:0},{x:60,y:null,segment:0},{x:70,y:-5,segment:1},{x:110,y:10,segment:1}].map(Object.freeze)),snapshot=JSON.stringify(points);
  const f=fixture({series:[{name:'E',color:'#006e66',points}],references:[{value:50}]});
  const path=f.svg.children.find(n=>n.tag==='path'),defs=f.svg.children.find(n=>n.tag==='defs'),clipPath=defs.children[0],clipBox=clipPath.children[0],clip=path.attributes['clip-path'];
  assert.equal(clip,`url(#${clipPath.attributes.id})`);
  assert.deepEqual(clipBox.attributes,{x:'76',y:'34',width:'586',height:'168'});
  assert.equal((path.attributes.d.match(/M/g)||[]).length,2,'The missing sample/segment still breaks the line');
  assert.ok(path.attributes.d.includes('M17.40,286.00'),'Off-screen source coordinates are retained and clipped, not clamped');
  for(const mark of f.svg.children.filter(n=>n.tag==='circle'||n.attributes.stroke==='#61726b'))assert.equal(mark.attributes['clip-path'],clip);
  assert.equal(JSON.stringify(points),snapshot);
  const other=fixture();assert.notEqual(other.svg.children.find(n=>n.tag==='defs').children[0].attributes.id,clipPath.attributes.id,'Two charts must not share clip IDs');
  f.chart.setCursorX(50);near(Number(f.chart.plot.cursor.attributes.x1),369);assert.equal(f.chart.plot.cursor.attributes['clip-path'],clip);
});

test('rectangle selection returns exact displayed domains in either drag direction and never seeks',()=>{
  for(const reverse of [false,true]){
    const f=fixture(),ends=[point(.2,.2),point(.8,.8)];if(reverse)ends.reverse();
    drag(f,...ends);assert.equal(f.ranges.length,1);near(f.ranges[0].x[0],20);near(f.ranges[0].x[1],80);near(f.ranges[0].y[0],-16);near(f.ranges[0].y[1],-4);
    assert.equal(f.selection.attributes.visibility,'hidden');assert.equal(f.hit.captured.size,0);
    f.hit.emit('click',ends[1]);assert.deepEqual(f.seeks,[],'The compatibility click after a drag must not seek');
    drag(f,point(.5,.5),point(.5,.5));f.hit.emit('click',point(.5,.5));assert.deepEqual(f.seeks,[50],'A subsequent ordinary click still seeks');
  }
});

test('x-only selection accepts a horizontal drag and retains the full y domain',()=>{
  const f=fixture({rangeMode:'x'});
  f.hit.emit('pointerdown',point(.8,.4));f.hit.emit('pointermove',point(.2,.4));
  assert.equal(f.selection.attributes.y,'34');assert.equal(f.selection.attributes.height,'168');
  f.hit.emit('pointerup',point(.2,.4));assert.equal(f.ranges.length,1);near(f.ranges[0].x[0],20);near(f.ranges[0].x[1],80);assert.deepEqual(f.ranges[0].y,[-20,0]);
});

test('capture permits release outside the plot and clips selected limits to visible axes',()=>{
  const f=fixture();f.hit.emit('pointerdown',point(.5,.5));assert.ok(f.hit.hasPointerCapture(1));
  f.hit.emit('pointerup',{clientX:2000,clientY:-500});assert.equal(f.ranges.length,1);assert.deepEqual(f.ranges[0],{x:[50,100],y:[-10,0]});assert.equal(f.hit.captured.size,0);
});

test('Escape, pointercancel, loss of capture and another pointer never commit a range or seek',()=>{
  for(const cancel of ['Escape','pointercancel','lostpointercapture','blur']){
    const f=fixture();f.hit.emit('pointerdown',point(.2,.2));f.hit.emit('pointermove',point(.8,.8));
    if(cancel==='Escape')f.svg.emit('keydown',{key:'Escape'});else if(cancel==='blur')f.svg.emit('blur');else f.hit.emit(cancel);
    f.hit.emit('pointerup',point(.8,.8));f.hit.emit('click',point(.8,.8));assert.deepEqual(f.ranges,[],cancel);assert.deepEqual(f.seeks,[],cancel);assert.equal(f.selection.attributes.visibility,'hidden');assert.equal(f.hit.captured.size,0);
  }
  const f=fixture();f.hit.emit('pointerdown',point(.2,.2));f.hit.emit('pointermove',{...point(.8,.8),pointerId:2});f.hit.emit('pointerup',{...point(.8,.8),pointerId:2});assert.deepEqual(f.ranges,[]);assert.ok(f.hit.hasPointerCapture(1));f.hit.emit('pointercancel');
});

test('the 6 px minimum uses rendered CSS pixels and rejects degenerate rectangles',()=>{
  const f=fixture();f.svg.rect={left:20,top:40,width:1360,height:500};
  const start={clientX:20+2*100,clientY:40+2*60};
  drag(f,start,{clientX:start.clientX+5.9,clientY:start.clientY+30});assert.deepEqual(f.ranges,[]);
  drag(f,start,{clientX:start.clientX+30,clientY:start.clientY+5.9});assert.deepEqual(f.ranges,[]);
  drag(f,start,{clientX:start.clientX+6,clientY:start.clientY+6});assert.equal(f.ranges.length,1);
  const x=fixture({rangeMode:'x'});drag(x,point(.5,.5),{...point(.5,.5),clientY:190});assert.deepEqual(x.ranges,[],'A vertical drag is not a temporal interval');
});

test('zoomed domains retain sub-fs and small Hartree differences without rounding callback values',()=>{
  for(const [xDomain,yDomain] of [[[1000.125,1000.126],[-11.3540421,-11.3540419]],[[1e-12,1.0000002e-12],[.000012345,.000012346]]]){
    const f=fixture({xDomain,yDomain,series:[{name:'E',color:'#006e66',points:[{x:xDomain[0],y:yDomain[0]},{x:xDomain[1],y:yDomain[1]}]}]});
    drag(f,point(.25,.75),point(.75,.25));assert.equal(f.ranges.length,1);
    near(f.ranges[0].x[0],xDomain[0]+.25*(xDomain[1]-xDomain[0]),Math.abs(xDomain[1]-xDomain[0])*1e-6);
    near(f.ranges[0].y[0],yDomain[0]+.25*(yDomain[1]-yDomain[0]),Math.abs(yDomain[1]-yDomain[0])*1e-6);
    const labels=f.svg.children.filter(n=>n.tag==='text'&&n.attributes.y==='221').map(n=>n.textContent);assert.notEqual(labels[0],labels.at(-1),'Narrow axis endpoints must remain distinguishable');
  }
});

test('hover and keyboard stay within the selected time range and retain exact source values',()=>{
  const f=fixture({xDomain:[20,80],series:[{name:'E',color:'#006e66',points:[{x:0,y:-20},{x:25,y:-15},{x:75,y:-5},{x:100,y:0}]}]});
  f.hit.emit('pointermove',point(0,.5));assert.equal(f.tip.children[0].textContent,'25 fs');assert.equal(f.tip.children[1].textContent,'E: -15 Eh');
  f.svg.emit('keydown',{key:'End'});assert.equal(f.tip.children[0].textContent,'75 fs');f.svg.emit('keydown',{key:'Enter'});assert.deepEqual(f.seeks,[75]);
  const empty=fixture({xDomain:[30,40],series:[{name:'E',color:'#006e66',points:[{x:0,y:-20},{x:100,y:0}]}]});empty.svg.emit('focus');empty.svg.emit('keydown',{key:'End'});empty.svg.emit('keydown',{key:'Enter'});assert.deepEqual(empty.seeks,[]);assert.equal(empty.tip.hidden,true,'No fabricated sample when a zoom falls between saved points');
});

test('charts without a range callback preserve existing hover, keyboard and seek behavior',()=>{
  const f=fixture({onRangeSelect:undefined,xDomain:undefined,yDomain:undefined});assert.equal(f.selection,undefined);assert.equal(f.hit.listeners.pointerdown,undefined);assert.equal(f.hit.style.touchAction,undefined);
  f.hit.emit('pointermove',point(.5,.5));assert.equal(f.tip.children[0].textContent,'50 fs');f.hit.emit('click',point(.5,.5));f.svg.emit('keydown',{key:'End'});f.svg.emit('keydown',{key:'Enter'});assert.deepEqual(f.seeks,[50,100]);
  assert.equal(f.svg.children.find(n=>n.tag==='path').attributes['clip-path'],undefined);
});
