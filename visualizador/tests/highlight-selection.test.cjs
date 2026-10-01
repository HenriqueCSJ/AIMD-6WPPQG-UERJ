const test=require('node:test');
const assert=require('node:assert/strict');
const HighlightSelection=require('../highlight-selection.js');

const coords=(...points)=>points;

test('separate waters stay separate and use fixed frame membership',()=>{
  const elements=['O','H','H','O','H','H'];
  const xyz=coords([0,0,0],[.96,0,0],[-.24,.93,0],[5,0,0],[5.96,0,0],[4.76,.93,0]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,0),[0,1,2]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,3),[3,4,5]);
});

test('hydrogen-bonded waters do not become one covalent molecule',()=>{
  const elements=['O','H','H','O','H','H'];
  const xyz=coords([0,0,0],[.96,0,0],[-.24,.93,0],[2.8,0,0],[1.8,0,0],[3.04,.93,0]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,0),[0,1,2]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,3),[3,4,5]);
});

test('metal coordination does not merge zinc with an ethylenediamine skeleton',()=>{
  const elements=['Zn','N','C','C','N'];
  const xyz=coords([0,0,0],[2.2,0,0],[3.35,0,0],[4.85,0,0],[6,0,0]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,0),[0]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,1),[1,2,3,4]);
});

test('a shared hydrogen chooses only its closest covalent candidate, with index tie break',()=>{
  const elements=['O','H','O'];
  const xyz=coords([0,0,0],[1,0,0],[2,0,0]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,0),[0,1]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,2),[2]);
});

test('a shared hydrogen follows the genuinely closest oxygen even when it has the higher index',()=>{
  const elements=['O','H','O'];
  const xyz=coords([-1,0,0],[0,0,0],[.8,0,0]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,0),[0]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,2),[1,2]);
});

test('an H2 covalent pair connects both hydrogen seeds',()=>{
  const elements=['H','H'];
  const xyz=coords([0,0,0],[.74,0,0]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,0),[0,1]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,1),[0,1]);
});

test('invalid coordinates are safe and leave a valid seed isolated',()=>{
  const elements=['O','H'];
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,null,0),[0]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,coords([0,0,0],null),0),[0]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,coords([0,0,0]),0),[0]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,coords([0,0,0],[1,0,0]),-1),[]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,coords([0,0,0],[1,0,0]),1.5),[]);
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,coords([0,0,0],[1,0,0]),2),[]);
});

test('molecule selection does not mutate elements or coordinates',()=>{
  const elements=['O','H','H'];
  const xyz=coords([0,0,0],[.96,0,0],[-.24,.93,0]);
  const originalElements=elements.slice(),originalCoords=xyz.map(point=>point.slice());
  assert.deepEqual(HighlightSelection.moleculeIndices(elements,xyz,0),[0,1,2]);
  assert.deepEqual(elements,originalElements);
  assert.deepEqual(xyz,originalCoords);
});

test('parser accepts zero-based integers, inclusive ranges, and removes duplicates',()=>{
  assert.deepEqual(HighlightSelection.parseAtomIndices('4, 0-2 2, 3',5),[0,1,2,3,4]);
  assert.deepEqual(HighlightSelection.parseAtomIndices('\n 3\t1-2 ',5),[1,2,3]);
});

test('parser rejects empty, malformed, negative, reversed, and out-of-bounds input',()=>{
  assert.throws(()=>HighlightSelection.parseAtomIndices('   ',4),/seleção de átomos está vazia/);
  assert.throws(()=>HighlightSelection.parseAtomIndices('0,,1',4),/separadores vazios/);
  assert.throws(()=>HighlightSelection.parseAtomIndices('0;1',4),/Índice de átomo inválido/);
  assert.throws(()=>HighlightSelection.parseAtomIndices('-1',4),/não podem ser negativos/);
  assert.throws(()=>HighlightSelection.parseAtomIndices('3-1',4),/intervalo de átomos invertido/i);
  assert.throws(()=>HighlightSelection.parseAtomIndices('0-4',4),/fora dos limites/);
  assert.throws(()=>HighlightSelection.parseAtomIndices('0-999999999999999999999',4),/fora dos limites/);
});

test('parser does not return partial results when a later token is invalid',()=>{
  assert.throws(()=>HighlightSelection.parseAtomIndices('0,1,invalid',4),/Índice de átomo inválido/);
  assert.deepEqual(HighlightSelection.parseAtomIndices('0,1',4),[0,1]);
});
