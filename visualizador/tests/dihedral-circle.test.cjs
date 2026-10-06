const test=require('node:test'),assert=require('node:assert/strict');
const {DihedralCircleChart}=require('../dihedral-circle.js');
class Element{
  constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.className='';}
  setAttribute(key,value){this.attributes[key]=String(value);}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=[...nodes];}
}
const oldDocument=global.document;
global.document={createElement:tag=>new Element(tag),createElementNS:(_ns,tag)=>new Element(tag)};
test.after(()=>{global.document=oldDocument;});
const points=values=>values.map((y,x)=>({x,y,sourceSegment:0,sourceKey:'original'}));
const fixture=(values,index=0)=>{const host=new Element('div'),chart=new DihedralCircleChart(host,{series:[{name:'H4 — C0 — C1 — O2',color:'#006e66',points:points(values)}],index});return {host,chart,card:chart.cards[0]};};
const near=(actual,expected)=>assert.ok(Math.abs(Number(actual)-expected)<1e-9,`${actual} differs from ${expected}`);

test('exact 179 and -179 are spatially adjacent while both signed labels stay visible',()=>{
  const {chart,card}=fixture([179,-179],1);
  assert.equal(card.value.textContent,'Atual: -179°');assert.equal(card.previousValue.textContent,'Anterior: 179°');
  assert.equal(card.current.attributes.visibility,'visible');assert.equal(card.previous.attributes.visibility,'visible');
  const separation=Math.hypot(Number(card.current.attributes.cx)-Number(card.previous.attributes.cx),Number(card.current.attributes.cy)-Number(card.previous.attributes.cy));
  assert.ok(separation<2.3);assert.ok(Number(card.current.attributes.cx)<56);
  assert.ok(Number(card.previous.attributes.cy)<100);assert.ok(Number(card.current.attributes.cy)>100);
  assert.equal(card.svg.attributes.role,'img');assert.match(card.svg.attributes['aria-label'],/-179°/);
  assert.equal(card.title.textContent,card.svg.attributes['aria-label']);
  const svg=card.svg;chart.setIndex(0);assert.equal(card.svg,svg);assert.equal(card.previous.attributes.visibility,'hidden');
});

test('0, +90, -90 and both signed 180 endpoints have the exact declared orientations',()=>{
  const {chart,card}=fixture([0,90,-90,180,-180]);
  for(const [index,x,y] of [[0,185,100],[1,120,35],[2,120,165],[3,55,100],[4,55,100]]){
    chart.setIndex(index);near(card.current.attributes.cx,x);near(card.current.attributes.cy,y);near(card.needle.attributes.x2,x);near(card.needle.attributes.y2,y);
  }
  const labels=card.svg.children.filter(n=>n.attributes.class==='dihedral-circle-tick-label');
  assert.deepEqual(labels.map(n=>n.textContent),['0°','+90°','±180°','−90°']);
  assert.ok(Number(labels[0].attributes.x)>120);assert.ok(Number(labels[1].attributes.y)<35);assert.ok(Number(labels[2].attributes.x)<55);assert.ok(Number(labels[3].attributes.y)>165);
});

test('invalid selected values are undefined, never zero, and hide all moving markers',()=>{
  for(const invalid of [null,undefined,NaN,Infinity]){
    const {card}=fixture([90,invalid],1);
    assert.equal(card.value.textContent,'Atual: indefinido');
    for(const node of [card.current,card.previous,card.needle])assert.equal(node.attributes.visibility,'hidden');
  }
  const {chart,card}=fixture([0]);chart.setIndex(10);assert.equal(card.value.textContent,'Atual: indefinido');chart.setIndex(-1);assert.equal(card.current.attributes.visibility,'hidden');
});

test('previous markers never cross source, gap, missing-data or non-increasing-time boundaries',()=>{
  for(const patch of [{sourceSegment:1},{sourceKey:'restart'},{gapBefore:true},{breakBefore:true},{x:0},{x:-1},{x:null},{x:NaN}]){
    const source=points([179,-179]);Object.assign(source[1],patch);
    const chart=new DihedralCircleChart(new Element('div'),{series:[{name:'Diedro',points:source}],index:1}),card=chart.cards[0];
    assert.equal(card.previous.attributes.visibility,'hidden');assert.equal(card.current.attributes.visibility,'visible');
  }
  for(const invalid of [null,NaN,undefined]){const {card}=fixture([invalid,90],1);assert.equal(card.previous.attributes.visibility,'hidden');}
});

test('simultaneous measures update retained nodes without mutating any frozen sample values',()=>{
  const source=Object.freeze(points([179,-179,0]).map(Object.freeze)),other=Object.freeze(points([-90,90,180]).map(Object.freeze)),before=JSON.stringify([source,other]);
  const host=new Element('div'),chart=new DihedralCircleChart(host,{series:[{name:'A',color:'#123456',points:source},{name:'B',color:'#654321',points:other}]});
  const cards=host.children.slice(),nodes=chart.cards.map(c=>c.current);
  for(let index=0;index<3;index++)chart.setIndex(index);
  assert.equal(host.children.length,2);assert.deepEqual(host.children,cards);assert.deepEqual(chart.cards.map(c=>c.current),nodes);
  assert.equal(chart.cards[0].value.textContent,'Atual: 0°');assert.equal(chart.cards[1].value.textContent,'Atual: 180°');
  assert.equal(chart.cards[0].current.attributes.fill,'#123456');assert.equal(chart.cards[1].current.attributes.fill,'#654321');
  assert.equal(JSON.stringify([source,other]),before);
});

test('compact signed labels retain exact decimals in titles without changing source values',()=>{
  const {chart,card}=fixture([-0,-179.12345678901234]);
  assert.equal(card.value.textContent,'Atual: -0°');chart.setIndex(1);
  assert.equal(card.value.textContent,'Atual: -179,123°');assert.equal(card.previousValue.textContent,'Anterior: -0°');
  assert.equal(card.value.attributes.title,'-179,12345678901235°');
  assert.match(card.svg.attributes['aria-label'],/-179,12345678901235°/);
  assert.equal(card.series.points[1].y,-179.12345678901234);
});
