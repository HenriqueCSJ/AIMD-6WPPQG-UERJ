const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../geometry.js');

const coords=(...points)=>points;

test('linear hydrogen bond passes the distance and angular heuristic',()=>{
  const result=G.hydrogenBonds(['O','H','N'],coords([0,0,0],[1,0,0],[2.8,0,0]));
  assert.equal(result.length,1);assert.equal(result[0].donor,0);assert.equal(result[0].hydrogen,1);assert.equal(result[0].acceptor,2);assert.equal(result[0].angle,180);
});

test('bent hydrogen bond below 150 degrees is not suggested',()=>{
  const result=G.hydrogenBonds(['O','H','N'],coords([0,0,0],[1,0,0],[2,1,0]));
  assert.equal(result.length,0);
});

test('covalently connected donor and acceptor are excluded',()=>{
  const result=G.hydrogenBonds(['O','H','N'],coords([0,0,0],[1,0,0],[2.5,0,0]),{bonds:[[0,1],[0,2]]});
  assert.equal(result.length,0);
});

test('covalently connected hydrogen and acceptor are excluded',()=>{
  const result=G.hydrogenBonds(['O','H','N'],coords([0,0,0],[1,0,0],[2.5,0,0]),{bonds:[[0,1],[1,2]]});
  assert.equal(result.length,0);
});

test('coordination uses an explicit bounded geometric cutoff',()=>{
  const elements=['Zn','N','O'],xyz=coords([0,0,0],[2.5,0,0],[3.1,0,0]);
  assert.deepEqual(G.coordinationContacts(elements,xyz).map(x=>[x.metal,x.ligand]),[[0,1]]);
  assert.equal(G.coordinationContacts(elements,xyz,{cutoff:2.0}).length,0);
  assert.equal(G.coordinationContacts(elements,xyz,{cutoff:9}).length,2); // clamped to the documented 3.5 Å maximum
  assert.equal(G.coordinationContacts(['Zn','N'],coords([0,0,0],[0,0,0])).length,0);
});

test('angle and signed dihedral are numerically stable',()=>{
  assert.equal(G.angle([1,0,0],[0,0,0],[0,1,0]),90);
  const positive=G.dihedral([1,0,0],[0,0,0],[0,1,0],[0,1,1]);
  const negative=G.dihedral([1,0,0],[0,0,0],[0,1,0],[0,1,-1]);
  assert.equal(positive,-90);assert.equal(negative,90);assert.ok(positive!==null&&negative!==null&&positive*negative<0);
  assert.equal(G.dihedral([0,0,0],[1,0,0],[2,0,0],[3,0,0]),null);
});

test('ethanol shortcut requires element order, composition, and plausible geometry',()=>{
  const xyz=coords([0,0,0],[1.5,0,0],[2.8,0.9,0],[0,1,0],[0,-1,0],[1.5,1,0],[1.5,-1,0],[3.5,1.5,0],[2.8,.9,.96]);
  assert.equal(G.isEthanolSkeleton(['C','C','O','H','H','H','H','H','H'],xyz),true);
  assert.equal(G.isEthanolSkeleton(['X','C','O','H','H','H','H','H','H'],xyz),false);
});
