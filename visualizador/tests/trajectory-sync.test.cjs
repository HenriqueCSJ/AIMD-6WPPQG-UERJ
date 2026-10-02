const test=require('node:test');
const assert=require('node:assert/strict');
const {timeIndex,ScientificChart}=require('../charts.js');

test('sequence boundaries resolve energy by the original source without inventing a global step',()=>{
 const before={time:7083,step:null,sourceKey:'hydration',sourceStep:28332,temperature:284.9,segment:0};
 const after={time:7083,step:null,sourceKey:'assisted',sourceStep:0,temperature:300,segment:1};
 const next={time:7083.2,step:null,sourceKey:'assisted',sourceStep:1,temperature:301,segment:1};
 const index=timeIndex([before,after,next]);
 assert.equal(index.exact(7083),null);assert.equal(index.exact(7083,{sourceKey:'assisted',sourceStep:0}),after);
 assert.equal(index.exact(7083,{sourceKey:'hydration',sourceStep:28332}),before);
 assert.equal(index.exact(7083.25,{sourceKey:'assisted',sourceStep:1}),next);
 assert.equal(index.exact(7083.25,{sourceKey:'hydration',sourceStep:1}),null);
 assert.equal(index.covers(7083,{sourceKey:'missing'}),false);
 assert.equal(after.time,7083);assert.equal(after.step,null);assert.equal(before.temperature,284.9);
});

test('different XYZ and energy strides synchronize by physical time, not array index',()=>{
  const energies=timeIndex(Array.from({length:11},(_,i)=>({time:100+i*.5,step:200+i,potential:-i,segment:0})));
  const frames=timeIndex([{time:100.5,step:201},{time:102.5,step:205},{time:104.5,step:209}]);
  assert.equal(energies.exact(frames.entries[1].time).step,205);
  assert.equal(frames.nearest(103.6),2);
  assert.equal(frames.nearest(103.5),1); // Equidistant points prefer the earlier recorded frame.
  assert.equal(energies.exact(102.75),null);
  assert.equal(energies.covers(102.75),true); // A cursor is allowed; no energy value is interpolated.
});

test('missing clocks and nonoverlapping time windows never snap to an endpoint',()=>{
  const empty=timeIndex([{time:null},{time:undefined}]);
  assert.equal(empty.nearest(0),null);assert.equal(empty.covers(0),false);assert.equal(empty.exact(null),null);
  const frames=timeIndex([{time:100},{time:110}]);
  assert.equal(frames.nearest(99),null);assert.equal(frames.nearest(111),null);
  assert.equal(frames.nearest(100),0);assert.equal(frames.nearest(110),1);
  assert.equal(frames.covers(0),false);
});

test('ORCA one-decimal CSV clocks match quarter-fs XYZ only through the same recorded step',()=>{
  const early={time:.2,step:1,total:-1},late={time:.8,step:3,total:-2},energies=timeIndex([early,late]);
  assert.equal(energies.exact(.25,{step:1}),early);
  assert.equal(energies.exact(.75,{step:3}),late);
  assert.equal(energies.exact(.25,{step:3}),null);
  assert.equal(energies.exact(.75,{step:1}),null);
  assert.equal(energies.exact(.25),null);
  assert.equal(energies.exact(.251,{step:1}),null);
  assert.equal(timeIndex([early]).covers(.25,{step:1}),true);
  assert.equal(timeIndex([early]).covers(.25,{step:2}),false);
  assert.equal(early.time,.2);assert.equal(late.time,.8); // No timestamp is rewritten.
});

test('gaps, missing samples, and repeated restart times preserve uncertainty',()=>{
  const rows=[{time:0,segment:0,potential:0},{time:1,segment:0,potential:1},{time:4,segment:1,potential:4},{time:5,segment:1,potential:null}];
  const energies=timeIndex(rows,row=>Number.isFinite(row.potential));
  assert.equal(energies.covers(.5),true);assert.equal(energies.covers(2),false);
  assert.equal(energies.covers(4.5),false);assert.equal(energies.covers(5),false);
  assert.equal(energies.exact(5),null);assert.equal(energies.exact(0).potential,0);
  const restarted=timeIndex([{time:0,step:0},{time:1,step:1},{time:0,step:20},{time:1,step:21}]);
  assert.equal(restarted.exact(0),null);assert.equal(restarted.exact(0,{step:20}).step,20);
  assert.equal(restarted.nearest(0,3),2);
});

class Element{
  constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.listeners={};this.style={};this.clientWidth=680;this.offsetHeight=28;}
  setAttribute(key,value){this.attributes[key]=String(value);}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=[...children];}
  addEventListener(type,callback){this.listeners[type]=callback;}
  getBoundingClientRect(){return {left:0,top:0,width:680,height:250};}
}

test('playback cursor survives hover exit, uses physical x, and leaves curve paths untouched',()=>{
  const previous=global.document;
  global.document={createElement:tag=>new Element(tag),createElementNS:(_ns,tag)=>new Element(tag)};
  try{
    const host=new Element('div'),seeks=[];
    const chart=new ScientificChart(host,{title:'Energy',xLabel:'fs',yLabel:'Eh',xUnit:'fs',yUnit:'Eh',series:[{name:'E',color:'#006e66',points:[{x:100,y:0},{x:200,y:1}]}],onSeek:time=>seeks.push(time)});
    const svg=host.children.find(node=>node.tag==='svg'),curve=svg.children.find(node=>node.tag==='path'),hit=svg.children.find(node=>node.tag==='rect'),cursor=chart.plot.cursor;
    chart.setCursorX(125);
    assert.equal(cursor.attributes.visibility,'visible');
    assert.equal(Number(cursor.attributes.x1),76+(680-76-18)*.25);
    hit.listeners.pointerleave();assert.equal(cursor.attributes.visibility,'visible');
    chart.setCursorX(175);assert.equal(svg.children.find(node=>node.tag==='path'),curve);
    chart.setCursorX(99);assert.equal(cursor.attributes.visibility,'hidden');
    chart.setCursorX(null);assert.equal(cursor.attributes.visibility,'hidden');
    hit.listeners.click({clientX:76+(680-76-18)*.6});assert.equal(seeks[0],160);
    svg.listeners.keydown({key:'End',preventDefault(){}});svg.listeners.keydown({key:'Enter',preventDefault(){}});assert.equal(seeks[1],200);
  }finally{global.document=previous;}
});
