/* Fixed atom-selection helpers for the trajectory highlight view. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./geometry.js'));
  else if(typeof define==='function'&&define.amd)define(['./geometry'],factory);
  else root.HighlightSelection=factory(root.Geometry);
})(typeof globalThis!=='undefined'?globalThis:this,function(G){
  'use strict';

  if(!G||typeof G.inferCovalentBonds!=='function')throw new Error('HighlightSelection requer Geometry.inferCovalentBonds.');

  const isHydrogen=value=>String(value??'').trim().toUpperCase()==='H';
  const validIndex=(value,count)=>Number.isInteger(value)&&value>=0&&value<count;

  /*
   * Infer one covalent component from the coordinates of the selected frame.
   * The resulting indices are deliberately detached from the coordinates so
   * callers can keep this membership while rendering later frames.
   */
  function moleculeIndices(elements,coords,seed){
    if(!Array.isArray(elements)||!Number.isInteger(seed)||seed<0||seed>=elements.length)return [];
    if(!Array.isArray(coords)||coords.length<elements.length)return [seed];

    let inferred;
    try{inferred=G.inferCovalentBonds(elements,coords);}
    catch(_error){return [seed];}
    if(!Array.isArray(inferred)||inferred.length===0)return [seed];

    const pairs=[],seen=new Set(),closestHydrogen=new Map();
    const considerHydrogen=(hydrogen,other)=>{
      const distance=typeof G.distance==='function'?G.distance(coords[hydrogen],coords[other]):null;
      if(!Number.isFinite(distance))return;
      const current=closestHydrogen.get(hydrogen);
      if(!current||distance<current.distance||(distance===current.distance&&other<current.other)){
        closestHydrogen.set(hydrogen,{other,distance});
      }
    };
    for(const item of inferred){
      if(!Array.isArray(item)||item.length<2)continue;
      const a=Number(item[0]),b=Number(item[1]);
      if(!validIndex(a,elements.length)||!validIndex(b,elements.length)||a===b)continue;
      const first=Math.min(a,b),second=Math.max(a,b),key=first+':'+second;
      if(seen.has(key))continue;
      seen.add(key);
      const aIsH=isHydrogen(elements[a]),bIsH=isHydrogen(elements[b]);
      if(aIsH)considerHydrogen(a,b);
      if(bIsH)considerHydrogen(b,a);
      if(!aIsH&&!bIsH)pairs.push([first,second]);
    }

    const chosen=(hydrogen,other)=>{
      const choice=closestHydrogen.get(hydrogen);
      return !!choice&&choice.other===other;
    };
    for(const item of inferred){
      if(!Array.isArray(item)||item.length<2)continue;
      const a=Number(item[0]),b=Number(item[1]);
      if(!validIndex(a,elements.length)||!validIndex(b,elements.length)||a===b)continue;
      const first=Math.min(a,b),second=Math.max(a,b),key=first+':'+second;
      if(!seen.has(key))continue;
      const aIsH=isHydrogen(elements[a]),bIsH=isHydrogen(elements[b]);
      if(aIsH&&bIsH){
        if(chosen(a,b)&&chosen(b,a)&&!pairs.some(pair=>pair[0]===first&&pair[1]===second))pairs.push([first,second]);
      }else if(aIsH||bIsH){
        const hydrogen=aIsH?a:b,other=aIsH?b:a;
        if(chosen(hydrogen,other)&&!pairs.some(pair=>pair[0]===first&&pair[1]===second))pairs.push([first,second]);
      }
    }

    if(pairs.length===0)return [seed];
    const adjacency=Array.from({length:elements.length},()=>[]);
    for(const [a,b] of pairs){adjacency[a].push(b);adjacency[b].push(a);}
    const members=new Set([seed]),pending=[seed];
    while(pending.length){
      const current=pending.pop();
      for(const neighbor of adjacency[current])if(!members.has(neighbor)){members.add(neighbor);pending.push(neighbor);}
    }
    return [...members].sort((a,b)=>a-b);
  }

  function parseAtomIndices(text,count){
    if(!Number.isInteger(count)||count<0)throw new Error('A contagem de átomos deve ser um inteiro não negativo.');
    if(typeof text!=='string'||text.trim()==='')throw new Error('A seleção de átomos está vazia.');
    const source=text.trim();
    if(/^,|,$|,\s*,/.test(source))throw new Error('A seleção de átomos contém separadores vazios.');
    const tokens=source.split(/[\s,]+/),result=new Set();
    for(const token of tokens){
      let startText,endText;
      const range=token.match(/^(-?\d+)-(-?\d+)$/);
      if(range){startText=range[1];endText=range[2];}
      else if(/^-?\d+$/.test(token)){startText=token;endText=null;}
      else throw new Error(`Índice de átomo inválido: "${token}".`);
      const start=Number(startText),end=endText===null?start:Number(endText);
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end))throw new Error(`Índice de átomo fora dos limites: ${token}.`);
      if(start<0||end<0)throw new Error('Índices de átomos não podem ser negativos.');
      if(endText!==null&&start>end)throw new Error(`Intervalo de átomos invertido: ${token}.`);
      if(start>=count||end>=count)throw new Error(`Índice de átomo fora dos limites: ${token}.`);
      for(let index=start;index<=end;index++)result.add(index);
    }
    return [...result].sort((a,b)=>a-b);
  }

  return {moleculeIndices,parseAtomIndices};
});
