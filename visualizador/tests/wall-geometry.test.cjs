'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const viewerPath=path.resolve(__dirname,'..');
const bundle=fs.readFileSync(path.join(viewerPath,'vendor/3Dmol-min.js'),'utf8');
const sandbox={window:{navigator:{userAgent:'node'}},document:{querySelector:()=>null,readyState:'complete'},TextEncoder,TextDecoder,console,module:{exports:{}}};
sandbox.exports=sandbox.module.exports;
// Same unrelated surface-worker bootstrap omission as vendor-lifecycle tests.
assert.equal(bundle.split(',__webpack_require__(185);').length,2);
vm.runInNewContext(bundle.replace(',__webpack_require__(185);',';'),sandbox);
const lib=sandbox.module.exports;
const app=fs.readFileSync(path.join(viewerPath,'app.js'),'utf8');
const start=app.indexOf('  function drawWall(sphere){'),end=app.indexOf('  function updateCell(',start);
assert.ok(start>=0&&end>start);

test('wall redraw uses a bounded real vendor mesh while preserving three exact closed contours and the camera',()=>{
  const requests=[],cameraCalls=[],parent={remove(){}};
  const renderer={shapes:[],modelGroup:parent,
    removeShape:lib.GLViewer.prototype.removeShape,
    removeAllShapes:lib.GLViewer.prototype.removeAllShapes,
    addCurve(spec){requests.push(spec);return lib.GLViewer.prototype.addCurve.call(this,spec);},
    getView(){cameraCalls.push('getView');},setView(){cameraCalls.push('setView');},zoomTo(){cameraCalls.push('zoomTo');},rotate(){cameraCalls.push('rotate');},render(){cameraCalls.push('render');}
  };
  const state={viewer:renderer,wallShapes:[],contactShapes:[],contactKey:null};
  const clearContacts=()=>{for(const shape of state.contactShapes)renderer.removeShape(shape);state.contactShapes=[];state.contactKey=null;};
  const drawWall=new Function('state','clearContactShapes',app.slice(start,end)+'\nreturn drawWall;')(state,clearContacts);
  const center={x:1.25,y:-2.5,z:.75};
  for(const radius of [6,4.985,7.137]){
    requests.length=0;drawWall({center,radius});
    assert.equal(renderer.shapes.length,3);assert.equal(state.wallShapes.length,3);
    assert.equal(requests.length,3);
    requests.forEach((spec,plane)=>{
      assert.equal(spec.points.length,73);
      const closed=spec.points[0],last=spec.points.at(-1);
      assert.ok(Math.hypot(closed.x-last.x,closed.y-last.y,closed.z-last.z)<1e-10);
      const axes=['x','y','z'];
      for(const point of spec.points){
        assert.ok(Math.abs(Math.hypot(point.x-center.x,point.y-center.y,point.z-center.z)-radius)<1e-10);
        assert.ok(Math.abs(point[axes[plane]]-center[axes[plane]])<1e-10);
      }
      for(let axis=0;axis<3;axis++)if(axis!==plane){
        const values=spec.points.map(point=>point[axes[axis]]);
        assert.ok(Math.abs(Math.max(...values)-(center[axes[axis]]+radius))<1e-10);
        assert.ok(Math.abs(Math.min(...values)-(center[axes[axis]]-radius))<1e-10);
      }
      // Inspect the real Float32 cylinder mesh as well as the input path.
      // Its stroke has radius .035 A; allow a small floating-point margin.
      for(const group of state.wallShapes[plane].geo.geometryGroups){
        // The vendor reserves unused cap vertices at the origin; only indexed
        // vertices participate in the rendered triangles.
        for(const i of new Set(group.faceArray)){
          const offset=[0,1,2].map(axis=>group.vertexArray[3*i+axis]-center[axes[axis]]);
          assert.ok(offset.every(Number.isFinite));
          assert.ok(Math.abs(offset[plane])<=.036);
          assert.ok(Math.abs(Math.hypot(...offset)-radius)<=.045);
        }
      }
    });
    // The shipped vendor expands smooth:0 to 10 subdivisions: the old code
    // produced 349,920 vertices for the same three 72-segment circles.
    // Count actual generated mesh vertices, not just the requested option.
    const vertices=state.wallShapes.reduce((sum,shape)=>sum+shape.geo.vertices,0);
    assert.ok(vertices>0&&vertices<=40000,`${vertices} vertices exceed the wall mesh budget`);
  }
  assert.deepEqual(cameraCalls,[],'A wall update neither moves the camera nor renders an intermediate scene');
  drawWall(null);assert.equal(renderer.shapes.length,0);assert.equal(state.wallShapes.length,0);
});
