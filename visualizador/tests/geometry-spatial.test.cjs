const test=require('node:test'),assert=require('node:assert/strict');
const G=require('../geometry.js'),brute=require('./geometry-reference.cjs');
const methods=['inferCovalentBonds','hydrogenBonds','coordinationContacts'];
function equivalent(elements,coords,options={},label=''){
 for(const method of methods)assert.deepEqual(G[method](elements,coords,options),brute[method](elements,coords,options),`${method}: ${label}`);
}
function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};}

test('spatial neighbors exactly reproduce brute force on dense and sparse deterministic mixtures',()=>{
 const rng=random(482813),types=['O','H','N','C','S','Cl','I','Zn','Na','X',null,' o ',' O ','__proto__'];
 for(const span of [2,5,15,120])for(let attempt=0;attempt<4;attempt++){
  const n=96+attempt*11,elements=[],coords=[];
  for(let i=0;i<n;i++){elements.push(types[Math.floor(rng()*types.length)]);coords.push([(rng()-.5)*span,(rng()-.5)*span,(rng()-.5)*span]);}
  for(const options of [{},{scale:1.45,minimum:.1,minimumAngle:110},{scale:.8,minimum:-.1,hydrogenAcceptorCutoff:1.7,donorAcceptorCutoff:2.2,minimumAngle:35,cutoff:3.4}])equivalent(elements,coords,options,`span ${span}, round ${attempt}`);
 }
});

test('large water systems preserve covalent pairs and H/metal contacts in their exact original order',()=>{
 for(const spacing of [1.1,2.6,3.1,7]){
  const data=brute.waterBox(72,spacing);
  equivalent(data.elements,data.coords,{},`water spacing ${spacing}`);
  const bonds=data.bonds.slice().reverse().map((pair,i)=>i%2?{a:pair[1],b:pair[0]}:pair.concat(1));
  bonds.push([1,0],[-1,0],[9999,2],[0,0],['bad',1],null);
  equivalent(data.elements,data.coords,{bonds,minimumAngle:0,hydrogenAcceptorCutoff:3.1,donorAcceptorCutoff:4.2},`explicit reversed adjacency ${spacing}`);
 }
});

test('strict covalent and inclusive contact cutoffs survive cell boundaries and coordinate translations',()=>{
 for(const shift of [0,-500,1e9,-1e9]){
  const elements=['O','H','O','Zn','N','C','C'],coords=[[0,0,0],[1,0,0],[3.5,0,0],[0,5,0],[2.6,5,0],[0,10,0],[1.2*(.76+.76),10,0]];
  for(let i=0;i<45;i++){elements.push(i%3?'O':'C');coords.push([i*3.5,40,0]);}
  const moved=coords.map(p=>p.map(v=>v+shift));
  for(const epsilon of [0,Number.EPSILON*8,-Number.EPSILON*8]){
   moved[2][0]=3.5+shift+epsilon;moved[4][0]=2.6+shift+epsilon;
   equivalent(elements,moved,{bonds:[[0,1]]},`boundary shift ${shift}, epsilon ${epsilon}`);
  }
 }
 const elements=['C','C',...Array(40).fill('O')],xyz=[[0,0,0],[.35,0,0],...Array.from({length:40},(_,i)=>[100+i*4,0,0])];
 equivalent(elements,xyz,{minimum:.35});assert.ok(!G.inferCovalentBonds(elements,xyz).some(pair=>pair[0]===0&&pair[1]===1));
 xyz[1][0]=1.2*(.76+.76);equivalent(elements,xyz);assert.ok(!G.inferCovalentBonds(elements,xyz).some(pair=>pair[0]===0&&pair[1]===1));
});

test('invalid elements, coordinate representations, missing points and extreme numbers retain old behavior',()=>{
 const data=brute.waterBox(40),options={bonds:data.bonds};
 data.elements.push('','Unknown',undefined,'Cu','N','O','H','O','N','O');
 data.coords.push(undefined,[NaN,0,0],[Infinity,0,0],{x:'0',y:'0',z:'0'},[2,0,0],{x:0,y:0,z:0},[null,'',0],new Float64Array([1,0,0]),[1e308,0,0],[-1e308,0,0]);
 data.coords[5]=null;data.coords[8]={x:1,y:undefined,z:2};data.coords[11]=['1','2','3'];data.coords[14]=[0,0];
 for(const variant of [{},options,{...options,scale:0,minimum:-1},{scale:-2},{scale:1e308},{hydrogenAcceptorCutoff:1e308,donorAcceptorCutoff:1e308},{hydrogenAcceptorCutoff:0,donorAcceptorCutoff:0,minimumAngle:0},{hydrogenAcceptorCutoff:-2},{minimumAngle:NaN,cutoff:Infinity}])equivalent(data.elements,data.coords,variant);
 equivalent(data.elements,data.coords.slice(0,20),options,'missing final points');
});

test('zero-length contacts and relaxed custom thresholds are not silently removed',()=>{
 const data=brute.waterBox(40,7);
 data.elements.unshift('O','H','O','C','C');data.coords.unshift([0,0,0],[1,0,0],[0,0,0],[1000,0,0],[1000,0,0]);
 const options={bonds:[[0,1]],hydrogenAcceptorCutoff:2.5,donorAcceptorCutoff:0,minimumAngle:0,minimum:-1};
 equivalent(data.elements,data.coords,options);
 assert.ok(G.hydrogenBonds(data.elements,data.coords,options).some(contact=>contact.donor===0&&contact.acceptor===2));
 assert.ok(G.inferCovalentBonds(data.elements,data.coords,{minimum:-1}).some(pair=>pair[0]===3&&pair[1]===4));
});
