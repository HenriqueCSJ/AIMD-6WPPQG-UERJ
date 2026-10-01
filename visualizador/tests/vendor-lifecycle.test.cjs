'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

// Exercise the shipped implementations without WebGL. Only the unrelated
// surface-worker bootstrap is omitted: it expects browser-global $3Dmol.
const bundle=fs.readFileSync(path.join(__dirname,'../vendor/3Dmol-min.js'),'utf8');
const sandbox={window:{navigator:{userAgent:'node'}},document:{querySelector:()=>null,readyState:'complete'},TextEncoder,TextDecoder,console,module:{exports:{}}};
sandbox.exports=sandbox.module.exports;
assert.equal(bundle.split(',__webpack_require__(185);').length,2);
vm.runInNewContext(bundle.replace(',__webpack_require__(185);',';'),sandbox);
const lib=sandbox.module.exports;
function rendererMethod(name,next){
  const match=new RegExp(name+'\\([^)]*\\)\\{').exec(bundle);
  const start=match?.index??-1;
  const tail=new RegExp(next+'\\([^)]*\\)\\{').exec(bundle.slice(start+match[0].length));
  const end=tail?start+match[0].length+tail.index:-1;
  assert.ok(start>=0&&end>start);
  return vm.runInNewContext(`({${bundle.slice(start,end)}}).${name}`);
}

function resources(root){
  const geometries=new Set(),materials=new Set();
  function visit(node){
    if(node.geometry)geometries.add(node.geometry);
    for(const material of Array.isArray(node.material)?node.material:[node.material])if(material)materials.add(material);
    for(const child of node.children||[])visit(child);
  }
  visit(root);return {geometries,materials};
}
function disposalCounts(items){
  const counts=new Map();
  for(const item of items){counts.set(item,0);item.addEventListener('dispose',()=>counts.set(item,counts.get(item)+1));}
  return ()=>[...counts.values()];
}
function model(){
  const m=new lib.GLModel(0);
  m.addAtoms([{elem:'O',x:0,y:0,z:0,index:0,serial:0,bonds:[],bondOrder:[]}]);
  m.setStyle({},{sphere:{radius:.3}});
  return m;
}
function group(){return {children:[],add(child){this.children.push(child);},remove(child){const i=this.children.indexOf(child);if(i>=0)this.children.splice(i,1);}};}

test('persistent atoms retain styles and clear old picking geometry on refresh',()=>{
  const m=model(),atom=m.selectedAtoms({})[0];
  m.setClickable({},true,()=>{});
  atom.x=2;atom.capDrawn=true;atom.intersectionShape.sphere.push('old');m.molObj={};
  m.setStyle({}, {}, true);
  assert.equal(m.selectedAtoms({})[0],atom);
  assert.equal(atom.x,2);assert.equal(atom.style.sphere.radius,.3);
  assert.equal(atom.clickable,true);assert.equal(atom.capDrawn,false);
  assert.deepEqual(Object.values(atom.intersectionShape).map(items=>items.length),[0,0,0,0]);
  assert.equal(m.molObj,null);
});

test('model replacement and removal release child resources exactly once',()=>{
  const m=model(),parent=group(),options={supportsImposters:true};
  m.globj(parent,options);
  const old=resources(m.renderedMolObj),oldGeo=disposalCounts(old.geometries),oldMaterials=disposalCounts(old.materials);
  assert.ok(old.geometries.size);assert.ok(old.materials.size);
  // Clones share resources; traversing both must not double-dispose.
  m.renderedMolObj.add(m.renderedMolObj.children[0].clone());
  m.globj(parent,options);
  assert.ok(oldGeo().every(n=>n===0));assert.ok(oldMaterials().every(n=>n===0));
  m.selectedAtoms({})[0].x=1;m.setStyle({}, {}, true);m.globj(parent,options);
  assert.ok(oldGeo().every(n=>n===1));assert.ok(oldMaterials().every(n=>n===1));
  const next=resources(m.renderedMolObj),nextGeo=disposalCounts(next.geometries),nextMaterials=disposalCounts(next.materials);
  m.removegl(parent);m.removegl(parent);
  assert.ok(nextGeo().every(n=>n===1));assert.ok(nextMaterials().every(n=>n===1));
  assert.equal(parent.children.length,0);
});

test('shape redraw retains shared geometry while disposal releases the final tree',()=>{
  const shape=new lib.GLShape({color:'#0b8f86'}),parent=group();
  shape.addDashedCylinder({start:{x:0,y:0,z:0},end:{x:2,y:0,z:0},radius:.025,dashLength:.18,gapLength:.11,color:'#0b8f86'});
  shape.finalize();shape.globj(parent);
  const old=resources(shape.renderedShapeObj),geometryDisposed=disposalCounts(old.geometries),oldMaterials=disposalCounts(old.materials);
  assert.ok(old.geometries.size);assert.ok(old.materials.size);
  shape.globj(parent);
  const next=resources(shape.renderedShapeObj),nextMaterials=disposalCounts(next.materials);
  assert.deepEqual([...next.geometries],[...old.geometries]);
  assert.ok(geometryDisposed().every(n=>n===0));assert.ok(oldMaterials().every(n=>n===1));
  shape.removegl(parent);shape.removegl(parent);
  assert.ok(geometryDisposed().every(n=>n===1));assert.ok(nextMaterials().every(n=>n===1));
  assert.equal(parent.children.length,0);
});

test('geometry deallocation also deletes radius and instancing offset buffers',()=>{
  const deleted=[];
  const renderer={_gl:{deleteBuffer:buffer=>deleted.push(buffer)}};
  const group={__webglVertexBuffer:'vertex',__webglColorBuffer:'color',__webglNormalBuffer:'normal',__webglFaceBuffer:'face',__webglLineBuffer:'line',__webglRadiusBuffer:'radius',__webglOffsetBuffer:'offset'};
  const allocated=Object.values(group);
  // Renderer is intentionally not exported. This method has no closure
  // dependencies; execute its exact shipped body against a tracked GL sink.
  const deallocate=rendererMethod('deallocateGeometry','deallocateMaterial');
  assert.equal(deallocate.call(renderer,{geometryGroups:[group],groups:1}),1);
  assert.deepEqual(deleted.slice().sort(),allocated.sort());
  assert.ok(Object.values(group).every(value=>value===undefined));
});

test('split geometry releases every allocated buffer and balances group counters',()=>{
  const active=new Set(),deleted=[];let serial=0;
  const renderer={_gl:{createBuffer(){const id=++serial;active.add(id);return id;},deleteBuffer(id){assert.ok(active.delete(id),'buffer must be live when deleted');deleted.push(id);}},info:{memory:{geometries:0}}};
  renderer.createMeshBuffers=rendererMethod('createMeshBuffers','createLineBuffers');
  renderer.createLineBuffers=rendererMethod('createLineBuffers','addBuffer');
  renderer.deallocateGeometry=rendererMethod('deallocateGeometry','deallocateMaterial');
  renderer.onGeometryDispose=rendererMethod('onGeometryDispose','onTextureDispose');
  const groups=[{radiusArray:[],useOffset:true},{radiusArray:[]},{}];
  renderer.createMeshBuffers(groups[0]);renderer.createMeshBuffers(groups[1]);renderer.createLineBuffers(groups[2]);
  const geometry={__webglInit:true,geometryGroups:groups,groups:3,removeEventListener(){}};
  assert.equal(renderer.info.memory.geometries,3);assert.equal(active.size,15);
  renderer.onGeometryDispose({target:geometry});
  assert.equal(renderer.info.memory.geometries,0);assert.equal(active.size,0);assert.equal(deleted.length,15);
  // A retained listener must not double-decrement or delete stale handles.
  renderer.onGeometryDispose({target:geometry});
  assert.equal(renderer.info.memory.geometries,0);assert.equal(deleted.length,15);
  // Cleared handles allow the same geometry to be allocated again safely.
  renderer.createMeshBuffers(groups[0]);geometry.__webglInit=true;
  assert.equal(renderer.info.memory.geometries,1);
  renderer.onGeometryDispose({target:geometry});
  assert.equal(renderer.info.memory.geometries,0);assert.equal(active.size,0);
});

test('batched dashed contacts preserve the mesh and scan bounds once per group',()=>{
  const specs=Array.from({length:300},(_,i)=>({start:{x:(i%10)*2.5,y:Math.floor(i/10)*2.5,z:0},end:{x:(i%10)*2.5+2,y:Math.floor(i/10)*2.5+1,z:.6},radius:.025,color:'#0b8f86',dashLength:.18,gapLength:.11}));
  const original=new lib.GLShape({color:'#0b8f86'}),batched=new lib.GLShape({color:'#0b8f86'});
  for(const spec of specs)original.addDashedCylinder({...spec});
  original.finalize();
  const update=lib.GLShape.updateBoundingFromPoints;let scans=0,scannedVertices=0;
  try{
    lib.GLShape.updateBoundingFromPoints=function(sphere,components,vertices,count){scans++;scannedVertices+=count;return update(sphere,components,vertices,count);};
    assert.equal(batched.addDashedCylinders(specs.map(spec=>({...spec}))),batched);
  }finally{lib.GLShape.updateBoundingFromPoints=update;}
  batched.finalize();
  const groups=batched.geo.geometryGroups;
  assert.ok(groups.length>1,'fixture must span the 16-bit vertex-index limit');
  assert.equal(scans,groups.length);assert.equal(scannedVertices,groups.reduce((sum,g)=>sum+g.vertices,0));
  assert.equal(groups.length,original.geo.geometryGroups.length);
  const low=[Infinity,Infinity,Infinity],high=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<groups.length;i++){
    const a=groups[i],b=original.geo.geometryGroups[i];
    assert.equal(a.vertices,b.vertices);assert.equal(a.faceidx,b.faceidx);
    for(const key of ['vertexArray','normalArray','colorArray','faceArray'])assert.deepEqual(a[key],b[key],key);
    for(let n=0;n<a.vertices;n++)for(let axis=0;axis<3;axis++){const value=a.vertexArray[3*n+axis];low[axis]=Math.min(low[axis],value);high[axis]=Math.max(high[axis],value);}
  }
  const sphere=batched.boundingSphere;
  for(const [axis,index] of [['x',0],['y',1],['z',2]]){
    assert.equal(sphere.box.min[axis],low[index]);assert.equal(sphere.box.max[axis],high[index]);
    assert.equal(sphere.center[axis],(low[index]+high[index])/2);
  }
  assert.ok(Math.abs(sphere.radius-Math.hypot(...high.map((value,axis)=>(value-low[axis])/2)))<1e-12);
  assert.equal(batched.intersectionShape.cylinder.length,original.intersectionShape.cylinder.length);
});
