/* ORCA 6.1 MD reader. Pure functions shared by the browser and the tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OrcaReader = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const HARTREE_TO_KJMOL = 2625.4996394799;
  const FLOAT = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eEdD][+-]?\d+)?$/;
  const numeric = value => {
    const text = String(value ?? '').trim();
    return FLOAT.test(text) && Number.isFinite(Number(text.replace(/[dD]/, 'e'))) ? Number(text.replace(/[dD]/, 'e')) : null;
  };
  const clean = text => String(text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const median = values => {
    if (!values.length) return null;
    const a = [...values].sort((x,y) => x-y), n = a.length;
    return n % 2 ? a[(n-1)/2] : (a[n/2-1]+a[n/2])/2;
  };
  const field = (header, name) => header.findIndex(x => x.replace(/^#\s*/, '').trim().toLowerCase() === name.toLowerCase());
  function runKey(name) {
    return name.split(/[\\/]/).pop().replace(/\.(csv|out|log|xyz|inp)$/i, '').replace(/(?:[-_.]md[-_.]ener(?:gies)?|[-_.](?:traj|pos|colvars)|\.solvator(?:\.solventbuild)?)$/i, '');
  }
  function segmentRows(rows, warnings, label='série') {
    const gaps = rows.slice(1).map((r,i) => r.step !== null && rows[i].step !== null ? r.step-rows[i].step : r.time-rows[i].time).filter(x => x>0);
    const middle=median(gaps),usual=median(gaps.filter(g=>g<=middle)); let segment=0, breaks=0;
    rows.forEach((r,i) => {
      if(i) {
        const prev=rows[i-1], gap = r.step !== null && prev.step !== null ? r.step-prev.step : r.time-prev.time;
        if(r.time<=prev.time || gap<=0 || (usual && gap>Math.max(usual*1.8,usual+0.11)) || r.breakBefore) {segment++;breaks++;}
      }
      r.segment=segment;
    });
    if(breaks) warnings.push(`${label}: ${breaks} interrupção(ões) ou reinício(s). Os trechos não foram unidos no gráfico.`);
    return rows;
  }
  function energyRow(header, fields) {
    const read = key => {const i=field(header,key);return i<0?null:numeric(fields[i]);};
    return {step:read('Step'),time:read('Sim. Time'),kinetic:read('E_Kin'),potential:read('E_Pot'),total:read('E_Tot'),temperature:read('Temp'),conserved:read('Cons.Qty'),orcaDriftK:read('E.Drift')};
  }
  function parseEnergyCSV(text, name='dados-md-ener.csv') {
    const lines=clean(text).split('\n'), start=lines.findIndex(x=>/\bSim\. Time\b/i.test(x)&&/E_(?:Kin|Pot|Tot)/.test(x));
    if(start<0) throw new Error('Não encontrei o cabeçalho de energias do ORCA (Sim. Time, E_Kin, E_Pot, E_Tot).');
    const header=lines[start].split(';').map(x=>x.trim()), warnings=[], rows=[];
    for(const key of ['Step','Sim. Time']) if(field(header,key)<0) throw new Error(`Falta a coluna ${key}.`);
    let bad=0, partial=false;
    for(let i=start+1;i<lines.length;i++) {
      const line=lines[i].trim(); if(!line)continue;
      if(/^#/.test(line)) {partial=true;continue;}
      const fields=line.split(';');if(fields.length<header.length){bad++;partial=true;continue;}
      const row=energyRow(header,fields);
      if(row.time===null || row.step===null || !Number.isInteger(row.step)) {bad++;partial=true;continue;}
      if([row.kinetic,row.potential,row.total,row.temperature].every(x=>x===null)) {bad++;partial=true;continue;}
      row.breakBefore=partial;partial=false;rows.push(row);
    }
    if(!rows.length) throw new Error('O CSV não contém linhas numéricas utilizáveis.');
    const missing=['E_Kin','E_Pot','E_Tot','Temp'].filter(k=>field(header,k)<0);
    if(missing.length)warnings.push(`Coluna(s) ausente(s): ${missing.join(', ')}. Nenhum valor foi preenchido com zero.`);
    if(bad)warnings.push(`${bad} linha(s) incompleta(s) ou inválida(s) ignorada(s). O cálculo pode estar em andamento.`);
    if(rows.some(r=>[r.kinetic,r.potential,r.total,r.temperature].some(x=>x===null)))warnings.push('Há valores ausentes; os gráficos mantêm essas lacunas.');
    segmentRows(rows,warnings);
    return {kind:'energy',name,key:runKey(name),rows,warnings,source:'csv',units:{time:'fs',energy:'Eh',temperature:'K'},metadata:{ensemble:'unknown'}};
  }
  function metadataFromOut(text) {
    const input=text.split('\n').filter(x=>/^\s*\|\s*\d+>/.test(x)).map(x=>x.replace(/^\s*\|\s*\d+>\s*/, '').split('#')[0]).join('\n');
    const thermo=input.match(/Thermostat\s+(\S+)(?:\s+(\d+(?:\.\d+)?)_?K)?/i);
    const dt=input.match(/Timestep\s+([\d.]+)(?:_|\s+)?fs/i);
    const charge=input.match(/\*\s*xyz(?:file)?\s+(-?\d+)\s+(\d+)/i);
    const version=text.match(/Program Version\s+([\d.]+)/i);
    const runtime=text.match(/TOTAL RUN TIME:\s*(\d+) days\s+(\d+) hours\s+(\d+) minutes\s+(\d+) seconds\s+(\d+) msec/i);
    const defs=[...input.matchAll(/Manage_Colvar\s+Define\s+(\d+)\s+Distance\s+Atom\s+(\d+)\s+Atom\s+(\d+)/ig)].map(m=>({id:Number(m[1]),a:Number(m[2]),b:Number(m[3])}));
    const finalE=[...text.matchAll(/FINAL SINGLE POINT ENERGY\s+([+-]?[\d.]+(?:[Ee][+-]?\d+)?)/g)];
    const hasMD=/!.*\bMD\b/i.test(input) || /ORCA ab initio Molecular Dynamics/.test(text);
    const thermostats=[...input.matchAll(/Thermostat\s+(\S+)(?:\s+([\d.]+)_?K)?/ig)].map(m=>m[0].toLowerCase());
    const changingConditions=new Set(thermostats).size>1;
    const activeThermostat=thermo&&!/^none$/i.test(thermo[1]);
    // Read only an unambiguous, fixed sphere in Angstrom; other geometries stay undisplayed.
    const sphereLine=(input.match(/^.*\b(?:Cell|Walls)\s+Sphere\b.*$/im)||[])[0]||'';
    const sphere=sphereLine.match(/\b(?:Cell|Walls)\s+Sphere\s+([+-]?[\d.]+)\s*,\s*([+-]?[\d.]+)\s*,\s*([+-]?[\d.]+)\s*,\s*([\d.]+)(?:_A(?:ngstrom)?)?(?=\s*(?:Spring\b|Fixed\b|$))/im);
    const sphereValues=sphere?sphere.slice(1,5).map(Number):null;
    const wallSphere=sphereValues&&sphereValues.every(Number.isFinite)&&sphereValues[3]>0&&!/\b(?:Elastic|Pressure)\b/i.test(sphereLine)?{center:{x:sphereValues[0],y:sphereValues[1],z:sphereValues[2]},radius:sphereValues[3]}:null;
    return {wallSphere,version:version?.[1]||null,method:(input.match(/^\s*!\s*(.*)$/m)||[])[1]||null,ensemble:changingConditions||/\bBarostat\s+(?!None\b)/i.test(input)?'unknown':activeThermostat?'NVT':hasMD&&input?'NVE':'unknown',thermostat:activeThermostat?thermo[1]:null,targetTemperature:changingConditions?null:thermo?.[2]?Number(thermo[2]):null,timestep:dt?Number(dt[1]):null,charge:charge?Number(charge[1]):null,multiplicity:charge?Number(charge[2]):null,wall:/\b(?:Cell|Walls)\s+(Sphere|Cube|Cuboid)/i.test(input),normal:/ORCA TERMINATED NORMALLY/.test(text),failed:/ORCA finished by error termination|ERROR TERMINATION|orca_md aborted by error|Errors occurred in the MD loop/.test(text),runtime:runtime?Number(runtime[1])*86400+Number(runtime[2])*3600+Number(runtime[3])*60+Number(runtime[4])+Number(runtime[5])/1000:null,colvars:defs,finalEnergy:finalE.length?Number(finalE.at(-1)[1]):null,hasMD,changingConditions};
  }
  function parseOut(text,name='calculo.out') {
    text=clean(text);if(!/ORCA|O\s+R\s+C\s+A|Program Version/.test(text))throw new Error('O arquivo não foi reconhecido como uma saída ORCA.');
    const lines=text.split('\n'),metadata=metadataFromOut(text),warnings=[],rows=[];
    let header=null,cuts=null;
    for(const line of lines) {
      if(/^\s*Step\s*\|\s*Sim\. Time\s*\|/.test(line)) {header=line.split('|').map(x=>x.trim());cuts=[-1,...[...line.matchAll(/\|/g)].map(m=>m.index)];continue;}
      if(!header || !/^\s*\d+\s+[+-]?\d/.test(line))continue;
      const fields=cuts.map((c,i)=>line.slice(c+1,i+1<cuts.length?cuts[i+1]:line.length));
      const row=energyRow(header,fields);
      if(row.time!==null&&row.step!==null&&[row.kinetic,row.potential,row.total].some(x=>x!==null))rows.push(row);
    }
    if(rows.length) {
      segmentRows(rows,warnings,'Saída .out');
      warnings.unshift('O .out pode imprimir apenas parte dos passos. Adicione o arquivo -md-ener.csv para a série completa.');
    }
    if(metadata.changingConditions)warnings.push('O input contém mudanças de termostato/temperatura. Confira cada trecho antes de atribuir um único ensemble.');
    if(metadata.failed)warnings.push('O ORCA registrou término com erro. Os dados exibidos são parciais.');
    else if(!metadata.normal)warnings.push('O arquivo não contém a mensagem de término normal. Pode estar incompleto ou em andamento.');
    const actualFail=/SCF NOT CONVERGED|SCF DID NOT CONVERGE/.test(text);
    if(actualFail)warnings.push('Foi encontrada indicação de falha SCF. Confira a saída antes de interpretar a dinâmica.');
    return {kind:'out',name,key:runKey(name),rows,warnings,metadata,source:'out',units:{time:'fs',energy:'Eh',temperature:'K'}};
  }
  function parseColvars(text,name='dados-colvars.csv') {
    const lines=clean(text).split('\n'),start=lines.findIndex(x=>/Simulation Time/.test(x)&&/Colvar\s+\d+\s+Position/.test(x));
    if(start<0)throw new Error('Cabeçalho de Colvars do ORCA não encontrado.');
    const header=lines[start].split(';').map(x=>x.trim()), columns=[];
    header.forEach((h,i)=>{const m=h.match(/^Colvar\s+(\d+)\s+Position\s*\/\s*(Angstrom)\s*$/i);if(m)columns.push({index:i,id:Number(m[1]),unit:'Å'});});
    if(!columns.length)throw new Error('Não há Colvars de distância em Angstrom. Ângulos e forças não são tratados como distâncias.');
    const rows=[],warnings=[];let bad=0,partial=false;
    for(const line of lines.slice(start+1)) {
      if(!line.trim())continue; const fields=line.split(';'),time=numeric(fields[0]);
      if(time===null){bad++;partial=true;continue;}
      const values={};columns.forEach(c=>values[c.id]=numeric(fields[c.index]));rows.push({time,step:null,values,breakBefore:partial});partial=false;
    }
    if(!rows.length)throw new Error('Nenhuma distância numérica encontrada.');
    if(bad)warnings.push(`${bad} linha(s) incompleta(s) em Colvars.`);
    segmentRows(rows,warnings,'Distâncias');
    return {kind:'colvars',name,key:runKey(name),rows,columns,warnings};
  }
  function parseXYZ(text,name='trajetoria.xyz') {
    const lines=clean(text).split('\n'),frames=[],warnings=[];let i=0,elements=null;
    while(i<lines.length) {
      if(!lines[i].trim()){i++;continue;}
      const count=numeric(lines[i]);
      if(!Number.isInteger(count)||count<1||count>10000)throw new Error(`XYZ inválido: contagem de átomos na linha ${i+1}.`);
      if(i+count+2>lines.length || lines.slice(i+2,i+count+2).some(x=>!x.trim())) {warnings.push('Último quadro XYZ incompleto: foram preservados apenas os quadros completos.');break;}
      const comment=lines[i+1]||'',coords=[],els=[];
      if(/velocity|force|gradient/i.test(comment) && !/position/i.test(comment))throw new Error('Este XYZ contém velocidades ou forças, não posições. Selecione a trajetória de posições.');
      if(/Unit\s+is\s+(?!Angstrom\b)\S+/i.test(comment))throw new Error('Unidade XYZ diferente de Angstrom. Converta as coordenadas antes de carregar.');
      for(let j=0;j<count;j++) {
        const parts=lines[i+2+j].trim().split(/\s+/),values=parts.slice(1,4).map(numeric);
        if(!/^[A-Za-z]{1,2}$/.test(parts[0])||values.length!==3||values.some(x=>x===null))throw new Error(`Coordenada inválida na linha ${i+3+j}.`);
        els.push(parts[0][0].toUpperCase()+parts[0].slice(1).toLowerCase());coords.push(values);
      }
      if(elements&&(elements.length!==els.length||elements.some((e,k)=>e!==els[k])))throw new Error('Número ou ordem dos elementos mudou entre quadros. As distâncias não podem ser acompanhadas com segurança.');
      elements=els;const tm=comment.match(/\bt\s*=\s*([\d.+Ee-]+)\s*(fs|ps|ns|s)\b/i),st=comment.match(/\bStep\s+(\d+)/i);
      const time=tm?Number(tm[1])*({fs:1,ps:1e3,ns:1e6,s:1e15}[tm[2].toLowerCase()]):null;
      frames.push({time,step:st?Number(st[1]):null,coords,comment});i+=count+2;
    }
    if(!frames.length)throw new Error('O XYZ não contém quadros completos.');
    if(!frames.every(f=>f.time!==null))warnings.push('XYZ sem tempo físico em todos os comentários: a navegação usa o número do quadro.');
    if(!frames.some(f=>/Unit is Angstrom/i.test(f.comment)))warnings.push('XYZ convencional: coordenadas interpretadas em Å.');
    if(frames.every(f=>f.time!==null))segmentRows(frames,warnings,'Trajetória');
    else frames.forEach(f=>f.segment=0);
    return {kind:'xyz',name,key:runKey(name),elements,frames,warnings};
  }
  function parseFile(text,name) {
    if(text.length>80*1024*1024)throw new Error('Arquivo acima de 80 MB. Para a aula, selecione uma trajetória mais curta.');
    if(/\.xyz$/i.test(name))return parseXYZ(text,name);
    if(/Simulation Time;.*Colvar/i.test(text.slice(0,15000)))return parseColvars(text,name);
    if(/Sim\. Time;.*E_(?:Kin|Pot|Tot)/.test(text.slice(0,15000)))return parseEnergyCSV(text,name);
    if(/\.(out|log)$/i.test(name)||/O\s+R\s+C\s+A|Program Version|ORCA ab initio/.test(text.slice(0,20000)))return parseOut(text,name);
    throw new Error('Formato não reconhecido. Use a saída .out, o CSV de energias/Colvars ou a trajetória .xyz do ORCA.');
  }
  function stats(rows,key) {
    const vals=rows.map(r=>r[key]).filter(Number.isFinite);
    if(!vals.length)return null;
    let min=Infinity,max=-Infinity,sum=0;
    vals.forEach(v=>{min=Math.min(min,v);max=Math.max(max,v);sum+=v;});
    return {count:vals.length,min,max,span:max-min,mean:sum/vals.length,initial:vals[0],final:vals.at(-1),delta:vals.at(-1)-vals[0]};
  }
  function distanceSeries(xyz,a,b) {
    if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=xyz.elements.length||b>=xyz.elements.length||a===b)throw new Error('Escolha dois átomos distintos presentes no XYZ.');
    const timed=xyz.frames.every(f=>f.time!==null);
    return xyz.frames.map((f,i)=>({time:timed?f.time:i+1,step:f.step,segment:f.segment||0,value:Math.hypot(...f.coords[a].map((x,j)=>x-f.coords[b][j]))}));
  }
  function validateEnergySources(csv,out) {
    if(!csv||!out||!out.rows.length)return null;
    const index=new Map(csv.rows.map(r=>[`${r.step}:${r.time}`,r]));let matches=0;
    for(const row of out.rows){const other=index.get(`${row.step}:${row.time}`);if(!other)continue;matches++;
      if(['kinetic','potential','total','temperature'].some(k=>row[k]!==null&&other[k]!==null&&Math.abs(row[k]-other[k])>(k==='temperature'?.02:2e-6)))return 'O .out e o CSV com este nome apresentam valores diferentes. Eles foram mantidos separados.';
    }
    if(!matches)return 'O .out e o CSV não possuem passos/tempos em comum. A associação precisa ser conferida.';
    return null;
  }
  return {HARTREE_TO_KJMOL,numeric,runKey,parseFile,parseEnergyCSV,parseOut,parseColvars,parseXYZ,stats,distanceSeries,validateEnergySources,segmentRows};
});
