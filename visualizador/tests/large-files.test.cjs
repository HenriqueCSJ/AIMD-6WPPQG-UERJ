const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../orca-parser.js'),root=path.resolve(__dirname,'../..');

test('one-gigabyte limit is inclusive; oversized files are rejected before any read',async()=>{
  assert.equal(R.MAX_FILE_BYTES,1073741824);
  let reads=0;
  await assert.rejects(R.parseBlob({size:R.MAX_FILE_BYTES+1,name:'large.out',slice(){reads++;throw new Error('Must not read');}}),/1 GB/);
  assert.equal(reads,0);
});

test('chunked reads preserve UTF-8, BOM, CRLF, CR, LF, final lines and incomplete XYZ tails',async()=>{
  const fixtures=[
    ['traj.xyz','\ufeff2\r\nt=0 fs · posições 🧪\r\nH 0 0 0\r\nO 0 0 1\r\n2\r\nt=.5 fs\r\nH 0 0 0\r\nO 0 0 2'],
    ['traj.xyz','2\rcomentário\rH 0 0 0\rH 0 0 1\r2\rparcial\rH 0 0 0\r'],
    ['energy.csv','\ufeff# Step; Sim. Time; Temp; E_Kin; E_Pot; E_Tot\r\n0;0;300;.01;-1;-.99\r\n1;0.5;301;.02;-1;-.98'],
    ['colvars.csv','# Simulation Time; Colvar 1 Position / Angstrom\n0;1\n.5;2\n'],
    ['done.out','ORCA\nProgram Version 6.1.1\n| 1> ! MD XTB2\n| 2> %md\n| 3> Thermostat None\n| 4> end\nFINAL SINGLE POINT ENERGY -1\nFINAL SINGLE POINT ENERGY -2\nORCA TERMINATED NORMALLY\n'],
    ['failed.out','ORCA\nSCF NOT CONVERGED\nErrors occurred in the MD loop\n']
  ];
  for(const [name,text] of fixtures)for(let chunkSize=1;chunkSize<=17;chunkSize++){
    const progress=[],blob=new Blob([text]);
    const actual=await R.parseBlob(blob,name,(read,total)=>progress.push([read,total]),chunkSize);
    assert.deepEqual(actual,R.parseFile(text,name),`${name}, chunk ${chunkSize}`);
    assert.deepEqual(progress.at(-1),[blob.size,blob.size]);
  }
});

test('streamed XYZ still rejects changed atoms, wrong units and invalid coordinates',async()=>{
  const first='2\nt=0 fs\nH 0 0 0\nH 0 0 1\n';
  for(const [text,error] of [
    [first+'2\nt=.5 fs\nH 0 0 0\nO 0 0 1\n',/ordem/],
    [first.replace('t=0 fs','Unit is Bohr'),/Unidade/],
    [first.replace('H 0 0 1','H 0 x 1'),/Coordenada/]
  ])await assert.rejects(R.parseBlob(new Blob([text]),'traj.xyz',undefined,7),error);
});

test('real ORCA files retain all frames, physical values, warnings and metadata when streamed',async()=>{
  const files=[
    'exercicios/7-dinamica-complexo/resultados/zn_parede/zn_parede-traj.xyz',
    'exercicios/7-dinamica-complexo/resultados/zn_parede/zn_parede-colvars.csv',
    'exercicios/5-termostato/resultados/etanol_etapas/etanol_etapas-md-ener.csv',
    'exercicios/5-termostato/resultados/etanol_etapas/etanol_etapas.out',
    'exercicios/4-timestep/resultados/etanol_instavel/etanol_instavel.out'
  ];
  for(const file of files){
    const buffer=fs.readFileSync(path.join(root,file)),name=path.basename(file);
    assert.deepEqual(await R.parseBlob(new Blob([buffer]),name,undefined,16*1024),R.parseFile(buffer.toString('utf8'),name),file);
  }
});

test('a complete 1 GiB output is read in bounded parts, beyond the old 80 MiB limit',async()=>{
  // Virtual file produces every requested byte. No 1 GiB buffer or string is allocated.
  const prefix=Buffer.from('ORCA\nProgram Version 6.1.1\nFINAL SINGLE POINT ENERGY -1\nORCA TERMINATED NORMALLY\n');
  let readBytes=0,largestRead=0,lastProgress=0;
  const file={size:R.MAX_FILE_BYTES,name:'one-gigabyte.out',slice(start,end){
    return {async arrayBuffer(){
      const size=Math.min(end,file.size)-start,buffer=Buffer.alloc(size,32);
      for(let absolute=Math.ceil((start+1)/4096)*4096-1;absolute<start+size;absolute+=4096)buffer[absolute-start]=10;
      if(start<prefix.length)prefix.copy(buffer,0,start,Math.min(prefix.length,start+size));
      readBytes+=size;largestRead=Math.max(largestRead,size);
      return buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength);
    }};
  }};
  const data=await R.parseBlob(file,file.name,(read,total)=>{assert.equal(total,file.size);assert.ok(read>lastProgress);lastProgress=read;});
  assert.equal(data.metadata.normal,true);assert.equal(data.metadata.finalEnergy,-1);
  assert.equal(lastProgress,R.MAX_FILE_BYTES);
  assert.equal(readBytes,R.MAX_FILE_BYTES+20000); // format sniff + full file
  assert.equal(largestRead,4*1024*1024);
});
