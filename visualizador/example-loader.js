/* Load only the selected teaching calculations, including from a local file:// copy. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.AIMDExampleLoader=factory().createLoader(root.AIMD_EXAMPLES,{
    loadScript:src=>new Promise((resolve,reject)=>{
      const script=document.createElement('script');let settled=false;
      const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);script.remove();error?reject(error):resolve();};
      const timer=setTimeout(()=>finish(new Error('A leitura demorou demais. Confira a conexão ou a pasta local e tente novamente.')),90000);
      script.async=true;script.src=src;
      script.onload=()=>finish();
      script.onerror=()=>finish(new Error('Não foi possível ler um arquivo do exemplo. Confira a conexão ou mantenha a pasta examples junto ao visualizador.'));
      document.head.append(script);
    })
  });
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function createLoader(store,options={}){
    const pending=new Map();
    function validateRun(run,key){
      if(!run||run.key!==key||!Array.isArray(run.files)||(!run.xyz&&!run.energy&&!run.out))throw new Error(`O arquivo de ${key} está incompleto. Tente carregar o exemplo novamente.`);
      if(run.xyz&&(!Array.isArray(run.xyz.frames)||!run.xyz.frames.length||!Array.isArray(run.xyz.elements)||!run.xyz.elements.length))throw new Error(`A trajetória de ${key} está incompleta.`);
      return run;
    }
    function loadRun(key){
      if(store?.runs?.[key]){try{return Promise.resolve(validateRun(store.runs[key],key));}catch(error){delete store.runs[key];}}
      if(pending.has(key))return pending.get(key);
      const source=store?.sources?.[key];
      if(!source?.src||typeof options.loadScript!=='function')return Promise.reject(new Error(`O arquivo de ${key} não foi encontrado no pacote de exemplos.`));
      const job=Promise.resolve().then(()=>options.loadScript(source.src)).then(()=>validateRun(store.runs[key],key));
      pending.set(key,job);
      job.then(()=>pending.delete(key),()=>{pending.delete(key);delete store.runs[key];});
      return job;
    }
    async function loadPreset(key){
      const config=store?.presets?.[key];
      if(config?.awaitingResults===true&&Array.isArray(config.runs)&&config.runs.length===0)return {config,runs:[]};
      if(!config||!Array.isArray(config.runs)||!config.runs.length)throw new Error('O exemplo não foi encontrado. Você pode escolher outro ou carregar seus próprios arquivos.');
      const runs=await Promise.all(config.runs.map(loadRun));
      return {config,runs};
    }
    return {loadPreset};
  }
  return {createLoader};
});
