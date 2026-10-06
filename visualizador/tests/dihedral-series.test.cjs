const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../geometry.js');
const {ScientificChart}=require('../charts.js');

const samples=(values,segment=0)=>values.map((value,time)=>({time,value,segment}));

test('continuous presentation joins both wrap directions and preserves signed samples',()=>{
  for(const [raw,expected] of [
    [[170,179,-179,-170,-100,0,100,179,-179],[170,179,181,190,260,360,460,539,541]],
    [[-170,-179,179,170,100,0,-100,-179,179],[-170,-179,-181,-190,-260,-360,-460,-539,-541]]
  ]){
    const source=Object.freeze(samples(raw).map(Object.freeze)),before=JSON.stringify(source);
    const result=G.dihedralSeries(source,{continuous:true});
    assert.deepEqual(result.map(p=>p.displayValue),expected);
    assert.deepEqual(result.map(p=>p.value),raw);
    assert.deepEqual(result.map(p=>p.segment),raw.map(()=>0));
    assert.equal(new Set(result.map(p=>p.plotSegment)).size,1);
    assert.equal(JSON.stringify(source),before);
  }
});

test('oscillation around 180 stays in one continuous band; signed presentation breaks wraps',()=>{
  const source=samples([179,-179,178,-178,177]);
  const continuous=G.dihedralSeries(source,{continuous:true}),signed=G.dihedralSeries(source);
  assert.deepEqual(continuous.map(p=>p.displayValue),[179,181,178,182,177]);
  assert.deepEqual(signed.map(p=>p.displayValue),[179,-179,178,-178,177]);
  assert.deepEqual(signed.map(p=>p.plotSegment),[0,1,2,3,4]);
});

test('continuous presentation resets at source segments, nulls and recorded gaps',()=>{
  const source=[
    {time:0,value:179,segment:'a'}, {time:1,value:-179,segment:'a'},
    {time:2,value:179,segment:'b'}, {time:3,value:null,segment:'b'},
    {time:4,value:-179,segment:'b'}, {time:5,value:179,segment:'b'},
    {time:8,value:-178,segment:'b',gapBefore:true}, {time:9,value:179,segment:'b'}
  ];
  const result=G.dihedralSeries(source,{continuous:true});
  assert.deepEqual(result.map(p=>p.displayValue),[179,181,179,null,-179,-181,-178,-181]);
  assert.deepEqual(result.map(p=>p.plotSegment),[0,0,1,null,2,2,3,3]);
  assert.equal(result[6].gapBefore,true);
});

test('missing or invalid measurements and invalid, repeated or reversed clocks do not bridge',()=>{
  for(const invalid of [null,NaN,Infinity,undefined]){
    const result=G.dihedralSeries(samples([179,invalid,-179]),{continuous:true});
    assert.equal(result[1].displayValue,null);assert.equal(result[2].displayValue,-179);
    assert.notEqual(result[0].plotSegment,result[2].plotSegment);
  }
  for(const boundary of [{time:0,value:-179},{time:-1,value:-179},{time:null,value:-179},{time:NaN,value:-179}]){
    const result=G.dihedralSeries([{time:0,value:179},boundary,{time:2,value:179}],{continuous:true});
    assert.notEqual(result[0].plotSegment,result[1].plotSegment);
    if(!Number.isFinite(boundary.time))assert.equal(result[2].displayValue,179);
  }
  assert.deepEqual(G.dihedralSeries([]),[]);
});

test('zero and the ambiguous exact half-turn retain their original signed increments',()=>{
  const result=G.dihedralSeries(samples([0,180,0,-180,0]),{continuous:true});
  assert.deepEqual(result.map(p=>p.displayValue),[0,180,0,-180,0]);
  assert.equal(G.dihedral([1,0,0],[0,0,0],[0,1,0],[0,1,1]),-90);
  assert.equal(G.dihedral([1,0,0],[0,0,0],[0,1,0],[0,1,-1]),90);
  assert.equal(G.dihedral([0,0,0],[1,0,0],[2,0,0],[3,0,0]),null);
});

class Element{
  constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.listeners={};this.style={};this.clientWidth=680;this.offsetHeight=28;}
  setAttribute(key,value){this.attributes[key]=String(value);}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=[...nodes];}
  addEventListener(type,callback){this.listeners[type]=callback;}
}

test('signed chart uses boundary ticks, splits wraps and preserves isolated samples',()=>{
  const previousDocument=global.document;
  global.document={createElement:tag=>new Element(tag),createElementNS:(_ns,tag)=>new Element(tag)};
  try{
    const raw=samples([170,179,-179,-170,null,10,20,null,45]);
    const points=Object.freeze(G.dihedralSeries(raw).map(p=>Object.freeze({x:p.time,y:p.displayValue,segment:p.plotSegment})));
    const host=new Element('div');
    new ScientificChart(host,{title:'Diedro',xLabel:'Tempo (fs)',yLabel:'Diedro (°)',xUnit:'fs',yUnit:'°',yDomain:[-180,180],yTicks:[180,-90,0,90,-180,180,NaN,200],series:[{name:'A-B-C-D',color:'#006e66',showSegmentStarts:false,points}]});
    const svg=host.children.find(n=>n.tag==='svg'),path=svg.children.find(n=>n.tag==='path');
    assert.equal((path.attributes.d.match(/M/g)||[]).length,4);
    assert.equal((path.attributes.d.match(/L/g)||[]).length,3);
    const circles=svg.children.filter(n=>n.tag==='circle');
    assert.equal(circles.length,1,'Only the genuinely isolated 45-degree sample needs a dot');
    const labels=svg.children.filter(n=>n.tag==='text'&&n.attributes['text-anchor']==='end'&&n.attributes.x==='67');
    assert.deepEqual(labels.map(n=>n.textContent),['-180','-90','0','90','180']);
    assert.deepEqual(points.map(p=>p.y),[170,179,-179,-170,null,10,20,null,45]);
  }finally{global.document=previousDocument;}
});
