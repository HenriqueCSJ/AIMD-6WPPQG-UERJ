(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AIMD_XYZ_DOWNLOAD=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function frameText(xyz,index,label='Coordenadas do arquivo carregado'){
    const frame=xyz?.frames?.[index];
    if(!frame||frame.coords.length!==xyz.elements.length)throw new Error('Quadro XYZ indisponível.');
    const sourceClock=Number.isFinite(frame.sourceTime),time=sourceClock?frame.sourceTime:frame.time;
    const comment=`${String(label).replace(/[\r\n]/g,' ')}; quadro ${index+1}${Number.isFinite(time)?`; t= ${time} fs`:''}${sourceClock?`; sequence_time= ${frame.time} fs; source= ${String(frame.sourceKey||'').replace(/[\r\n]/g,' ')}`:''}; Unit is Angstrom`;
    const rows=xyz.elements.map((element,i)=>{
      const coords=frame.coords[i];
      if(coords.length!==3||!coords.every(Number.isFinite))throw new Error('Coordenadas XYZ inválidas.');
      return element+' '+coords.map(value=>String(value)).join(' ');
    });
    return [String(rows.length),comment,...rows,''].join('\n');
  }
  return {frameText};
});
