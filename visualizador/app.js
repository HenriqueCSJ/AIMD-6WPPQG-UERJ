(function(){
  'use strict';
  const R=OrcaReader,$=id=>document.getElementById(id),num=(n,p=5)=>chartNumber(n,p);
  const colors=['#006e66','#a35b00','#6853a6','#176ba0','#a54664','#55612b'];
  const referenceColors={etanol_dt500:colors[4],etanol_corrigido:colors[0],zn_parede_longo:colors[0],zn_sem_parede_longo:colors[1],agua_c60:colors[0],agua_dft:colors[0],agua_cpcm:colors[1],etanol_dt025:colors[0],etanol_nve:colors[1],etanol_dt200:colors[2],etanol_csvr:colors[0],zn_parede:colors[0],zn_sem_parede:colors[1],zn_solvator:colors[0],preparar_complexo:colors[1]};
  const patterns=['','7 3','2 3','9 3 2 3','12 3','4 2 1 2','1 4','10 2 3 2','5 5','12 3 2 3 2 3','3 2','8 5'];
  const elementColors={H:'#d9e0e3',C:'#465563',N:'#386ea8',O:'#c45448',Zn:'#8b71a8',S:'#b99425',P:'#bc7538',Cl:'#5f9548',F:'#75a56f',Na:'#8675b8',Mg:'#7caa61',Fe:'#b57545',Cu:'#a66e4e'};
  const elementRadii={H:.23,C:.37,N:.35,O:.34,Zn:.53,S:.44,P:.44};
  const state={runs:[],nextId:1,tab:'energy',viewer:null,initialView:null,model:null,viewRun:null,frame:0,selectedAtom:null,playing:false,timer:null,playback:{runId:null,startFrame:0,baseDuration:0,phase:0,lastTimestamp:null},timeFormat:null,pairs:{},colvars:{},distanceSeries:[],busy:false};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const energy=run=>run.energy||run.out;
  const metadata=run=>run.out?.metadata||{};
  const ensemble=run=>run.ensembleOverride||metadata(run).ensemble||'unknown';
  const visible=()=>state.runs.filter(r=>r.visible);
  const timeFactor=()=>({fs:1,ps:1e-3,s:1e-15}[$('time-unit').value]);
  const energyFactor=()=>$('energy-unit').value==='eh'?1:R.HARTREE_TO_KJMOL;
  const energyUnit=()=>$('energy-unit').value==='eh'?'Eh':'kJ/mol';
  function decimalPlaces(value){
    const magnitude=Math.abs(value);if(!Number.isFinite(magnitude)||magnitude===0)return 0;
    for(let places=0;places<=8;places++){const scale=10**places;if(Math.abs(magnitude*scale-Math.round(magnitude*scale))<=1e-7*Math.max(1,magnitude*scale))return places;}
    return 8;
  }
  function fixedNumber(value,places){
    if(!Number.isFinite(value))return '—';const scale=10**places,rounded=Math.round(value*scale)/scale;
    return new Intl.NumberFormat('pt-BR',{useGrouping:false,minimumFractionDigits:places,maximumFractionDigits:places}).format(Object.is(rounded,-0)?0:rounded);
  }
  function timeFormat(frames){
    const times=frames.map(frame=>frame.time).filter(Number.isFinite);if(!times.length)return null;
    const min=times.reduce((a,b)=>Math.min(a,b),Infinity),max=times.reduce((a,b)=>Math.max(a,b),-Infinity),range=Math.abs(max-min);
    let stride=Infinity;for(let i=1;i<times.length;i++){const step=Math.abs(times[i]-times[i-1]);if(step>1e-12)stride=Math.min(stride,step);}
    if(!Number.isFinite(stride))stride=range||1;
    const fsDigits=Math.min(8,Math.max(decimalPlaces(stride),decimalPlaces(min),decimalPlaces(max)));
    const maxSeconds=Math.max(Math.abs(min),Math.abs(max))*1e-15;
    const secondsExponent=maxSeconds?Math.floor(Math.log10(maxSeconds)):0;
    const scaledStride=stride*1e-15/10**secondsExponent;
    const secondsDigits=Math.min(8,Math.max(0,decimalPlaces(scaledStride),decimalPlaces(min*1e-15/10**secondsExponent)));
    const psDigits=Math.min(8,Math.max(decimalPlaces(stride/1000),decimalPlaces(min/1000),decimalPlaces(max/1000)));
    return {fsDigits,psDigits,secondsExponent,secondsDigits};
  }
  function exponentText(exponent){return String(exponent).split('').map(c=>({'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}[c])).join('');}
  function physicalTimeValues(time){
    if(time===null||time===undefined||!Number.isFinite(time))return {fs:'Tempo não informado',ps:'Tempo não informado',s:'Tempo não informado'};
    const format=state.timeFormat;if(!format)return {fs:'Tempo não informado',ps:'Tempo não informado',s:'Tempo não informado'};
    const secondsScale=10**format.secondsExponent;
    return {fs:`${fixedNumber(time,format.fsDigits)} fs`,ps:`${fixedNumber(time/1000,format.psDigits)} ps`,s:`${fixedNumber(time*1e-15/secondsScale,format.secondsDigits)} × 10${exponentText(format.secondsExponent)} s`};
  }
  function playbackDuration(frames){
    if(frames.length<5)return 2000;
    const first=frames[0].time,last=frames.at(-1).time;
    // Same physical span gets the same visual pace, regardless of dump stride.
    const span=Number.isFinite(first)&&Number.isFinite(last)&&last>first?(last-first)*7.6:Math.max(0,frames.length-41)*4;
    return Math.min(8000,Math.max(1200,1200+span));
  }
  function ensureTrajectoryReadouts(){
    const timeline=$('frame-time');
    if(!timeline.dataset.ready){
      const frameLabel=document.createElement('span');frameLabel.className='frame-index';
      const separator=document.createElement('span');separator.className='frame-separator';separator.textContent=' · ';
      const timeLabel=document.createElement('span');timeLabel.className='frame-time-value';
      timeline.replaceChildren(frameLabel,separator,timeLabel);timeline.dataset.ready='1';
    }
    const values=$('frame-values');
    if(values.dataset.ready)return;
    values.replaceChildren();
    const fields=[['time','Tempo físico'],['temperature','Temperatura'],['potential','Energia potencial'],['atoms','Átomos']];
    fields.forEach(([key,label])=>{
      const row=document.createElement('div');row.className='frame-value';
      const name=document.createElement('span');name.textContent=label;row.append(name);
      const value=document.createElement('strong');
      if(key==='time'){
        value.className='time-readout';
        for(const unit of ['fs','ps','s']){const line=document.createElement('span');line.className=`time-${unit}`;line.id=`frame-time-${unit}`;value.append(line);}
      }else{value.id=`frame-${key}`;}
      row.append(value);values.append(row);
    });
    values.dataset.ready='1';
  }
  function message(text,info=false){$('message').textContent=text;$('message').classList.toggle('info',info);$('message').hidden=!text;}
  function stop(){state.playing=false;if(state.timer!==null){cancelAnimationFrame(state.timer);state.timer=null;}state.playback.lastTimestamp=null;$('play-button').textContent='▶ Reproduzir';}
  function makeRun(key,label,reference=false){const id=state.nextId++;return {id,key,label:label||key,reference,visible:true,color:colors[(id-1)%colors.length],files:[],warnings:[]};}
  function addParsed(run,parsed){
    const slot=parsed.kind==='xyz'?'xyz':parsed.kind==='colvars'?'colvars':parsed.kind==='out'?'out':'energy';
    const issue=R.validateEnergySources(slot==='energy'?parsed:run.energy,slot==='out'?parsed:run.out);
    if(issue)throw new Error(issue);
    run[slot]=parsed;run.files.push({name:parsed.name,kind:parsed.kind});
  }
  async function importFiles(files){
    if(state.busy)return;state.busy=true;document.body.classList.add('busy');stop();message('Lendo os arquivos…',true);
    const warnings=[],groups=new Map();let accepted=0,trajectoryRun=null;
    for(const file of files){
      if(file.size>80*1024*1024){warnings.push(`${file.name}: limite de 80 MB por arquivo.`);continue;}
      try{const parsed=R.parseFile(await file.text(),file.name);warnings.push(...parsed.warnings.filter(w=>!w.startsWith('O .out pode')&&!w.startsWith('XYZ convencional')).map(w=>`${file.name}: ${w}`));if(!groups.has(parsed.key))groups.set(parsed.key,[]);groups.get(parsed.key).push(parsed);}
      catch(error){warnings.push(`${file.name}: ${error.message}`);}
    }
    for(const [key,parts] of groups){
      let run=state.runs.find(r=>!r.reference&&r.key===key&&!parts.some(p=>r[p.kind==='xyz'?'xyz':p.kind==='colvars'?'colvars':p.kind==='out'?'out':'energy']));
      if(!run){run=makeRun(key);const n=state.runs.filter(r=>r.key===key).length;if(n)run.label=`${key} (${n+1})`;state.runs.push(run);}
      for(const part of parts){try{addParsed(run,part);accepted++;if(part.kind==='xyz'&&!trajectoryRun)trajectoryRun=run;}catch(error){const separate=makeRun(key,`${key} · ${part.kind==='out'?'.out':'CSV'} separado`);addParsed(separate,part);state.runs.push(separate);warnings.push(error.message);accepted++;if(part.kind==='xyz'&&!trajectoryRun)trajectoryRun=separate;}}
    }
    const selected=visible();if(selected.length>4){selected.slice(4).forEach(r=>r.visible=false);warnings.push('Quatro simulações selecionadas para comparação. Use as caixas para escolher outras.');}
    state.busy=false;document.body.classList.remove('busy');$('file-input').value='';
    if(trajectoryRun)state.tab='trajectory';
    renderAll(trajectoryRun?.id);message([accepted?`${accepted} arquivo(s) carregado(s).`:'Nenhum arquivo foi carregado.',accepted&&!state.runs.some(r=>r.xyz)?'Para ver o movimento em 3D, carregue também o arquivo -traj.xyz.':'',...warnings].filter(Boolean).join('\n'),warnings.length===0);
    if(accepted)$(trajectoryRun?'tab-trajectory':'workspace').scrollIntoView({block:'start',behavior:'smooth'});
  }
  function loadExample(key,preferredTab){
    const config=window.AIMD_EXAMPLES?.presets[key];if(!config){message('O pacote de exemplos não foi encontrado. Você pode carregar seus próprios arquivos.');return;}
    stop();state.runs=state.runs.filter(r=>!r.reference);state.runs.forEach(r=>r.visible=false);
    for(const sourceKey of config.runs){let run=state.runs.find(r=>r.exampleKey===sourceKey);if(!run){const src=structuredClone(AIMD_EXAMPLES.runs[sourceKey]);run=Object.assign(makeRun(sourceKey,src.label,true),src,{exampleKey:sourceKey,visible:true});run.color=referenceColors[sourceKey]||run.color;state.runs.push(run);}run.visible=true;}
    document.querySelectorAll('[name="energy-series"]').forEach(c=>c.checked=config.runs.length>1?c.value==='total':true);
    $('energy-mode').value='delta';$('time-unit').value='fs';state.tab=preferredTab||config.tab||'energy';renderAll();
    const current=visible()[0];if(current){$('trajectory-run').value=current.id;$('distance-run').value=current.id;}
    changeTab(state.tab);message('Exemplo de referência carregado. São dados reais calculados pelos ministrantes; não são uma execução feita por você.',true);
    $(state.tab==='trajectory'?'tab-trajectory':'workspace').scrollIntoView({block:'start',behavior:'smooth'});
  }
  function renderRuns(){
    $('runs').innerHTML=state.runs.map(r=>{const n=energy(r)?.rows.length||0;return `<div class="run-card" style="--run-color:${r.color}"><label><input type="checkbox" data-run="${r.id}" ${r.visible?'checked':''}><span><strong>${esc(r.label)}</strong><small>${r.reference?'Referência da aula':'Seu arquivo'} · ${n?n+' pontos':r.xyz?r.xyz.elements.length+' átomos':'sem série MD'}</small></span></label><button type="button" class="remove-run" data-remove="${r.id}" aria-label="Remover ${esc(r.label)}">×</button></div>`;}).join('');
    $('runs').querySelectorAll('[data-run]').forEach(c=>c.addEventListener('change',()=>{const r=state.runs.find(r=>r.id===Number(c.dataset.run));if(c.checked&&visible().length>=4){c.checked=false;message('Compare até quatro simulações por vez. Desmarque uma para escolher outra.');return;}r.visible=c.checked;renderEnergy();}));
    $('runs').querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{stop();state.runs=state.runs.filter(r=>r.id!==Number(b.dataset.remove));state.viewRun=null;renderAll();}));
  }
  function updateSelect(id,runs){const selected=$(id).value;$(id).replaceChildren();runs.forEach(r=>{const opt=document.createElement('option');opt.value=r.id;opt.textContent=r.label;$(id).append(opt);});if(runs.some(r=>String(r.id)===selected))$(id).value=selected;}
  function renderAll(preferredTrajectory){
    const loaded=state.runs.length>0;$('workspace').hidden=!loaded;$('welcome-guide').hidden=loaded;document.body.classList.toggle('loaded',loaded);if(!loaded){stop();return;}
    renderRuns();updateSelect('trajectory-run',state.runs.filter(r=>r.xyz));updateSelect('distance-run',state.runs.filter(r=>r.xyz||r.colvars));if(preferredTrajectory){$('trajectory-run').value=preferredTrajectory;$('distance-run').value=preferredTrajectory;}renderDetails();changeTab(state.tab);
  }
  function changeTab(tab){stop();state.tab=tab;for(const name of ['energy','trajectory','distance']){$('panel-'+name).hidden=name!==tab;$('tab-'+name).setAttribute('aria-selected',name===tab);$('tab-'+name).tabIndex=name===tab?0:-1;}
    if(tab==='energy')renderEnergy();if(tab==='trajectory')renderTrajectory();if(tab==='distance')renderDistances(true);
  }
  function renderEnergy(){
    const runs=visible().filter(r=>energy(r)?.rows.length),has=runs.length>0;$('energy-empty').hidden=has;$('energy-content').hidden=!has;$('export-energy').disabled=!has;
    if(!has){$('energy-empty').innerHTML='<strong>Adicione uma série de dinâmica.</strong>Carregue o arquivo -md-ener.csv ou um .out com a tabela de MD. Uma otimização ou um XYZ isolado não contém todas as energias da dinâmica.';$('energy-guide').innerHTML='<h3>Qual pergunta o seu arquivo permite responder?</h3><p>Uma geometria pode ser explorada nas abas Trajetória e Distâncias. Para acompanhar energia e temperatura, precisamos da série ao longo do tempo.</p>';return;}
    const keys=[...document.querySelectorAll('[name="energy-series"]:checked')].map(x=>x.value),labels={total:'Total · E',potential:'Potencial · U',kinetic:'Cinética · K'},metricColors={total:'#006e66',potential:'#8e5ea2',kinetic:'#ac6300'},dashes={total:'',potential:'5 3',kinetic:'2 3'},delta=$('energy-mode').value==='delta',factor=energyFactor(),tf=timeFactor();
    const series=[];for(const [ri,r] of runs.entries())for(const [ki,key] of keys.entries()){const rows=energy(r).rows,first=rows.find(x=>x[key]!==null)?.[key];if(first===undefined)continue;series.push({name:runs.length===1?labels[key]:`${r.label} · ${labels[key]}`,color:runs.length===1?metricColors[key]:r.color,dash:runs.length===1?dashes[key]:patterns[ri*keys.length+ki],points:rows.map(x=>({x:x.time*tf,y:x[key]===null?null:(x[key]-(delta?first:0))*factor,segment:x.segment}))});}
    let xmin=Infinity,xmax=-Infinity;for(const r of runs)for(const row of energy(r).rows){xmin=Math.min(xmin,row.time*tf);xmax=Math.max(xmax,row.time*tf);}
    $('energy-title').textContent=delta?'Variação das energias':'Energias absolutas';$('delta-note').textContent=delta?'ΔX = X(t) − X(primeiro ponto), para cada curva.':'Os zeros de energia dependem do método e da composição.';
    new ScientificChart($('energy-chart'),{title:$('energy-title').textContent,series,yLabel:`${delta?'Δ energia':'Energia'} (${energyUnit()})`,xLabel:`Tempo (${$('time-unit').value})`,xUnit:$('time-unit').value,yUnit:energyUnit(),xDomain:[xmin,xmax]});
    const temperatures=runs.map((r,i)=>({name:r.label,color:r.color,dash:patterns[i],points:energy(r).rows.map(x=>({x:x.time*tf,y:x.temperature,segment:x.segment}))}));
    new ScientificChart($('temperature-chart'),{title:'Temperatura',series:temperatures,yLabel:'Temperatura (K)',xLabel:`Tempo (${$('time-unit').value})`,xUnit:$('time-unit').value,yUnit:'K',xDomain:[xmin,xmax]});
    $('time-summary').textContent=runs.map(r=>{const rows=energy(r).rows,start=rows[0].time,end=rows.at(-1).time;return `${r.label}: ${rows.length} pontos · ${num(start)}–${num(end)} fs · intervalo de ${num(end-start)} fs = ${num((end-start)/1000)} ps = ${num((end-start)*1e-15)} s`;}).join('  |  ');
    $('energy-stats').innerHTML=runs.map(r=>{const e=R.stats(energy(r).rows,'total'),t=R.stats(energy(r).rows,'temperature');const amplitude=e?($('energy-unit').value==='kj'?(e.span*factor>0&&e.span*factor<.01?num(e.span*factor,2):(e.span*factor).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})):num(e.span,3)):null;return `<div class="stat" style="--run-color:${r.color}"><span class="stat-name">${esc(r.label)}</span><strong>${e?'≈ '+amplitude+' '+energyUnit():'—'}</strong><p>Amplitude de E: máximo − mínimo</p><p>${t?'T média nos pontos exibidos: '+num(t.mean,4)+' K':'Temperatura indisponível'}</p></div>`;}).join('');
    const sets=new Set(runs.map(ensemble)),unknown=sets.has('unknown'),hasNVT=sets.has('NVT'),hasNVE=sets.has('NVE');
    let context=unknown?'O ensemble não foi identificado em todos os arquivos. Adicione o .out ou informe NVE/NVT em “Arquivos e condições”.':hasNVT&&hasNVE?'Compare a NVE com a dinâmica acoplada ao banho. A energia pode mudar em NVT pela troca com o termostato.':hasNVT?'Com termostato, o sistema troca energia com o banho. Uma variação de K + U não indica, sozinha, erro numérico.':'Em NVE, sem outras forças dependentes do tempo, observe se a energia total oscila em uma faixa pequena ou deriva.';
    if(runs.some(r=>metadata(r).wall))context+=' Há confinamento em pelo menos uma simulação; considere também as forças da parede.';
    const known=key=>runs.some(r=>r.reference&&r.key===key);
    const question=known('etanol_dt500')?'Por que esta dinâmica falhou?':known('zn_parede_longo')?'Qual água a parede mantém por perto?':known('etanol_dt200')?'Qual timestep conserva melhor a energia?':known('etanol_csvr')?'O que o termostato muda?':known('agua_cpcm')?'O solvente foi representado sem acrescentar átomos?':known('zn_parede')?'O que a parede muda nesta trajetória curta?':runs.length>1?'O que mudou entre as simulações?':'Para onde vai a energia?';
    const prompt=known('etanol_dt500')?'Com 5 fs, a energia e a temperatura explodem e o cálculo para após 15 fs registrados. Volte à estrutura inicial, reduza para 0,5 fs e use 1000 passos. Desmarque a falha para enxergar as oscilações pequenas da correção; não use um termostato para mascarar o erro.':known('zn_parede_longo')?'Abra Trajetória e Distâncias: acompanhe Zn 0 — O 25 até 2100 fs. Os dois casos partem do mesmo reinício. A parede retém a região de águas explícitas, mas introduz forças artificiais na borda.':known('etanol_dt200')?'Os três casos cobrem o mesmo tempo físico. Compare a amplitude de E e o custo de usar um passo menor. Terminar normalmente é suficiente para escolher um timestep?':known('etanol_csvr')?'Ambas começam com velocidades inicializadas a 300 K. Compare T e E: qual caso pode trocar energia com um banho? A trajetória já demonstra equilíbrio?':known('agua_cpcm')?'Abra as duas trajetórias e conte os átomos. Depois confira CPCM no método, em “Arquivos e condições”. Uma diferença visual pequena não significa que o modelo não foi ativado.':known('zn_parede')?'Compare também as distâncias e a animação. A energia sozinha mostra se uma água se afastou? A parede garante que nunca haverá escape?':'Localize uma região da curva. A energia cinética aumenta quando a potencial diminui? Como a temperatura acompanha essa troca?';
    $('energy-guide').innerHTML=`<h3>${question}</h3><p>${esc(context)}</p><p>${prompt}</p><details><summary>Como ler sem tirar conclusões além dos dados</summary><p>Amplitude e diferença entre início e fim são medidas diferentes. Uma oscilação limitada não é sinônimo de deriva. Médias de uma trajetória curta não comprovam equilíbrio; energia absoluta de métodos ou composições diferentes não fornece energia livre de reação.</p><p>Curvas não são suavizadas. Lacunas e reinícios permanecem separados. Quando exibida, a variação de cada curva usa seu próprio primeiro valor disponível.</p></details>`;
  }
  function renderDetails(){
    $('file-details-content').innerHTML=state.runs.map(r=>{const m=metadata(r),warnings=[...new Set([...(r.energy?.warnings||[]),...(r.out?.warnings||[]).filter(w=>!r.energy||!w.startsWith('O .out pode')),...(r.xyz?.warnings||[]),...(r.colvars?.warnings||[]),...(r.warnings||[])])];
      const values=[m.method?`Método/input: ${m.method}`:null,m.timestep!==null&&m.timestep!==undefined?`Timestep declarado: ${num(m.timestep)} fs`:null,m.targetTemperature?`Alvo do termostato: ${num(m.targetTemperature)} K (${m.thermostat})`:null,m.charge!==null&&m.charge!==undefined?`Carga ${m.charge}; multiplicidade ${m.multiplicity}`:null,r.out?`Saída: ${m.normal?'término normal':m.failed?'término com erro':'sem término normal identificado'}`:null,m.runtime!==null&&m.runtime!==undefined?`Tempo de execução: ${num(m.runtime)} s (não é o tempo físico da simulação)`:null,m.finalEnergy!==null&&m.finalEnergy!==undefined&&!energy(r)?.rows.length?`Última energia pontual: ${num(m.finalEnergy,12)} Eh`:null,r.energy?'Gráficos de energia: CSV (prioridade sobre o .out).':r.out?.rows.length?'Gráficos de energia: valores impressos no .out.':null].filter(Boolean);
      return `<div class="file-record"><h3>${esc(r.label)} · ${r.reference?'referência dos ministrantes':'arquivo carregado'}</h3><label>Condição da dinâmica <select data-ensemble="${r.id}" aria-label="Ensemble de ${esc(r.label)}"><option value="unknown" ${ensemble(r)==='unknown'?'selected':''}>Não informado</option><option value="NVE" ${ensemble(r)==='NVE'?'selected':''}>NVE</option><option value="NVT" ${ensemble(r)==='NVT'?'selected':''}>NVT / termostato</option></select></label><ul>${r.files.map(f=>`<li>${esc(f.name)}${r.reference&&f.path?` · <a href="../${esc(f.path)}" download>arquivo original</a>`:''}</li>`).join('')}${values.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>${warnings.length?`<p><strong>Observações de leitura</strong></p><ul>${warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>`:''}</div>`;
    }).join('');
    $('file-details-content').querySelectorAll('[data-ensemble]').forEach(el=>el.addEventListener('change',()=>{const run=state.runs.find(r=>r.id===Number(el.dataset.ensemble));run.ensembleOverride=el.value;renderEnergy();}));
  }
  function currentTrajectory(){return state.runs.find(r=>r.id===Number($('trajectory-run').value));}
  function currentDistance(){return state.runs.find(r=>r.id===Number($('distance-run').value));}
  function isWaterCage(xyz){return xyz.elements.length===63&&xyz.elements.filter(e=>e==='C').length===60&&xyz.elements.filter(e=>e==='O').length===1&&xyz.elements.filter(e=>e==='H').length===2;}
  function drawWall(run){
    state.viewer.removeAllShapes();const sphere=metadata(run).wallSphere;if(!sphere)return;
    for(let plane=0;plane<3;plane++){
      const points=[];for(let i=0;i<=72;i++){const t=2*Math.PI*i/72,p=[0,0,0];p[(plane+1)%3]=sphere.radius*Math.cos(t);p[(plane+2)%3]=sphere.radius*Math.sin(t);points.push({x:p[0]+sphere.center.x,y:p[1]+sphere.center.y,z:p[2]+sphere.center.z});}
      state.viewer.addCurve({points,radius:.018,color:'#3e9295',opacity:.65,smooth:0});
    }
  }
  function renderTrajectory(){
    const run=currentTrajectory(),has=!!run?.xyz;$('trajectory-empty').hidden=has;$('trajectory-content').hidden=!has;
    if(!has){$('trajectory-empty').innerHTML='<strong>O movimento está no arquivo XYZ.</strong>Carregue nome-traj.xyz. O .out e o CSV de energias não contêm necessariamente as coordenadas de todos os passos.';return;}
    if(!window.$3Dmol){$('trajectory-content').hidden=true;$('trajectory-empty').hidden=false;$('trajectory-empty').textContent='O visualizador molecular não foi carregado. Mantenha a pasta vendor junto ao aplicativo. As distâncias continuam disponíveis.';return;}
    try{if(!state.viewer){state.viewer=$3Dmol.createViewer($('molecule'),{backgroundColor:'white',orthographic:true,antialias:true});state.viewer.setProjection('orthographic');state.initialView=state.viewer.getView().slice();}
      const changedRun=state.viewRun!==run.id;
      if(changedRun){state.frame=0;state.selectedAtom=null;state.viewRun=run.id;state.timeFormat=timeFormat(run.xyz.frames);ensureTrajectoryReadouts();$('frame-slider').value='0';state.viewer.removeAllModels();state.viewer.removeAllLabels();state.model=state.viewer.addModel();}
      if(changedRun)drawWall(run);
      $('frame-slider').max=run.xyz.frames.length-1;$('frame-number').max=run.xyz.frames.length;$('play-button').disabled=run.xyz.frames.length<2;$('playback-speed').disabled=run.xyz.frames.length<2;
      ensureTrajectoryReadouts();$('molecule-legend').innerHTML=[...new Set(run.xyz.elements)].map(e=>`<span class="element-key"><i style="background:${elementColors[e]||'#8a8990'}"></i>${esc(e)}</span>`).join('');
      const sphere=metadata(run).wallSphere;
      if(sphere)$('molecule-legend').insertAdjacentHTML('beforeend',`<span class="wall-key">Parede suave · raio ${num(sphere.radius)} Å</span>`);
      if(isWaterCage(run.xyz))$('molecule-legend').insertAdjacentHTML('beforeend','<span class="wall-key">C₆₀ em armação · água no interior</span>');
      const note=document.querySelector('.playback-note');note.textContent=run.xyz.frames.length<2?'Estrutura estática: um único quadro.':`A 1×, um ciclo leva ${(playbackDuration(run.xyz.frames)/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})} s de reprodução. O tempo físico abaixo vem do XYZ. Use as setas para examinar cada quadro.`;
      if(run.xyz.previewStride)note.textContent+=` Prévia: 1 a cada ${run.xyz.previewStride} quadros originais, mais o último. Carregue o XYZ completo para ver todos.`;
      $('trajectory-status').hidden=!metadata(run).failed;$('trajectory-status').textContent=metadata(run).failed?'Cálculo interrompido com erro. Estes quadros são parciais: a distorção não é evidência confiável de reação.':'';
      state.viewer.resize();drawFrame(changedRun);
    }catch(error){$('trajectory-content').hidden=true;$('trajectory-empty').hidden=false;$('trajectory-empty').textContent='Este navegador não conseguiu abrir a visualização 3D. Use um navegador com WebGL; gráficos e distâncias continuam disponíveis.';}
  }
  function drawFrame(fit=false){
    const run=currentTrajectory();if(!run?.xyz||!state.viewer||!state.model)return;const xyz=run.xyz,frame=xyz.frames[state.frame];
    const atoms=frame.coords.map((c,i)=>({elem:xyz.elements[i],x:c[0],y:c[1],z:c[2],serial:i,index:i,bonds:[],bondOrder:[]}));
    // Display-only proximity graph, recomputed from this frame. No metal bonds,
    // bond orders, or connectivity claims are imported from the XYZ format.
    if($('proximity-lines').checked){const radii={H:.31,B:.84,C:.76,N:.71,O:.66,F:.57,P:1.07,S:1.05,Cl:1.02,Br:1.2,I:1.39};
      for(let a=0;a<atoms.length;a++)for(let b=a+1;b<atoms.length;b++){const ra=radii[atoms[a].elem],rb=radii[atoms[b].elem];if(!ra||!rb)continue;const d=Math.hypot(...frame.coords[a].map((x,j)=>x-frame.coords[b][j]));if(d>.35&&d<1.2*(ra+rb)){atoms[a].bonds.push(b);atoms[a].bondOrder.push(1);atoms[b].bonds.push(a);atoms[b].bondOrder.push(1);}}
    }
    state.model.removeAtoms(state.model.selectedAtoms({}));state.model.addAtoms(atoms);
    state.model.setStyle({},{sphere:{radius:.37}});
    for(const element of new Set(xyz.elements)){const color=elementColors[element]||'#8a8990',style={sphere:{radius:elementRadii[element]||.42,color}};if($('proximity-lines').checked)style.stick={radius:.075,color};state.model.setStyle({elem:element},style);}
    if(isWaterCage(xyz))state.model.setStyle({elem:'C'},$('proximity-lines').checked?{stick:{radius:.035,color:'#8c999e'},sphere:{radius:.075,color:'#8c999e'}}:{sphere:{radius:.075,color:'#8c999e'}});
    state.viewer.removeAllLabels();
    if($('atom-labels').checked)atoms.forEach((a,i)=>state.viewer.addLabel(`${a.elem} ${i}`,{position:a,fontColor:'#17313e',backgroundColor:'white',backgroundOpacity:.7,fontSize:11,borderThickness:0,inFront:true}));
    else if(run.reference&&run.key.includes('_longo')&&atoms[25]?.elem==='O')state.viewer.addLabel('O 25',{position:atoms[25],fontColor:'#9c382c',backgroundColor:'white',backgroundOpacity:.85,fontSize:12,borderThickness:0,inFront:true});
    state.viewer.setClickable({},true,atom=>{state.selectedAtom=atom.serial;renderAtomInfo();});renderAtomInfo();
    if(fit)resetView();else state.viewer.render();
    ensureTrajectoryReadouts();const timeline=physicalTimeValues(frame.time),frameLabel=$('frame-time').querySelector('.frame-index'),timeLabel=$('frame-time').querySelector('.frame-time-value');
    $('frame-slider').value=state.frame;$('frame-number').value=state.frame+1;$('previous-frame').disabled=state.frame===0;$('next-frame').disabled=state.frame===xyz.frames.length-1;frameLabel.textContent=`Quadro ${state.frame+1}/${xyz.frames.length}`;timeLabel.textContent=frame.time===null||frame.time===undefined?'tempo não informado':timeline.fs;
    const rows=energy(run)?.rows||[],row=frame.time===null?null:rows.find(r=>Math.abs(r.time-frame.time)<.051&&(frame.step===null||r.step===frame.step));
    $('frame-time-fs').textContent=timeline.fs;$('frame-time-ps').textContent=timeline.ps;$('frame-time-s').textContent=timeline.s;
    $('frame-temperature').textContent=row?.temperature!==null&&row?.temperature!==undefined?`${num(row.temperature)} K`:'Sem ponto correspondente';$('frame-potential').textContent=row?.potential!==null&&row?.potential!==undefined?`${num(row.potential,9)} Eh`:'Sem ponto correspondente';$('frame-atoms').textContent=xyz.elements.length;
  }
  function resetView(){
    if(!state.viewer||!state.model)return;const run=currentTrajectory();state.viewer.setView(state.initialView);state.viewer.rotate(60,'x');state.viewer.rotate(-20,'y');
    if(run?.xyz.elements.includes('Zn')){
      // Use one stable field of view for matching trajectories, including departing waters.
      const low=[Infinity,Infinity,Infinity],high=[-Infinity,-Infinity,-Infinity],signature=run.xyz.elements.join(',');
      for(const other of state.runs.filter(r=>r.xyz?.elements.join(',')===signature))for(const frame of other.xyz.frames)for(const c of frame.coords)for(let k=0;k<3;k++){low[k]=Math.min(low[k],c[k]);high[k]=Math.max(high[k],c[k]);}
      const proxy=state.viewer.addModel(),corners=[];for(let i=0;i<8;i++)corners.push({elem:'H',x:i&1?high[0]:low[0],y:i&2?high[1]:low[1],z:i&4?high[2]:low[2]});proxy.addAtoms(corners);state.viewer.zoomTo({model:proxy});state.viewer.removeModel(proxy);
    }else state.viewer.zoomTo();
    if(run?.xyz.elements.length<=3)state.viewer.zoom(2.2);state.viewer.render();
  }
  function renderAtomInfo(){const run=currentTrajectory(),index=state.selectedAtom,coords=run?.xyz?.frames[state.frame]?.coords[index];$('atom-info').textContent=index===null||!coords?'Selecione um átomo para ver seu índice e suas coordenadas.':`${run.xyz.elements[index]} · índice ${index}: x = ${num(coords[0],7)}, y = ${num(coords[1],7)}, z = ${num(coords[2],7)} Å.`;}
  function seekFrame(index){stop();const run=currentTrajectory();if(!run?.xyz)return;if(!Number.isFinite(index)){$('frame-number').value=state.frame+1;return;}state.frame=Math.max(0,Math.min(run.xyz.frames.length-1,Math.round(index)));drawFrame();}
  function play(){
    if(state.playing){stop();return;}
    const run=currentTrajectory(),frameCount=run?.xyz?.frames.length||0;if(!run?.xyz||frameCount<2)return;
    state.playing=true;state.playback={runId:run.id,startFrame:state.frame,baseDuration:playbackDuration(run.xyz.frames),phase:0,lastTimestamp:null};$('play-button').textContent='Ⅱ Pausar';
    const tick=timestamp=>{
      if(!state.playing||state.playback.runId!==run.id)return;
      if(state.playback.lastTimestamp===null){state.playback.lastTimestamp=timestamp;state.timer=requestAnimationFrame(tick);return;}
      const elapsed=Math.max(0,timestamp-state.playback.lastTimestamp);state.playback.lastTimestamp=timestamp;const speed=Math.max(.05,Number($('playback-speed').value)||1);
      state.playback.phase=(state.playback.phase+elapsed/state.playback.baseDuration*speed)%1;
      const next=(state.playback.startFrame+Math.floor(state.playback.phase*frameCount))%frameCount;
      if(next!==state.frame){state.frame=next;drawFrame();}
      state.timer=requestAnimationFrame(tick);
    };
    state.timer=requestAnimationFrame(tick);
  }
  function initialPairs(run){if(state.pairs[run.id])return;const els=run.xyz.elements,zn=els.indexOf('Zn'),ns=els.map((e,i)=>e==='N'?i:null).filter(x=>x!==null);state.pairs[run.id]=zn>=0&&ns.length?[...ns.slice(0,2).map(n=>[zn,n]),...(run.key?.includes('_longo')?[[zn,25]]:[])]:els.length>1?[[0,1]]:[];}
  function renderDistances(resetControls=false){
    const run=currentDistance(),has=!!run;$('distance-empty').hidden=has;$('distance-content').hidden=!has;$('export-distance').disabled=!has;
    if(!has){$('distance-empty').innerHTML='<strong>Escolha dois átomos e acompanhe a distância.</strong>Carregue uma trajetória XYZ, ou o CSV de Colvars do ORCA. O aplicativo usa as coordenadas; você não precisa adicionar medidas ao input.';return;}
    const source=$('distance-source');source.options[0].disabled=!run.xyz;source.options[1].disabled=!run.colvars;
    if(!run.xyz)source.value='colvars';else if(!run.colvars)source.value='xyz';
    const fromXYZ=source.value==='xyz';$('atom-pair-controls').hidden=!fromXYZ;$('colvar-controls').hidden=fromXYZ;$('distance-chips').hidden=!fromXYZ;
    let series=[],timed=true;
    if(fromXYZ){
      initialPairs(run);const xyz=run.xyz;timed=xyz.frames.every(f=>f.time!==null);
      if(resetControls||$('atom-a').options.length!==xyz.elements.length){for(const id of ['atom-a','atom-b']){$(id).replaceChildren();xyz.elements.forEach((e,i)=>{const opt=document.createElement('option');opt.value=i;opt.textContent=`${e} · ${i}`;$(id).append(opt);});}const pair=state.pairs[run.id][0]||[0,Math.min(1,xyz.elements.length-1)];$('atom-a').value=pair[0];$('atom-b').value=pair[1];}
      $('distance-chips').innerHTML=state.pairs[run.id].map(([a,b],i)=>`<span class="distance-chip" style="--run-color:${colors[i%colors.length]}">${esc(xyz.elements[a])} ${a} — ${esc(xyz.elements[b])} ${b}<button type="button" data-pair="${i}" aria-label="Remover distância ${a}–${b}">×</button></span>`).join('');
      $('distance-chips').querySelectorAll('[data-pair]').forEach(b=>b.addEventListener('click',()=>{state.pairs[run.id].splice(Number(b.dataset.pair),1);renderDistances();}));
      series=state.pairs[run.id].map(([a,b],i)=>({name:`${xyz.elements[a]} ${a} — ${xyz.elements[b]} ${b}`,color:colors[i%colors.length],dash:i%2?'5 3':'',points:R.distanceSeries(xyz,a,b).map(p=>({x:p.time,y:p.value,segment:p.segment}))}));
    }else{
      const cv=run.colvars;if(!state.colvars[run.id])state.colvars[run.id]=cv.columns.slice(0,2).map(c=>c.id);
      const name=id=>{const def=metadata(run).colvars?.find(c=>c.id===id);if(def&&run.xyz){const e=run.xyz.elements;return `${e[def.a]||'Átomo'} ${def.a} — ${e[def.b]||'átomo'} ${def.b}`;}return `Colvar ${id}`;};
      $('colvar-controls').innerHTML=cv.columns.map(c=>`<label><input type="checkbox" data-colvar="${c.id}" ${state.colvars[run.id].includes(c.id)?'checked':''}>${esc(name(c.id))}</label>`).join('');
      $('colvar-controls').querySelectorAll('[data-colvar]').forEach(c=>c.addEventListener('change',()=>{state.colvars[run.id]=[...$('colvar-controls').querySelectorAll('input:checked')].map(x=>Number(x.dataset.colvar));renderDistances();}));
      series=cv.columns.filter(c=>state.colvars[run.id].includes(c.id)).map((c,i)=>({name:name(c.id),color:colors[i%colors.length],dash:patterns[i%patterns.length],points:cv.rows.map(r=>({x:r.time,y:r.values[c.id],segment:r.segment}))}));
    }
    state.distanceSeries=series;new ScientificChart($('distance-chart'),{title:'Distâncias entre átomos',series,yLabel:'Distância (Å)',yUnit:'Å',xLabel:timed?'Tempo (fs)':'Quadro (sem tempo físico)',xUnit:timed?'fs':'quadro'});
    $('distance-stats').innerHTML=series.map(s=>{const stat=R.stats(s.points.map(p=>({value:p.y})),'value');return stat?`<div class="stat" style="--run-color:${s.color}"><span class="stat-name">${esc(s.name)}</span><strong>${num(stat.min,4)}–${num(stat.max,4)} Å</strong><p>Faixa observada nesta trajetória</p></div>`:'';}).join('');
  }
  function download(name,content){const blob=new Blob(['\uFEFF'+content],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  const csvText=rows=>rows.map(row=>row.map(v=>typeof v==='string'?`"${(/^[=+@-]/.test(v)?"'"+v:v).replace(/"/g,'""')}"`:v??'').join(';')).join('\r\n');
  function exportEnergy(){const rows=[['simulacao','origem','passo','tempo_fs','trecho','K_Eh','U_Eh','E_Eh','T_K','quantidade_conservada_Eh']];for(const r of visible())for(const p of energy(r)?.rows||[])rows.push([r.label,r.reference?'referencia':'upload',p.step,p.time,p.segment,p.kinetic,p.potential,p.total,p.temperature,p.conserved]);download('energias-dados-originais.csv',csvText(rows));message('CSV exportado com valores originais em Hartree, tempo em fs e temperatura em K. As transformações visuais não alteram os dados.',true);}
  function exportDistance(){const run=currentDistance(),timed=$('distance-source').value==='colvars'||run.xyz.frames.every(f=>f.time!==null),rows=[['simulacao','distancia',timed?'tempo_fs':'quadro','trecho','distancia_A']];for(const s of state.distanceSeries)for(const p of s.points)rows.push([run.label,s.name,p.x,p.segment,p.y]);download('distancias.csv',csvText(rows));}

  $('upload-button').addEventListener('click',()=>$('file-input').click());$('file-input').addEventListener('change',e=>importFiles([...e.target.files]));
  for(const event of ['dragenter','dragover'])$('drop-zone').addEventListener(event,e=>{e.preventDefault();$('drop-zone').classList.add('drag');});
  for(const event of ['dragleave','drop'])$('drop-zone').addEventListener(event,e=>{e.preventDefault();$('drop-zone').classList.remove('drag');});
  $('drop-zone').addEventListener('drop',e=>importFiles([...e.dataTransfer.files]));
  $('example-button').addEventListener('click',()=>loadExample($('example-select').value));
  $('example-trajectory-button').addEventListener('click',()=>loadExample($('example-select').value,'trajectory'));
  $('clear-button').addEventListener('click',()=>{stop();state.runs=[];state.viewRun=null;state.pairs={};state.colvars={};renderAll();message('Sessão limpa. Seus arquivos originais continuam intactos.',true);});
  document.querySelectorAll('[data-tab]').forEach(b=>{b.addEventListener('click',()=>changeTab(b.dataset.tab));b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const names=['energy','trajectory','distance'],i=names.indexOf(state.tab),next=names[(i+(e.key==='ArrowRight'?1:2))%3];changeTab(next);$('tab-'+next).focus();});});
  for(const id of ['energy-mode','energy-unit','time-unit'])$(id).addEventListener('change',renderEnergy);
  document.querySelectorAll('[name="energy-series"]').forEach(c=>c.addEventListener('change',renderEnergy));
  $('trajectory-run').addEventListener('change',()=>{stop();renderTrajectory();});$('reset-view').addEventListener('click',resetView);for(const id of ['atom-labels','proximity-lines'])$(id).addEventListener('change',()=>drawFrame());
  $('frame-slider').addEventListener('input',()=>seekFrame(Number($('frame-slider').value)));$('play-button').addEventListener('click',play);
  $('previous-frame').addEventListener('click',()=>seekFrame(state.frame-1));$('next-frame').addEventListener('click',()=>seekFrame(state.frame+1));
  $('frame-number').addEventListener('change',()=>seekFrame($('frame-number').valueAsNumber-1));$('frame-number').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();seekFrame($('frame-number').valueAsNumber-1);}});
  $('goto-distances').addEventListener('click',()=>{const run=currentTrajectory();if(run)$('distance-run').value=run.id;changeTab('distance');});
  $('distance-run').addEventListener('change',()=>renderDistances(true));$('distance-source').addEventListener('change',()=>renderDistances(true));
  $('add-distance').addEventListener('click',()=>{const run=currentDistance(),a=Number($('atom-a').value),b=Number($('atom-b').value);if(a===b){message('Escolha dois átomos diferentes.');return;}if(state.pairs[run.id].some(p=>p.includes(a)&&p.includes(b))){message('Essa distância já está no gráfico.');return;}if(state.pairs[run.id].length>=6){message('Mostre até seis distâncias por vez para manter o gráfico legível.');return;}state.pairs[run.id].push([a,b]);renderDistances();message('Distância calculada a partir dos quadros XYZ.',true);});
  $('export-energy').addEventListener('click',exportEnergy);$('export-distance').addEventListener('click',exportDistance);
  $('help-button').addEventListener('click',()=>$('help-dialog').showModal());for(const id of ['close-help','help-done'])$(id).addEventListener('click',()=>$('help-dialog').close());
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(state.tab==='energy'&&state.runs.length)renderEnergy();else if(state.tab==='distance'&&state.runs.length)renderDistances();state.viewer?.resize();},150);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  const query=new URLSearchParams(location.search),requested=query.get('exemplo'),requestedTab=new Map([['energias','energy'],['trajetoria','trajectory'],['distancias','distance']]).get(query.get('aba'));if(requestedTab)state.tab=requestedTab;if(requested&&window.AIMD_EXAMPLES?.presets[requested]){$('example-select').value=requested;loadExample(requested,requestedTab);}
})();
