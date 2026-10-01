/* Run manually: node visualizador/tests/geometry-benchmark.cjs
   Reports measured CPU time and exact equivalence; no fragile timing assertions. */
const {performance}=require('node:perf_hooks'),assert=require('node:assert/strict');
const G=require('../geometry.js'),brute=require('./geometry-reference.cjs');
const sizes=process.argv.slice(2).length?process.argv.slice(2).map(Number):[100,400,1000];
for(const waters of sizes){
 if(!Number.isInteger(waters)||waters<1||waters>10000)throw new Error('Supply water counts between 1 and 10000');
 const data=brute.waterBox(waters),report={waters,atoms:data.elements.length};
 for(const name of ['inferCovalentBonds','hydrogenBonds','coordinationContacts']){
  const start=performance.now(),expected=brute[name](data.elements,data.coords),bruteMs=performance.now()-start;
  G[name](data.elements,data.coords); // Warm up the optimized path, outside timing.
  const samples=[];let result;
  for(let i=0;i<3;i++){const then=performance.now();result=G[name](data.elements,data.coords);samples.push(performance.now()-then);}
  assert.deepEqual(result,expected,name);
  const spatialMs=samples.sort((a,b)=>a-b)[1];
  report[name]={matches:result.length,bruteMs:+bruteMs.toFixed(2),spatialMedianMs:+spatialMs.toFixed(2),speedup:+(bruteMs/spatialMs).toFixed(2)};
 }
 console.log(JSON.stringify(report));
}
