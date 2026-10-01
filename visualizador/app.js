(function(){
  'use strict';
  const R=OrcaReader,G=Geometry,H=HighlightSelection,$=id=>document.getElementById(id),num=(n,p=5)=>chartNumber(n,p);
  const colors=['#006e66','#a35b00','#6853a6','#176ba0','#a54664','#55612b'];
  const referenceColors={etanol_dt500:colors[4],etanol_instavel:colors[4],etanol_corrigido:colors[0],etanol_etapas:colors[0],thermostat_compare:colors[1],dimero_b97:colors[0],dimero_b97_cpcm:colors[1],dimero_dft:colors[0],dimero_cpcm:colors[1],agua_isolada:colors[0],water_single:colors[0],solvent_single:colors[1],zn_parede_longo:colors[0],zn_sem_parede_longo:colors[1],agua_c60:colors[0],agua_dft:colors[0],agua_cpcm:colors[1],etanol_dt025:colors[0],etanol_nve:colors[1],etanol_dt200:colors[2],etanol_csvr:colors[0],zn_parede:colors[0],zn_sem_parede:colors[1],zn_solvator:colors[0],preparar_complexo:colors[1]};
  const patterns=['','7 3','2 3','9 3 2 3','12 3','4 2 1 2','1 4','10 2 3 2','5 5','12 3 2 3 2 3','3 2','8 5'];
  const elementColors={H:'#d9e0e3',C:'#465563',N:'#386ea8',O:'#c45448',Zn:'#8b71a8',S:'#b99425',P:'#bc7538',Cl:'#5f9548',F:'#75a56f',Na:'#8675b8',Mg:'#7caa61',Fe:'#b57545',Cu:'#a66e4e'};
  const elementRadii={H:.23,C:.37,N:.35,O:.34,Zn:.53,S:.44,P:.44};
  const state={runs:[],nextId:1,tab:'trajectory',viewer:null,initialView:null,model:null,viewRun:null,frame:0,selectedAtom:null,playing:false,timer:null,playback:{runId:null,startFrame:0,baseDuration:0,phase:0,lastTimestamp:null},timeFormat:null,pairs:{},geometryMeasures:{},colvars:{},distanceSeries:[],geometrySeries:[],contactShapes:[],busy:false,exampleRequest:0,exampleLoading:false,exampleRetry:null};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const energy=run=>run.energy||run.out;
  const metadata=run=>run.metadata||run.out?.metadata||{};
  const ensemble=run=>run.ensembleOverride||metadata(run).ensemble||'unknown';
  const visible=()=>state.runs.filter(r=>r.visible);
  const timeFactor=()=>({fs:1,ps:1e-3,s:1e-15}[$('time-unit').value]);
  const energyFactor=()=>$('energy-unit').value==='eh'?1:R.HARTREE_TO_KJMOL;
  const energyUnit=()=>$('energy-unit').value==='eh'?'Eh':'kJ/mol';
  Object.assign(state,{trajectoryChart:null,trajectoryTemperatureChart:null,energyIndex:null,temperatureIndex:null,frameIndex:null,interaction:'rotate',panGesture:null,expandedReturnFocus:null,expandedBackground:[]});
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
  function playbackDuration(){
    const seconds=Number($('playback-duration').value);
    return ([8,15,30,60,120].includes(seconds)?seconds:60)*1000;
  }
  function playbackSpeed(){return Math.max(.05,Number($('playback-speed').value)||1);}
  function renderPlaybackControls(run=currentTrajectory()){
    const frames=run?.xyz?.frames||[],staticOnly=frames.length<2,note=document.querySelector('.playback-note');
    for(const id of ['play-button','playback-duration','playback-speed'])$(id).disabled=staticOnly;
    note.textContent=staticOnly?(frames.length?'Estrutura estática: um único quadro.':'Carregue uma trajetória para reproduzir o movimento.'):`Um ciclo completo leva ${(playbackDuration()/1000/playbackSpeed()).toLocaleString('pt-BR',{maximumFractionDigits:1})} s de reprodução. O tempo físico abaixo vem do XYZ. Use as setas para examinar cada quadro.`;
    if(run?.xyz?.previewStride)note.textContent+=` Prévia: 1 a cada ${run.xyz.previewStride} quadros originais, mais o último. Carregue o XYZ completo para ver todos.`;
  }
  function updatePlaybackSettings(){
    // Keep the current phase and frame: only the rate of subsequent ticks changes.
    state.playback.baseDuration=playbackDuration();renderPlaybackControls();
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
    const fields=[['time','Tempo físico'],['temperature','Temperatura'],['kinetic','Energia cinética'],['potential','Energia potencial'],['total','Energia total'],['atoms','Átomos']];
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
  function exampleLoading(active){state.exampleLoading=active;document.querySelector('.example-card').setAttribute('aria-busy',String(active));$('example-load-status').hidden=!active;$('example-load-status').textContent=active?'Carregando os arquivos deste exemplo…':'';}
  function cancelExampleLoad(){state.exampleRequest++;exampleLoading(false);state.exampleRetry=null;$('example-retry').hidden=true;}
  function stop(){state.playing=false;if(state.timer!==null){cancelAnimationFrame(state.timer);state.timer=null;}state.playback.lastTimestamp=null;$('play-button').textContent='▶ Reproduzir';}
  function makeRun(key,label,reference=false){const id=state.nextId++;return {id,key,label:label||key,reference,visible:true,color:colors[(id-1)%colors.length],files:[],warnings:[]};}
  function addParsed(run,parsed){
    const slot=parsed.kind==='xyz'?'xyz':parsed.kind==='colvars'?'colvars':parsed.kind==='out'?'out':'energy';
    const issue=R.validateEnergySources(slot==='energy'?parsed:run.energy,slot==='out'?parsed:run.out);
    if(issue)throw new Error(issue);
    run[slot]=parsed;run.files.push({name:parsed.name,kind:parsed.kind});
  }
  async function importFiles(files){
    if(state.busy)return;cancelExampleLoad();state.busy=true;document.body.classList.add('busy');stop();message('Lendo os arquivos…',true);
    const warnings=[],groups=new Map();let accepted=0,trajectoryRun=null;
    for(const file of files){
      if(file.size>80*1024*1024){warnings.push(`${file.name}: limite de 80 MB por arquivo.`);continue;}
      try{const parsed=R.parseFile(await file.text(),file.name);warnings.push(...parsed.warnings.filter(w=>!w.startsWith('O .out pode')&&!w.startsWith('XYZ convencional')).map(w=>`${file.name}: ${w}`));if(!groups.has(parsed.key))groups.set(parsed.key,[]);groups.get(parsed.key).push(parsed);}
      catch(error){warnings.push(`${file.name}: ${error.message}`);}
    }
    for(const [key,parts] of groups){
      let run=state.runs.find(r=>!r.reference&&r.key===key&&!parts.some(p=>r[p.kind==='xyz'?'xyz':p.kind==='colvars'?'colvars':p.kind==='out'?'out':'energy']));
      if(!run){run=makeRun(key);const n=state.runs.filter(r=>r.key===key).length;if(n)run.label=`${key} (${n+1})`;state.runs.push(run);}
      for(const part of parts){try{addParsed(run,part);accepted++;if(run.xyz&&!trajectoryRun)trajectoryRun=run;}catch(error){const separate=makeRun(key,`${key} · ${part.kind==='out'?'.out':'CSV'} separado`);addParsed(separate,part);state.runs.push(separate);warnings.push(error.message);accepted++;if(part.kind==='xyz'&&!trajectoryRun)trajectoryRun=separate;}}
    }
    if(trajectoryRun)trajectoryRun.visible=true;
    const selected=trajectoryRun?[trajectoryRun,...visible().filter(r=>r!==trajectoryRun)]:visible();if(selected.length>4){selected.slice(4).forEach(r=>r.visible=false);warnings.push('Quatro simulações selecionadas para comparação. Use as caixas para escolher outras.');}
    state.busy=false;document.body.classList.remove('busy');$('file-input').value='';
    if(trajectoryRun)state.tab='trajectory';else if(accepted)state.tab='energy';
    renderAll(trajectoryRun?.id);message([accepted?`${accepted} arquivo(s) carregado(s).`:'Nenhum arquivo foi carregado.',accepted&&!state.runs.some(r=>r.xyz)?'Para ver o movimento em 3D, carregue também o arquivo -traj.xyz.':'',...warnings].filter(Boolean).join('\n'),warnings.length===0);
    if(accepted)$(trajectoryRun?'tab-trajectory':'workspace').scrollIntoView({block:'start',behavior:'smooth'});
  }
  async function loadExample(key,preferredTab){
    if(state.busy){message('Aguarde a leitura dos seus arquivos antes de abrir um exemplo.',true);return;}
    const request=++state.exampleRequest;stop();exampleLoading(true);state.exampleRetry=null;$('example-retry').hidden=true;message('Carregando o exemplo selecionado…',true);
    try{
      if(!window.AIMDExampleLoader)throw new Error('O carregador de exemplos não foi encontrado. Recarregue a página ou mantenha todos os arquivos do visualizador na cópia local.');
      const {config,runs}=await window.AIMDExampleLoader.loadPreset(key);
      if(request!==state.exampleRequest)return;
      // Keep uploaded files and the current display until every requested run exists.
      // Parsed reference data are read-only; only the session wrapper is modified.
      const references=runs.map(src=>{const run=Object.assign(makeRun(src.key,src.label,true),src,{exampleKey:src.key,visible:true});run.color=referenceColors[src.key]||run.color;return run;});
      stop();clearContactShapes();state.runs=state.runs.filter(r=>!r.reference);state.runs.forEach(r=>r.visible=false);state.runs.push(...references);state.viewRun=null;
      document.querySelectorAll('[name="energy-series"]').forEach(c=>c.checked=config.runs.length>1?c.value==='total':true);
      $('energy-mode').value='delta';$('time-unit').value='fs';$('energy-window-from').value='';$('energy-window-to').value='';state.tab=preferredTab||(references.some(run=>run.xyz)?'trajectory':'energy');renderAll(references[0].id);
      const staticOnly=references.every(run=>run.xyz?.frames.length===1&&!energy(run)?.rows.length);
      message(staticOnly?'Estruturas de referência carregadas. SOLVATOR mostra geometrias antes e depois da solvatação; este exemplo não contém uma dinâmica, energias ao longo do tempo ou animação. Escolha a estrutura no campo Simulação.':'Exemplo de referência carregado. São dados reais calculados pelos ministrantes; não são uma execução feita por você.',true);
      $(state.tab==='trajectory'?'tab-trajectory':'workspace').scrollIntoView({block:'start',behavior:'smooth'});
    }catch(error){
      if(request!==state.exampleRequest)return;
      state.exampleRetry={key,preferredTab};$('example-retry').hidden=false;
      message(`${error.message} Use “Tentar novamente”. Os dados que já estavam abertos foram mantidos.`);
    }finally{if(request===state.exampleRequest)exampleLoading(false);}
  }
  function renderRuns(){
    $('runs').innerHTML=state.runs.map(r=>{const n=energy(r)?.rows.length||0;return `<div class="run-card" style="--run-color:${r.color}"><label><input type="checkbox" data-run="${r.id}" ${r.visible?'checked':''}><span><strong>${esc(r.label)}</strong><small>${r.reference?'Referência da aula':'Seu arquivo'} · ${n?n+' pontos':r.xyz?r.xyz.elements.length+' átomos':'sem série MD'}</small></span></label><button type="button" class="remove-run" data-remove="${r.id}" aria-label="Remover ${esc(r.label)}">×</button></div>`;}).join('');
    $('runs').querySelectorAll('[data-run]').forEach(c=>c.addEventListener('change',()=>{const r=state.runs.find(r=>r.id===Number(c.dataset.run));if(c.checked&&visible().length>=4){c.checked=false;message('Compare até quatro simulações por vez. Desmarque uma para escolher outra.');return;}stop();r.visible=c.checked;updateRunSelectors();changeTab(state.tab);}));
    $('runs').querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{stop();state.runs=state.runs.filter(r=>r.id!==Number(b.dataset.remove));renderAll();}));
  }
  function updateSelect(id,runs){const selected=$(id).value;$(id).replaceChildren();runs.forEach(r=>{const opt=document.createElement('option');opt.value=r.id;opt.textContent=r.label;$(id).append(opt);});if(runs.some(r=>String(r.id)===selected))$(id).value=selected;}
  function updateRunSelectors(preferredTrajectory){
    for(const [id,compatible] of [['trajectory-run',r=>r.xyz],['distance-run',r=>r.xyz||r.colvars]]){
      const runs=visible().filter(compatible);updateSelect(id,runs);$(id).disabled=!runs.length;
      if(runs.some(r=>r.id===preferredTrajectory))$(id).value=preferredTrajectory;
    }
  }
  function renderAll(preferredTrajectory){
    const loaded=state.runs.length>0;$('workspace').hidden=!loaded;$('welcome-guide').hidden=loaded;document.body.classList.toggle('loaded',loaded);if(!loaded){stop();const expanded=$('expand-trajectory').getAttribute('aria-expanded')==='true';expandTrajectory(false,false);if(expanded)$('upload-button').focus();return;}
    renderRuns();updateRunSelectors(preferredTrajectory);renderDetails();changeTab(state.tab);
  }
  function changeTab(tab){stop();state.tab=tab;const expanded=$('expand-trajectory').getAttribute('aria-expanded')==='true';if(tab!=='trajectory')expandTrajectory(false,false);for(const name of ['energy','trajectory','distance']){$('panel-'+name).hidden=name!==tab;$('tab-'+name).setAttribute('aria-selected',name===tab);$('tab-'+name).tabIndex=name===tab?0:-1;}if(expanded&&tab!=='trajectory')$('tab-'+tab).focus();
    if(tab==='energy')renderEnergy();if(tab==='trajectory')renderTrajectory();if(tab==='distance')renderDistances(true);
  }
  function energyWindow(){const read=id=>{const raw=$(id)?.value?.trim()||'';return raw===''?null:Number(raw);};const from=read('energy-window-from'),to=read('energy-window-to');return {from:Number.isFinite(from)?from:-Infinity,to:Number.isFinite(to)?to:Infinity,active:Number.isFinite(from)||Number.isFinite(to)};}
  function energyRowsInWindow(run){const window=energyWindow();return energy(run).rows.filter(row=>row.time>=window.from&&row.time<=window.to);}
  function renderEnergy(){
    const runs=visible().filter(r=>energy(r)?.rows.length),has=runs.length>0;$('energy-empty').hidden=has;$('energy-content').hidden=!has;$('export-energy').disabled=!has;
    renderStageSummary(runs,'energy-stage-summary');$('energy-first-window').hidden=!runs.some(r=>r.key==='etanol_instavel');
    if(!has){for(const id of ['energy-chart','temperature-chart','energy-stats','time-summary'])$(id).replaceChildren();$('energy-empty').innerHTML=!visible().length?'<strong>Marque uma simulação acima.</strong>As caixas selecionam os cálculos disponíveis nas três abas.':'<strong>Adicione uma série de dinâmica.</strong>Carregue o arquivo -md-ener.csv ou um .out com a tabela de MD. Uma otimização ou um XYZ isolado não contém todas as energias da dinâmica.';$('energy-guide').innerHTML='<h3>Qual pergunta o seu arquivo permite responder?</h3><p>Uma geometria pode ser explorada nas abas Trajetória e Geometria. Para acompanhar energia e temperatura, precisamos da série ao longo do tempo.</p>';return;}
    const keys=[...document.querySelectorAll('[name="energy-series"]:checked')].map(x=>x.value),labels={total:'Total · E',potential:'Potencial · U',kinetic:'Cinética · K'},metricColors={total:'#006e66',potential:'#8e5ea2',kinetic:'#ac6300'},dashes={total:'',potential:'5 3',kinetic:'2 3'},delta=$('energy-mode').value==='delta',factor=energyFactor(),tf=timeFactor();
    const series=[];for(const [ri,r] of runs.entries()){const rows=energy(r).rows,viewRows=energyRowsInWindow(r);for(const [ki,key] of keys.entries()){const first=rows.find(x=>x[key]!==null)?.[key];if(first===undefined)continue;series.push({name:runs.length===1?labels[key]:`${r.label} · ${labels[key]}`,color:runs.length===1?metricColors[key]:r.color,dash:runs.length===1?dashes[key]:patterns[ri*keys.length+ki],points:viewRows.map(x=>({x:x.time*tf,y:x[key]===null?null:(x[key]-(delta?first:0))*factor,segment:x.segment}))});}}
    let xmin=Infinity,xmax=-Infinity;for(const r of runs)for(const row of energyRowsInWindow(r)){xmin=Math.min(xmin,row.time*tf);xmax=Math.max(xmax,row.time*tf);}if(!Number.isFinite(xmin)){xmin=0;xmax=1;}
    $('energy-title').textContent=delta?'Variação das energias':'Energias absolutas';$('delta-note').textContent=delta?'ΔX = X(t) − X(primeiro ponto), para cada curva.':'Os zeros de energia dependem do método e da composição.';
    new ScientificChart($('energy-chart'),{title:$('energy-title').textContent,series,yLabel:`${delta?'Δ energia':'Energia'} (${energyUnit()})`,xLabel:`Tempo (${$('time-unit').value})`,xUnit:$('time-unit').value,yUnit:energyUnit(),xDomain:[xmin,xmax]});
    const temperatures=runs.map((r,i)=>({name:r.label,color:r.color,dash:patterns[i],points:energyRowsInWindow(r).map(x=>({x:x.time*tf,y:x.temperature,segment:x.segment}))}));
    new ScientificChart($('temperature-chart'),{title:'Temperatura',series:temperatures,yLabel:'Temperatura (K)',xLabel:`Tempo (${$('time-unit').value})`,xUnit:$('time-unit').value,yUnit:'K',xDomain:[xmin,xmax]});
    $('time-summary').textContent=runs.map(r=>{const rows=energy(r).rows,start=rows[0].time,end=rows.at(-1).time;return `${r.label}: ${rows.length} pontos · ${num(start)}–${num(end)} fs · intervalo de ${num(end-start)} fs = ${num((end-start)/1000)} ps = ${num((end-start)*1e-15)} s`;}).join('  |  ');
    $('energy-stats').innerHTML=runs.map(r=>{const viewRows=energyRowsInWindow(r),e=R.stats(viewRows,'total'),t=R.stats(viewRows,'temperature');const amplitude=e?($('energy-unit').value==='kj'?(e.span*factor>0&&e.span*factor<.01?num(e.span*factor,2):(e.span*factor).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})):num(e.span,3)):null;return `<div class="stat" style="--run-color:${r.color}"><span class="stat-name">${esc(r.label)}</span><strong>${e?'≈ '+amplitude+' '+energyUnit():'—'}</strong><p>Amplitude de E na janela selecionada</p><p>${t?'T média nos pontos exibidos: '+num(t.mean,4)+' K':'Temperatura indisponível'}</p></div>`;}).join('');
    const sets=new Set(runs.map(ensemble)),unknown=sets.has('unknown'),hasNVT=sets.has('NVT'),hasNVE=sets.has('NVE'),changing=runs.some(r=>metadata(r).changingConditions===true);
    let context=changing?'O input muda as condições ao longo da trajetória. Leia as etapas; durante as rampas não há um único estado NVT estacionário.':unknown?'O ensemble não foi identificado em todos os arquivos. Adicione o .out ou informe NVE/NVT em “Arquivos e condições”.':hasNVT&&hasNVE?'Compare a NVE com a dinâmica acoplada ao banho. A energia pode mudar em NVT pela troca com o termostato.':hasNVT?'Com termostato, o sistema troca energia com o banho. Uma variação de K + U não indica, sozinha, erro numérico.':'Em NVE, sem outras forças dependentes do tempo, observe se a energia total oscila em uma faixa pequena ou deriva.';
    if(runs.some(r=>metadata(r).wall))context+=' Há confinamento em pelo menos uma simulação; considere também as forças da parede.';
    const known=key=>runs.some(r=>r.reference&&r.key===key),unstable=known('etanol_instavel'),legacyUnstable=known('etanol_dt500');
    const question=unstable||legacyUnstable?'Por que esta dinâmica falhou?':known('etanol_etapas')?'O etanol muda de conformação ao longo das etapas?':known('dimero_b97_cpcm')?'Como o ambiente implícito altera o movimento do dímero?':known('dimero_b97')?'A ligação de hidrogênio mantém a mesma geometria?':known('zn_parede_longo')?'Qual água a parede mantém por perto?':known('etanol_dt200')?'Qual timestep conserva melhor a energia?':known('etanol_csvr')?'O que o termostato muda?':known('etanol_nve')?'Oscilar é o mesmo que mudar de conformação?':known('agua_cpcm')?'O solvente foi representado sem acrescentar átomos?':known('zn_parede')?'O que a parede muda nesta trajetória curta?':runs.length>1?'O que mudou entre as simulações?':'Para onde vai a energia?';
    const prompt=known('controle_dt025_31A')?'No primeiro quadro, todas as águas estão a 3,1 Å do Zn. Compare Zn 0–O 10 e Zn 0–O 1: quais águas entram na primeira camada? A en começa distante; estes 250 fs mostram hidratação, não quelação.':known('hidratacao_associacao_31A')?'As águas se coordenam no início. Em 5 ps a en se aproxima, mas nenhum N entra no corte de 2,6 Å. Compare Zn 0–N 31, Zn 0–N 34 e Zn 0–O 10; aproximação à camada de águas não é formação do quelato.':unstable?'Com 2,5 fs, acompanhe a janela dos primeiros 75 fs antes de examinar a trajetória completa. A energia já se afasta enquanto a temperatura ainda está na faixa inicial; o término posterior é uma falha parcial, não uma prova de equilíbrio.':legacyUnstable?'Com 5 fs, a energia e a temperatura explodem e o cálculo para cedo. Volte à estrutura inicial, reduza o timestep e compare a janela inicial com a trajetória completa; não use um termostato para mascarar o erro.':known('etanol_etapas')?'Abra Geometria e escolha Etanol C–C–O–H. Relacione o diedro às cinco etapas de 300 → 600 → 300 K. O H gira com a hidroxila: isso não é transferência de próton. Aquecimento e maior duração mudam juntos; esta trajetória não fornece populações de equilíbrio nem constantes de velocidade.':known('dimero_b97_cpcm')?'Em Geometria, compare O 0 — O 3 e o ângulo O 0 — H 1 — O 3. O CPCM modifica o ambiente eletrostático sem adicionar moléculas de solvente. Os 60 fs mostram respostas locais; não fornecem uma média de solução ou uma energia livre de associação.':known('dimero_b97')?'Ative Ligações H e acompanhe O 0 — H 1 ··· O 3. Meça O 0 — O 3 e o ângulo 0–1–3: a ligação H pode perder alinhamento enquanto a distância O···O muda pouco. O tracejado usa um critério geométrico; desaparecer não prova dissociação química.':known('zn_parede_longo')?'Abra Trajetória e Geometria: acompanhe Zn 0 — O 25 até 2100 fs. Os dois casos partem do mesmo reinício. A parede retém a região de águas explícitas, mas introduz forças artificiais na borda. O 25 começa a cerca de 4 Å do Zn; não é um ligante diretamente coordenado.':known('etanol_dt200')?'Os três casos cobrem o mesmo tempo físico. Compare a amplitude de E e o custo de usar um passo menor. Terminar normalmente é suficiente para escolher um timestep?':known('etanol_csvr')?'Ambas começam com velocidades inicializadas a 300 K. Compare T e E: qual caso pode trocar energia com um banho? A trajetória já demonstra equilíbrio?':known('etanol_nve')?'Em Geometria, selecione Etanol C–C–O–H. Nesta referência curta o diedro oscila aproximadamente entre −74° e −34°, sem trocar de conformação. Compare com o bloco 03, mais longo e com aquecimento, para observar a rotação da hidroxila.':known('agua_cpcm')?'Abra as duas trajetórias e conte os átomos. Depois confira CPCM no método, em “Arquivos e condições”. Uma diferença visual pequena não significa que o modelo não foi ativado.':known('zn_parede')?'Compare também as distâncias e a animação. A energia sozinha mostra se uma água se afastou? A parede garante que nunca haverá escape?':'Localize uma região da curva. A energia cinética aumenta quando a potencial diminui? Como a temperatura acompanha essa troca?';
    $('energy-guide').innerHTML=`<h3>${question}</h3><p>${esc(context)}</p><p>${prompt}</p><details><summary>Como ler sem tirar conclusões além dos dados</summary><p>Amplitude e diferença entre início e fim são medidas diferentes. Uma oscilação limitada não é sinônimo de deriva. Médias de uma trajetória curta não comprovam equilíbrio; energia absoluta de métodos ou composições diferentes não fornece energia livre de reação.</p><p>Curvas não são suavizadas. Lacunas e reinícios permanecem separados. Quando exibida, a variação de cada curva usa seu próprio primeiro valor disponível.</p></details>`;
  }
  function renderDetails(){
    $('file-details-content').innerHTML=state.runs.map(r=>{const m=metadata(r),warnings=[...new Set([...(r.energy?.warnings||[]),...(r.out?.warnings||[]).filter(w=>!r.energy||!w.startsWith('O .out pode')),...(r.xyz?.warnings||[]),...(r.colvars?.warnings||[]),...(r.warnings||[])])];
      const values=[m.method?`Método/input: ${m.method}`:null,m.timestep!==null&&m.timestep!==undefined?`Timestep declarado: ${num(m.timestep)} fs`:null,m.targetTemperature?`Alvo do termostato: ${num(m.targetTemperature)} K (${m.thermostat})`:null,m.charge!==null&&m.charge!==undefined?`Carga ${m.charge}; multiplicidade ${m.multiplicity}`:null,r.out?`Saída: ${m.normal?'término normal':m.failed?'término com erro':'sem término normal identificado'}`:null,m.runtime!==null&&m.runtime!==undefined?`Tempo de execução: ${num(m.runtime)} s (não é o tempo físico da simulação)`:null,m.finalEnergy!==null&&m.finalEnergy!==undefined&&!energy(r)?.rows.length?`Última energia pontual: ${num(m.finalEnergy,12)} Eh`:null,r.energy?'Gráficos de energia: CSV (prioridade sobre o .out).':r.out?.rows.length?'Gráficos de energia: valores impressos no .out.':null].filter(Boolean);
      return `<div class="file-record"><h3>${esc(r.label)} · ${r.reference?'referência dos ministrantes':'arquivo carregado'}</h3><label>Condição da dinâmica <select data-ensemble="${r.id}" aria-label="Ensemble de ${esc(r.label)}"><option value="unknown" ${ensemble(r)==='unknown'?'selected':''}>Não informado</option><option value="NVE" ${ensemble(r)==='NVE'?'selected':''}>NVE</option><option value="NVT" ${ensemble(r)==='NVT'?'selected':''}>NVT / termostato</option></select></label><ul>${r.files.map(f=>`<li>${esc(f.name)}${r.reference&&f.path?` · <a href="../${esc(f.path)}" download>arquivo original</a>`:''}</li>`).join('')}${values.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>${warnings.length?`<p><strong>Observações de leitura</strong></p><ul>${warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>`:''}</div>`;
    }).join('');
    $('file-details-content').querySelectorAll('[data-ensemble]').forEach(el=>el.addEventListener('change',()=>{const run=state.runs.find(r=>r.id===Number(el.dataset.ensemble));run.ensembleOverride=el.value;renderEnergy();}));
  }
  function currentTrajectory(){return visible().find(r=>r.id===Number($('trajectory-run').value));}
  function currentDistance(){return visible().find(r=>r.id===Number($('distance-run').value));}
  // Highlights identify fixed atom indices. They never change the source XYZ,
  // track a moving charge defect, or recalculate molecule membership per frame.
  function highlights(run){return run?.highlights||[];}
  function highlightSettings(run){return run.highlightSettings||(run.highlightSettings={size:1.6,muted:true});}
  function highlightColors(run){const map=new Map();for(const group of highlights(run))for(const index of group.indices)map.set(index,group.color);return map;}
  function highlightRadius(element,run){return (elementRadii[element]||.42)*highlightSettings(run).size;}
  function sharedProtonExample(run){return !!run?.reference&&run.key==='proton_shared'&&run.xyz?.elements.join(',')==='O,O,H,H,H,H,H';}
  function highlightMode(){const manual=$('highlight-kind').value==='indices';$('highlight-atom-field').hidden=manual;$('highlight-indices-field').hidden=!manual;$('highlight-paint').disabled=manual;if(manual)$('highlight-paint').checked=false;}
  function renderHighlights(run,changedRun=false){
    if(!run?.xyz)return;
    const settings=highlightSettings(run),groups=highlights(run),count=new Set(groups.flatMap(group=>group.indices)).size;
    if(changedRun){
      const select=$('highlight-atom');select.replaceChildren();
      run.xyz.elements.forEach((element,index)=>{const option=document.createElement('option');option.value=index;option.textContent=`${element} ${index}`;select.append(option);});
      $('highlight-indices').value='';$('highlight-status').textContent='';$('highlight-paint').checked=false;
      $('highlight-size').value=String(settings.size);$('highlight-muted').checked=settings.muted;
    }
    $('highlight-proton').hidden=!sharedProtonExample(run);
    $('highlight-count').textContent=count?`· ${count} ${count===1?'átomo':'átomos'}`:'· nenhum';
    $('highlight-clear').disabled=!groups.length;
    const list=$('highlight-list');list.replaceChildren();
    for(const group of groups){
      const chip=document.createElement('span');chip.className='highlight-chip';
      const swatch=document.createElement('i');swatch.style.backgroundColor=group.color;swatch.setAttribute('aria-hidden','true');
      const label=document.createElement('span');label.textContent=group.label;label.title=`Índices: ${group.indices.join(', ')} · selecionados no quadro ${group.frame+1}`;
      const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label',`Remover destaque ${group.label}`);
      remove.addEventListener('click',()=>{stop();run.highlights=highlights(run).filter(item=>item!==group);$('highlight-status').textContent=`Destaque removido: ${group.label}.`;renderHighlights(run);renderContactLegend(run);drawFrame();});
      chip.append(swatch,label,remove);list.append(chip);
    }
    highlightMode();
  }
  function addHighlight(){
    const run=currentTrajectory();if(!run?.xyz)return;
    stop();const kind=$('highlight-kind').value,seed=Number($('highlight-atom').value);
    try{
      let indices;
      if(kind==='indices')indices=H.parseAtomIndices($('highlight-indices').value,run.xyz.elements.length);
      else if(kind==='molecule')indices=H.moleculeIndices(run.xyz.elements,run.xyz.frames[state.frame].coords,seed);
      else indices=Number.isInteger(seed)&&seed>=0&&seed<run.xyz.elements.length?[seed]:[];
      if(!indices.length)throw new Error('Escolha um átomo válido para destacar.');
      const anchor=kind==='indices'?indices[0]:seed,color=$('highlight-color').value;
      if(!/^#[0-9a-f]{6}$/i.test(color))throw new Error('Escolha uma cor para o destaque.');
      const label=kind==='atom'?`${run.xyz.elements[anchor]} ${anchor}`:kind==='molecule'?`Molécula de ${run.xyz.elements[anchor]} ${anchor} · ${indices.length} átomos`:`Grupo · ${indices.length} átomos`;
      const group={indices:[...indices],anchor,color,label,frame:state.frame};
      // Recoloring the same selection replaces it; overlapping selections are
      // painted in insertion order, so the most recent color takes precedence.
      run.highlights=highlights(run).filter(item=>item.indices.join(',')!==indices.join(','));run.highlights.push(group);
      state.selectedAtom=anchor;$('highlight-atom').value=String(anchor);
      $('highlight-status').textContent=`${label} em destaque. A seleção acompanha estes mesmos índices.`;
      renderHighlights(run);renderContactLegend(run);drawFrame();
    }catch(error){$('highlight-status').textContent=error.message;}
  }
  function selectTrajectoryAtom(index){
    const run=currentTrajectory();if(!run?.xyz||!Number.isInteger(index)||index<0||index>=run.xyz.elements.length)return;
    state.selectedAtom=index;$('highlight-atom').value=String(index);renderAtomInfo();
    if($('highlight-paint').checked&&$('highlight-kind').value!=='indices')addHighlight();
  }
  function drawHighlights(run,atoms){
    const map=highlightColors(run),settings=highlightSettings(run);
    if(!map.size)return map;
    if(settings.muted){
      for(const element of new Set(run.xyz.elements)){
        const cage=isWaterCage(run.xyz)&&element==='C',style={sphere:{radius:cage ? .075 : elementRadii[element]||.42,color:'#bdc8cd'}};
        if($('proximity-lines').checked)style.stick={radius:cage ? .035 : .075,color:'#bdc8cd'};
        state.model.setStyle({elem:element},style);
      }
    }
    for(const [index,color] of map){const atom=atoms[index];if(!atom)continue;const style={sphere:{radius:highlightRadius(atom.elem,run),color}};if($('proximity-lines').checked)style.stick={radius:.095,color};state.model.setStyle({index},style);}
    return map;
  }
  function isWaterCage(xyz){return xyz.elements.length===63&&xyz.elements.filter(e=>e==='C').length===60&&xyz.elements.filter(e=>e==='O').length===1&&xyz.elements.filter(e=>e==='H').length===2;}
  function stageTarget(stage){
    const numeric=value=>value===null||value===undefined||value===''?NaN:Number(value),start=numeric(stage.targetStartK),end=numeric(stage.targetEndK),single=numeric(stage.targetTemperature);
    const describe=value=>stage.label?`${stage.label} · ${value}`:value;
    if(stage.ramp&&Number.isFinite(start)&&Number.isFinite(end))return describe(`${num(start)}→${num(end)} K`);
    if(Number.isFinite(single))return describe(`${num(single)} K`);
    if(Number.isFinite(start)&&Number.isFinite(end)&&start!==end)return describe(`${num(start)}→${num(end)} K`);
    if(Number.isFinite(start))return describe(`${num(start)} K`);
    return describe('temperatura não informada');
  }
  function stageTime(value){const numeric=value===null||value===undefined||value===''?NaN:Number(value);return Number.isFinite(numeric)?`${num(numeric)} fs · ${num(numeric/1000)} ps`:'fim não informado';}
  function renderStageSummary(runs,targetId,actualTime=null){
    const host=$(targetId),groups=(runs||[]).map(run=>({run,stages:metadata(run).stages})).filter(group=>Array.isArray(group.stages)&&group.stages.length);
    if(!host)return;if(!groups.length){host.hidden=true;host.replaceChildren();return;}
    host.hidden=false;host.innerHTML='<p class="stage-summary-caption">Programa do input; confira até onde há dados.</p>'+groups.map(({run,stages})=>`<div class="stage-run"><strong>${esc(run.label)}</strong><div class="stage-chips">${stages.map((stage,index)=>{const numeric=value=>value===null||value===undefined||value===''?NaN:Number(value),start=numeric(stage.startFs),end=numeric(stage.endFs),last=index===stages.length-1,active=Number.isFinite(actualTime)&&Number.isFinite(start)&&actualTime>=start-1e-9&&(!Number.isFinite(end)||(last?actualTime<=end+1e-9:actualTime<end-1e-9));return `<span class="stage-chip${active?' active':''}" title="Etapa ${stage.index??index+1}"><b>${stage.index??index+1}</b><span>${stageTime(start)} → ${stageTime(end)}</span><em>${esc(stageTarget(stage))}</em></span>`;}).join('')}</div></div>`).join('');
  }
  function clearContactShapes(){if(!state.viewer){state.contactShapes=[];return;}for(const shape of state.contactShapes){try{state.viewer.removeShape(shape);}catch(error){/* an already removed shape is harmless */}}state.contactShapes=[];}
  function contactLine(start,end,kind){
    if(!state.viewer)return;
    // Thin WebGL line widths are commonly ignored, so use 3Dmol's dashed
    // cylinder primitive for a visible contact while keeping each returned
    // shape in the contact-only cleanup list.
    const styles=kind==='hbond'?{color:'#0b8f86',radius:.025,dashLength:.18,gapLength:.11}:{color:'#7551a2',radius:.04,dashLength:.18,gapLength:.11};
    const shape=state.viewer.addCylinder({start:{x:start[0],y:start[1],z:start[2]},end:{x:end[0],y:end[1],z:end[2]},dashed:true,...styles});
    if(shape)state.contactShapes.push(shape);
  }
  function coordinationCutoff(){const input=$('coordination-cutoff'),raw=Number(input?.value);const value=Math.max(2,Math.min(3.5,Number.isFinite(raw)?raw:2.6));if(input&&String(raw)!==String(value))input.value=value.toFixed(1);return value;}
  function drawContactSuggestions(run,frame){
    clearContactShapes();const xyz=run?.xyz;if(!xyz)return;
    const bonds=G.inferCovalentBonds(xyz.elements,frame.coords);
    if($('hydrogen-bonds')?.checked)for(const contact of G.hydrogenBonds(xyz.elements,frame.coords,{bonds}))contactLine(frame.coords[contact.hydrogen],frame.coords[contact.acceptor],'hbond');
    if($('coordination-contacts')?.checked)for(const contact of G.coordinationContacts(xyz.elements,frame.coords,{cutoff:coordinationCutoff()}))contactLine(frame.coords[contact.metal],frame.coords[contact.ligand],'coordination');
  }
  function renderContactLegend(run){
    const legend=$('molecule-legend');if(!legend||!run?.xyz)return;
    const highlighted=highlights(run),muted=highlighted.length&&highlightSettings(run).muted;
    const elements=[...new Set(run.xyz.elements)].map(e=>`<span class="element-key"><i style="background:${muted?'#bdc8cd':elementColors[e]||'#8a8990'}"></i>${esc(e)}</span>`);
    for(const group of highlighted)elements.push(`<span class="highlight-key"><i style="background:${group.color}"></i>${esc(group.label)}</span>`);
    const sphere=metadata(run).wallSphere;if(sphere)elements.push(`<span class="wall-key">Parede suave · raio ${num(sphere.radius)} Å</span>`);
    if(isWaterCage(run.xyz))elements.push('<span class="wall-key">C₆₀ em armação · água no interior</span>');
    elements.push('<span class="contact-key"><i class="contact-sample hbond-sample"></i>Ligação H · heurística</span>','<span class="contact-key"><i class="contact-sample coordination-sample"></i>Coordenação · geométrica</span>');
    legend.innerHTML=elements.join('');
  }
  function drawWall(run){
    clearContactShapes();state.viewer.removeAllShapes();const sphere=metadata(run).wallSphere;if(!sphere)return;
    for(let plane=0;plane<3;plane++){
      const points=[];for(let i=0;i<=72;i++){const t=2*Math.PI*i/72,p=[0,0,0];p[(plane+1)%3]=sphere.radius*Math.cos(t);p[(plane+2)%3]=sphere.radius*Math.sin(t);points.push({x:p[0]+sphere.center.x,y:p[1]+sphere.center.y,z:p[2]+sphere.center.z});}
      state.viewer.addCurve({points,radius:.018,color:'#3e9295',opacity:.65,smooth:0});
    }
  }
  function renderTrajectoryChart(run){
    const rows=energy(run)?.rows||[],keys=['kinetic','potential','total'],hasEnergy=row=>keys.some(key=>Number.isFinite(row[key])),hasTemperature=row=>Number.isFinite(row.temperature);
    state.energyIndex=TrajectoryTime.index(rows,hasEnergy);state.temperatureIndex=TrajectoryTime.index(rows,hasTemperature);state.frameIndex=TrajectoryTime.index(run.xyz.frames);
    state.hasTrajectoryEnergy=rows.some(row=>Number.isFinite(row.time)&&hasEnergy(row));state.hasTrajectoryTemperature=rows.some(row=>Number.isFinite(row.time)&&hasTemperature(row));
    state.trajectoryChart=null;state.trajectoryTemperatureChart=null;
    // Both plots share the recorded time axis. A rounded CSV endpoint may be
    // extended only by an XYZ frame matched to the same recorded step.
    const entries=state.energyIndex.entries;
    let xmin=entries[0]?.time??0,xmax=entries.at(-1)?.time??1;
    for(const frame of run.xyz.frames)if(state.energyIndex.exact(frame.time,frame)||state.temperatureIndex.exact(frame.time,frame)){xmin=Math.min(xmin,frame.time);xmax=Math.max(xmax,frame.time);}
    const domain=[xmin,xmax];
    renderTrajectoryEnergyChart(run,rows,domain);renderTrajectoryTemperatureChart(run,rows,domain);updateTrajectoryCursor(run);
  }
  function seekTrajectoryTime(time,statusId){
    const index=state.frameIndex.nearest(time,state.frame);if(index!==null)seekFrame(index);else $(statusId).textContent='Este tempo está fora dos quadros XYZ disponíveis; o quadro foi mantido.';
  }
  function renderTrajectoryEnergyChart(run,rows,domain){
    const keys=['kinetic','potential','total'],selected=keys.filter(key=>$('trajectory-show-'+key).checked),has=rows.some(row=>Number.isFinite(row.time)&&selected.some(key=>Number.isFinite(row[key])));
    $('trajectory-energy-chart').hidden=!has;$('trajectory-energy-empty').hidden=has;
    if(!has){$('trajectory-energy-chart').replaceChildren();$('trajectory-energy-empty').textContent=!selected.length?'Selecione ao menos uma energia nas caixas acima.':state.hasTrajectoryEnergy?'As energias selecionadas não constam deste arquivo. Escolha outra curva nas caixas acima.':'Carregue o arquivo -md-ener.csv ou um .out de MD com o mesmo nome-base do XYZ para acompanhar as energias.';$('trajectory-energy-note').textContent='Curvas associadas ao XYZ pelo tempo físico registrado.';return;}
    const labels={kinetic:'Cinética · K',potential:'Potencial · U',total:'Total · E'},colors={kinetic:'#ac6300',potential:'#8e5ea2',total:'#006e66'},dashes={kinetic:'2 3',potential:'5 3',total:''};
    const delta=$('trajectory-energy-mode').value==='delta';
    const series=selected.map(key=>{const first=rows.find(row=>Number.isFinite(row.time)&&Number.isFinite(row[key]))?.[key];return {name:labels[key],color:colors[key],dash:dashes[key],points:rows.map(row=>({x:row.time,y:Number.isFinite(row[key])?(row[key]-(delta?first:0))*R.HARTREE_TO_KJMOL:null,segment:row.segment}))};});
    state.trajectoryChart=new ScientificChart($('trajectory-energy-chart'),{title:'Energias e quadro atual',series,height:175,xDomain:domain,yLabel:`${delta?'Δ energia':'Energia'} (kJ/mol)`,xLabel:'Tempo físico (fs)',xUnit:'fs',yUnit:'kJ/mol',onSeek:time=>seekTrajectoryTime(time,'trajectory-energy-status')});
    const missing=selected.filter(key=>!rows.some(row=>Number.isFinite(row[key]))).map(key=>labels[key]);
    $('trajectory-energy-note').textContent=(delta?'ΔX = X(t) − X(primeiro ponto), por curva. ':'Valores absolutos. ')+(missing.length?`Sem dados: ${missing.join(', ')}. `:'')+'Clique na curva para escolher um quadro.';
  }
  function renderTrajectoryTemperatureChart(run,rows,domain){
    const has=state.hasTrajectoryTemperature;$('trajectory-temperature-chart').hidden=!has;$('trajectory-temperature-empty').hidden=has;
    if(!has){$('trajectory-temperature-chart').replaceChildren();$('trajectory-temperature-empty').textContent='Sem temperatura registrada ao longo do tempo. Junte o -md-ener.csv ou um .out de MD correspondente; o XYZ sozinho não fornece T.';$('trajectory-temperature-note').textContent='A temperatura não é estimada a partir da animação.';return;}
    const delta=$('trajectory-temperature-mode').value==='delta',initial=rows.find(row=>Number.isFinite(row.time)&&Number.isFinite(row.temperature)).temperature;
    const series=[{name:delta?'ΔT desde o início':'Temperatura instantânea',color:'#176ba0',points:rows.map(row=>({x:row.time,y:Number.isFinite(row.temperature)?row.temperature-(delta?initial:0):null,segment:row.segment}))}];
    state.trajectoryTemperatureChart=new ScientificChart($('trajectory-temperature-chart'),{title:'Temperatura e quadro atual',series,height:170,xDomain:domain,yLabel:delta?'Δ temperatura (K)':'Temperatura (K)',xLabel:'Tempo físico (fs)',xUnit:'fs',yUnit:'K',onSeek:time=>seekTrajectoryTime(time,'trajectory-temperature-status')});
    $('trajectory-temperature-note').textContent=(delta?`ΔT = T(t) − T inicial (${num(initial,8)} K). `:'T instantânea do arquivo, não a temperatura-alvo do termostato. ')+'A linha escura acompanha a trajetória.';
  }
  function trajectorySampleStatus(frame,index,hasData,quantity){
    const time=frame?.time;if(!hasData)return `Sem série de ${quantity} associada.`;
    if(!Number.isFinite(time))return 'O XYZ não informa tempo físico; não há sincronização.';
    if(!index.covers(time,frame))return `${num(time,8)} fs · sem ${quantity} correspondente neste intervalo.`;
    const row=index.exact(time,frame);
    return `Quadro ${state.frame+1} · ${num(time,8)} fs${row?(Math.abs(row.time-time)>1e-7?` · tempo CSV arredondado (${num(row.time,8)} fs)`:` · ${quantity==='temperatura'?num(row.temperature,6)+' K':'amostra de energia disponível'}`):' · entre amostras; valores não interpolados'}`;
  }
  function updateTrajectoryCursor(run){
    const frame=run?.xyz.frames[state.frame],time=frame?.time;
    state.trajectoryChart?.setCursorX(state.hasTrajectoryEnergy&&state.energyIndex.covers(time,frame)?time:null);
    state.trajectoryTemperatureChart?.setCursorX(state.hasTrajectoryTemperature&&state.temperatureIndex.covers(time,frame)?time:null);
    $('trajectory-energy-status').textContent=['kinetic','potential','total'].some(key=>$('trajectory-show-'+key).checked)?trajectorySampleStatus(frame,state.energyIndex,state.hasTrajectoryEnergy,'energia'):'Selecione ao menos uma energia acima.';
    $('trajectory-temperature-status').textContent=trajectorySampleStatus(frame,state.temperatureIndex,state.hasTrajectoryTemperature,'temperatura');
  }
  function setInteraction(mode){
    state.interaction=mode;state.panGesture=null;$('molecule').dataset.interaction=mode;
    $('rotate-molecule').setAttribute('aria-pressed',String(mode==='rotate'));$('pan-molecule').setAttribute('aria-pressed',String(mode==='pan'));
    $('molecule').setAttribute('aria-label',`Estrutura molecular interativa. ${mode==='pan'?'Modo Mover: arraste ou use as setas para reposicionar.':'Modo Girar: arraste para girar.'} Use a roda para ampliar.`);
    $('molecule-drag-hint').textContent=mode==='pan'?'Arraste ou use as setas para mover':'Arraste para girar a molécula';
    if(mode==='pan')$('molecule').focus({preventScroll:true});
  }
  function startPan(event,touch=false){
    if(state.interaction!=='pan'||!state.viewer||(touch?event.touches.length!==1:event.button!==0))return;
    const point=touch?event.touches[0]:event;state.panGesture={x:point.clientX,y:point.clientY,touch};
    // Let 3Dmol receive down/up events: an unmoved click still selects an atom.
  }
  function movePan(event,touch=false){
    const gesture=state.panGesture;if(!gesture||gesture.touch!==touch)return;
    if(touch&&event.touches.length!==1){state.panGesture=null;return;}
    const point=touch?event.touches[0]:event,dx=point.clientX-gesture.x,dy=point.clientY-gesture.y;
    event.preventDefault();event.stopImmediatePropagation();gesture.x=point.clientX;gesture.y=point.clientY;
    // translateScene changes the retained scene position, so playback preserves
    // the pan and native rotation cannot run simultaneously with this gesture.
    if(dx||dy)state.viewer.translateScene(dx,dy);
  }
  function panWithKeyboard(event){
    if(state.interaction!=='pan'||!state.viewer||event.altKey||event.ctrlKey||event.metaKey)return;
    const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];if(!direction)return;
    event.preventDefault();event.stopPropagation();const step=event.shiftKey?40:12;
    state.viewer.translateScene(direction[0]*step,direction[1]*step);
  }
  function resizeTrajectory(){
    if(state.tab!=='trajectory'||!currentTrajectory()?.xyz)return;
    const panel=$('panel-trajectory'),canvas=$('molecule'),expanded=$('expand-trajectory').getAttribute('aria-expanded')==='true';
    // Controls come before the canvas when expanded. Use the remaining viewport
    // height so a laptop can show transport, molecule, and energy chart together.
    canvas.style.height=expanded&&window.innerWidth>800?`${Math.max(280,Math.min(950,window.innerHeight-canvas.getBoundingClientRect().top-panel.scrollTop-24))}px`:'';
    state.viewer?.resize();renderTrajectoryChart(currentTrajectory());
  }
  function expandTrajectory(expanded,restoreFocus=true){
    const panel=$('panel-trajectory'),button=$('expand-trajectory'),wasExpanded=button.getAttribute('aria-expanded')==='true';
    if(expanded&&!wasExpanded){
      state.expandedReturnFocus=document.activeElement||button;state.expandedBackground=[];
      // Inactivate siblings along the panel's ancestor chain without making
      // the panel itself inert. Remember existing inert states for restoration.
      let branch=panel;
      for(let parent=branch.parentElement;parent;branch=parent,parent=parent.parentElement){
        for(const sibling of parent.children)if(sibling!==branch){state.expandedBackground.push({node:sibling,inert:sibling.inert});sibling.inert=true;}
        if(parent===document.body)break;
      }
    }
    panel.classList.toggle('trajectory-expanded',expanded);document.body.classList.toggle('trajectory-open',expanded);
    panel.setAttribute('role',expanded?'dialog':'tabpanel');if(expanded)panel.setAttribute('aria-modal','true');else panel.removeAttribute('aria-modal');
    $('expand-trajectory').setAttribute('aria-expanded',String(expanded));$('expand-trajectory').textContent=expanded?'Reduzir área':'Ampliar área';
    if(expanded){panel.scrollTop=0;button.focus({preventScroll:true});}
    else{
      for(const saved of state.expandedBackground)saved.node.inert=saved.inert;state.expandedBackground=[];
      $('molecule').style?.removeProperty('height');state.panGesture=null;
      if(wasExpanded&&restoreFocus)(state.expandedReturnFocus?.isConnected?state.expandedReturnFocus:button).focus({preventScroll:true});
      state.expandedReturnFocus=null;
    }
    if(wasExpanded!==expanded)requestAnimationFrame(resizeTrajectory);
  }
  function expandedKeys(event){
    if($('expand-trajectory').getAttribute('aria-expanded')!=='true')return;
    if(event.key==='Escape'){event.preventDefault();expandTrajectory(false);return;}
    if(event.key!=='Tab')return;
    const focusable=[...$('panel-trajectory').querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(node=>!node.disabled&&node.tabIndex>=0&&node.getClientRects().length);
    const first=focusable[0],last=focusable.at(-1),active=document.activeElement;
    if(!first){event.preventDefault();$('expand-trajectory').focus();return;}
    if(!focusable.includes(active)||(event.shiftKey?active===first:active===last)){event.preventDefault();(event.shiftKey?last:first).focus();}
  }
  function renderTrajectory(){
    const run=currentTrajectory(),has=!!run?.xyz;$('trajectory-empty').hidden=has;$('trajectory-content').hidden=!has;
    $('reset-view').disabled=!has;renderPlaybackControls(run);
    if(!has){
      stop();clearContactShapes();state.viewer?.removeAllModels();state.viewer?.removeAllShapes();state.viewer?.removeAllLabels();state.viewer?.render();state.model=null;state.viewRun=null;state.frame=0;state.selectedAtom=null;
      renderStageSummary([],'trajectory-stage-summary');
      $('trajectory-empty').innerHTML=!visible().length?'<strong>Marque uma simulação acima.</strong>As caixas selecionam os cálculos disponíveis nas três abas.':'<strong>O movimento está no arquivo XYZ.</strong>Carregue nome-traj.xyz para uma simulação marcada. O .out e o CSV de energias não contêm necessariamente as coordenadas de todos os passos.';return;
    }
    renderStageSummary([run],'trajectory-stage-summary',run.xyz.frames[state.frame]?.time);
    if(!window.$3Dmol){$('trajectory-content').hidden=true;$('trajectory-empty').hidden=false;$('trajectory-empty').textContent='O visualizador molecular não foi carregado. Mantenha a pasta vendor junto ao aplicativo. As distâncias continuam disponíveis.';return;}
    try{if(!state.viewer){state.viewer=$3Dmol.createViewer($('molecule'),{backgroundColor:'white',orthographic:true,antialias:true});state.viewer.setProjection('orthographic');state.initialView=state.viewer.getView().slice();}
      const changedRun=state.viewRun!==run.id;
      if(changedRun){state.frame=0;state.selectedAtom=null;state.viewRun=run.id;state.timeFormat=timeFormat(run.xyz.frames);ensureTrajectoryReadouts();$('frame-slider').value='0';state.viewer.removeAllModels();state.viewer.removeAllLabels();state.model=state.viewer.addModel();}
      if(changedRun)drawWall(run);
      renderHighlights(run,changedRun);
      $('frame-slider').max=run.xyz.frames.length-1;$('frame-number').max=run.xyz.frames.length;
      ensureTrajectoryReadouts();renderContactLegend(run);
      $('trajectory-status').hidden=!metadata(run).failed;$('trajectory-status').textContent=metadata(run).failed?'Cálculo interrompido com erro. Estes quadros são parciais: a distorção não é evidência confiável de reação.':'';
      state.viewer.resize();renderTrajectoryChart(run);drawFrame(changedRun);
    }catch(error){state.viewRun=null;stop();console.error('Falha ao desenhar a trajetória',run.key,error);$('trajectory-content').hidden=true;$('trajectory-empty').hidden=false;$('trajectory-empty').textContent='Não foi possível desenhar esta trajetória. Tente abrir o exemplo novamente; se persistir, confira se o navegador permite WebGL. Gráficos e medidas geométricas continuam disponíveis.';}
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
    const highlighted=drawHighlights(run,atoms);
    state.viewer.removeAllLabels();
    if($('atom-labels').checked)atoms.forEach((a,i)=>state.viewer.addLabel(`${a.elem} ${i}`,{position:a,fontColor:'#17313e',backgroundColor:'white',backgroundOpacity:.7,fontSize:highlighted.has(i)?14:11,borderThickness:highlighted.has(i)?1:0,borderColor:highlighted.get(i)||'#17313e',inFront:true}));
    else if(run.reference&&run.key.includes('_longo')&&atoms[25]?.elem==='O')state.viewer.addLabel('O 25',{position:atoms[25],fontColor:'#9c382c',backgroundColor:'white',backgroundOpacity:.85,fontSize:12,borderThickness:0,inFront:true});
    if(!$('atom-labels').checked)for(const group of highlights(run)){const atom=atoms[group.anchor];if(atom&&highlighted.get(group.anchor)===group.color)state.viewer.addLabel(`${atom.elem} ${group.anchor}${group.indices.length>1?` · ${group.indices.length} átomos`:''}`,{position:atom,screenOffset:{x:12,y:12},fontColor:'#172f40',backgroundColor:'white',backgroundOpacity:.9,fontSize:14,borderColor:group.color,borderThickness:1,inFront:true});}
    drawContactSuggestions(run,frame);
    state.viewer.setClickable({},true,atom=>selectTrajectoryAtom(atom.serial));renderAtomInfo();
    if(fit)resetView();else state.viewer.render();
    ensureTrajectoryReadouts();const timeline=physicalTimeValues(frame.time),frameLabel=$('frame-time').querySelector('.frame-index'),timeLabel=$('frame-time').querySelector('.frame-time-value');
    $('frame-slider').value=state.frame;$('frame-number').value=state.frame+1;$('previous-frame').disabled=state.frame===0;$('next-frame').disabled=state.frame===xyz.frames.length-1;frameLabel.textContent=`Quadro ${state.frame+1}/${xyz.frames.length}`;timeLabel.textContent=frame.time===null||frame.time===undefined?'tempo não informado':timeline.fs;
    const row=state.energyIndex?.exact(frame.time,frame),temperatureRow=state.temperatureIndex?.exact(frame.time,frame);
    $('frame-time-fs').textContent=timeline.fs;$('frame-time-ps').textContent=timeline.ps;$('frame-time-s').textContent=timeline.s;renderStageSummary([run],'trajectory-stage-summary',frame.time);
    $('frame-temperature').textContent=Number.isFinite(temperatureRow?.temperature)?`${num(temperatureRow.temperature)} K`:'Sem amostra exata';
    for(const key of ['kinetic','potential','total'])$('frame-'+key).textContent=Number.isFinite(row?.[key])?`${num(row[key],9)} Eh`:'Sem amostra exata';
    $('frame-atoms').textContent=xyz.elements.length;updateTrajectoryCursor(run);
  }
  function resetView(){
    if(!state.viewer||!state.model)return;const run=currentTrajectory();state.viewer.setView(state.initialView);state.viewer.rotate(60,'x');state.viewer.rotate(-20,'y');
    if(run?.xyz.elements.includes('Zn')){
      // Use one stable field of view for matching trajectories, including departing waters.
      const low=[Infinity,Infinity,Infinity],high=[-Infinity,-Infinity,-Infinity],signature=run.xyz.elements.join(',');
      for(const other of state.runs.filter(r=>r.xyz?.elements.join(',')===signature))for(const frame of other.xyz.frames)for(const c of frame.coords)for(let k=0;k<3;k++){low[k]=Math.min(low[k],c[k]);high[k]=Math.max(high[k],c[k]);}
      const proxy=state.viewer.addModel(),corners=[];for(let i=0;i<8;i++)corners.push({elem:'H',x:i&1?high[0]:low[0],y:i&2?high[1]:low[1],z:i&4?high[2]:low[2]});proxy.addAtoms(corners);state.viewer.zoomTo({model:proxy});state.viewer.removeModel(proxy);
      // Leave room for rotated edge atoms and their rendered sphere radii.
      state.viewer.zoom(.9);
    }else state.viewer.zoomTo();
    if(run?.xyz&&run.xyz.elements.length<=20&&!metadata(run).wallSphere&&!run.xyz.elements.includes('Zn')){
      // 3Dmol's default fit reserves a 5 Å radius even for tiny molecules.
      // Correct only that minimum, using atom extents plus the rendered radii;
      // confined systems keep their entire wall and Zn keeps its shared view.
      const coords=run.xyz.frames[state.frame].coords,low=[Infinity,Infinity,Infinity],high=[-Infinity,-Infinity,-Infinity];
      for(const point of coords)for(let k=0;k<3;k++){low[k]=Math.min(low[k],point[k]);high[k]=Math.max(high[k],point[k]);}
      const center=low.map((value,k)=>(value+high[k])/2);
      const highlighted=highlightColors(run),radius=Math.max(...coords.map((point,i)=>Math.hypot(...point.map((value,k)=>value-center[k]))+(highlighted.has(i)?highlightRadius(run.xyz.elements[i],run):elementRadii[run.xyz.elements[i]]||.42)));
      state.viewer.zoom(Math.max(1,Math.min(3.4,5/(Math.max(radius,1)*1.2))));
    }
    state.viewer.render();
  }
  function renderAtomInfo(){const run=currentTrajectory(),index=state.selectedAtom,coords=run?.xyz?.frames[state.frame]?.coords[index];$('atom-info').textContent=index===null||!coords?'Selecione um átomo para ver seu índice e suas coordenadas.':`${run.xyz.elements[index]} · índice ${index}: x = ${num(coords[0],7)}, y = ${num(coords[1],7)}, z = ${num(coords[2],7)} Å.`;}
  function seekFrame(index){stop();const run=currentTrajectory();if(!run?.xyz)return;if(!Number.isFinite(index)){$('frame-number').value=state.frame+1;return;}state.frame=Math.max(0,Math.min(run.xyz.frames.length-1,Math.round(index)));drawFrame();}
  function play(){
    if(state.playing){stop();return;}
    const run=currentTrajectory(),frameCount=run?.xyz?.frames.length||0;if(!run?.xyz||frameCount<2)return;
    state.playing=true;state.playback={runId:run.id,startFrame:state.frame,baseDuration:playbackDuration(),phase:0,lastTimestamp:null};$('play-button').textContent='Ⅱ Pausar';
    const tick=timestamp=>{
      if(!state.playing||state.playback.runId!==run.id)return;
      if(state.playback.lastTimestamp===null){state.playback.lastTimestamp=timestamp;state.timer=requestAnimationFrame(tick);return;}
      const elapsed=Math.max(0,timestamp-state.playback.lastTimestamp);state.playback.lastTimestamp=timestamp;const speed=playbackSpeed();
      state.playback.phase=(state.playback.phase+elapsed/state.playback.baseDuration*speed)%1;
      const next=(state.playback.startFrame+Math.floor(state.playback.phase*frameCount))%frameCount;
      if(next!==state.frame){state.frame=next;drawFrame();}
      state.timer=requestAnimationFrame(tick);
    };
    state.timer=requestAnimationFrame(tick);
  }
  function initialPairs(run){if(state.pairs[run.id])return;const els=run.xyz.elements,zn=els.indexOf('Zn'),ns=els.map((e,i)=>e==='N'?i:null).filter(x=>x!==null);state.pairs[run.id]=run.reference&&run.key==='controle_dt025_31A'?[[0,10],[0,1],[0,31]]:zn>=0&&ns.length?[...ns.slice(0,2).map(n=>[zn,n]),...(run.key?.includes('_longo')?[[zn,25]]:[])]:els.length>1?[[0,1]]:[];}
  function ensureGeometryMeasures(run){initialPairs(run);if(!state.geometryMeasures[run.id])state.geometryMeasures[run.id]={distance:state.pairs[run.id],angle:[],dihedral:[]};return state.geometryMeasures[run.id];}
  function geometryType(){return $('geometry-type')?.value||'distance';}
  function geometryLabel(xyz,indices,type){const labels=indices.map((index,i)=>`${esc(xyz.elements[index]||'Átomo')} ${index}`);return type==='distance'?`${labels[0]} — ${labels[1]}`:labels.join(' — ');}
  function geometryValues(xyz,type,indices){
    const timed=xyz.frames.every(frame=>frame.time!==null);let last=null,lastBase=null,wrap=0;
    return xyz.frames.map((frame,i)=>{
      const base=frame.segment||0;if(lastBase!==null&&base!==lastBase){last=null;wrap=0;}lastBase=base;
      let value=null;if(type==='distance')value=G.distance(frame.coords[indices[0]],frame.coords[indices[1]]);else if(type==='angle')value=G.angle(frame.coords[indices[0]],frame.coords[indices[1]],frame.coords[indices[2]]);else value=G.dihedral(frame.coords[indices[0]],frame.coords[indices[1]],frame.coords[indices[2]],frame.coords[indices[3]]);
      if(type==='dihedral'&&Number.isFinite(value)&&Number.isFinite(last)&&Math.abs(value-last)>180)wrap++;
      const segment=`${base}:${wrap}`;if(Number.isFinite(value))last=value;else last=null;
      return {time:timed?frame.time:i+1,step:frame.step,segment,value};
    });
  }
  function populateGeometrySelectors(xyz,resetControls=false){
    const type=geometryType(),measures=ensureGeometryMeasures(currentDistance()),fallback=[0,Math.min(1,xyz.elements.length-1),Math.min(2,xyz.elements.length-1),Math.min(3,xyz.elements.length-1)],current=measures[type][0]||(type==='distance'&&measures.distance[0])||fallback;
    const selected=[current[0],current[1],current[2]??current[1],current[3]??current[2]??current[1]];
    for(const id of ['atom-a','atom-b','atom-c','atom-d']){const select=$(id);if(!select)continue;const position=id==='atom-a'?0:id==='atom-b'?1:id==='atom-c'?2:3;if(resetControls||select.options.length!==xyz.elements.length){select.replaceChildren();xyz.elements.forEach((e,i)=>{const opt=document.createElement('option');opt.value=i;opt.textContent=`${e} · ${i}`;select.append(opt);});}if(resetControls||select.value===''||!Number.isInteger(Number(select.value))||Number(select.value)>=xyz.elements.length)select.value=selected[position]??0;}
    const needC=type!=='distance',needD=type==='dihedral';$('geometry-atom-c').hidden=!needC;$('geometry-atom-d').hidden=!needD;
    $('geometry-help').textContent=type==='distance'?'Índices começam em 0, como no ORCA. Medidas usam as coordenadas de cada quadro.':type==='angle'?'Ângulo no segundo átomo selecionado, em graus; braços de comprimento zero ficam como lacuna.':'Diedro assinado em graus (−180° a 180°); saltos de periodicidade abrem lacunas no gráfico.';
  }
  function renderDistances(resetControls=false){
    const run=currentDistance(),has=!!run;$('distance-empty').hidden=has;$('distance-content').hidden=!has;$('export-distance').disabled=!has;
    if(!has){state.distanceSeries=[];state.geometrySeries=[];$('distance-chart').replaceChildren();$('distance-stats').replaceChildren();$('geometry-preview-note').hidden=true;$('geometry-preview-note').textContent='';$('distance-empty').innerHTML=!visible().length?'<strong>Marque uma simulação acima.</strong>As caixas selecionam os cálculos disponíveis nas três abas.':'<strong>Escolha uma medida geométrica.</strong>Carregue uma trajetória XYZ, ou o CSV de Colvars do ORCA, para uma simulação marcada.';return;}
    const source=$('distance-source');source.options[0].disabled=!run.xyz;source.options[1].disabled=!run.colvars;
    if(!run.xyz)source.value='colvars';else if(!run.colvars)source.value='xyz';
    const fromXYZ=source.value==='xyz';$('atom-pair-controls').hidden=!fromXYZ;$('colvar-controls').hidden=fromXYZ;$('distance-chips').hidden=!fromXYZ;
    let series=[],timed=true,type='distance',unit='Å';
    if(fromXYZ){
      const xyz=run.xyz,measures=ensureGeometryMeasures(run);timed=xyz.frames.every(f=>f.time!==null);populateGeometrySelectors(xyz,resetControls);type=geometryType();unit=type==='distance'?'Å':'°';
      const previewNote=$('geometry-preview-note');if(previewNote){previewNote.hidden=!(xyz.previewStride&&xyz.previewStride>1);previewNote.textContent=previewNote.hidden?'':`Esta é uma prévia: 1 a cada ${xyz.previewStride} quadros originais, mais o último. As medidas usam somente os quadros carregados; carregue o XYZ original para analisar todos os quadros.`;}
      const firstFrame=xyz.frames[0];$('ethanol-preset').hidden=!G.isEthanolSkeleton(xyz.elements,firstFrame.coords);
      series=measures[type].map((indices,i)=>({name:geometryLabel(xyz,indices,type),color:colors[i%colors.length],dash:i%2?'5 3':'',points:geometryValues(xyz,type,indices).map(p=>({x:p.time,y:p.value,segment:p.segment}))}));
      $('distance-chips').innerHTML=measures[type].map((indices,i)=>`<span class="distance-chip" style="--run-color:${colors[i%colors.length]}">${geometryLabel(xyz,indices,type)}<button type="button" data-measure="${i}" aria-label="Remover medida">×</button></span>`).join('');
      $('distance-chips').querySelectorAll('[data-measure]').forEach(button=>button.addEventListener('click',()=>{measures[type].splice(Number(button.dataset.measure),1);if(type==='distance')state.pairs[run.id]=measures.distance;renderDistances();}));
    }else{
      type='distance';unit='Å';$('geometry-type').value='distance';$('geometry-type').disabled=true;$('geometry-preview-note').hidden=true;$('geometry-preview-note').textContent='';
      const cv=run.colvars;if(!state.colvars[run.id])state.colvars[run.id]=cv.columns.slice(0,2).map(c=>c.id);
      const name=id=>{const def=metadata(run).colvars?.find(c=>c.id===id);if(def&&run.xyz){const e=run.xyz.elements;return `${e[def.a]||'Átomo'} ${def.a} — ${e[def.b]||'átomo'} ${def.b}`;}return `Colvar ${id}`;};
      $('colvar-controls').innerHTML=cv.columns.map(c=>`<label><input type="checkbox" data-colvar="${c.id}" ${state.colvars[run.id].includes(c.id)?'checked':''}>${esc(name(c.id))}</label>`).join('');
      $('colvar-controls').querySelectorAll('[data-colvar]').forEach(c=>c.addEventListener('change',()=>{state.colvars[run.id]=[...$('colvar-controls').querySelectorAll('input:checked')].map(x=>Number(x.dataset.colvar));renderDistances();}));
      series=cv.columns.filter(c=>state.colvars[run.id].includes(c.id)).map((c,i)=>({name:name(c.id),color:colors[i%colors.length],dash:patterns[i%patterns.length],points:cv.rows.map(r=>({x:r.time,y:r.values[c.id],segment:r.segment}))}));
    }
    if(fromXYZ)$('geometry-type').disabled=false;
    state.distanceSeries=series;state.geometrySeries=series;const title=fromXYZ?(type==='distance'?'Distâncias entre átomos':type==='angle'?'Ângulos entre átomos':'Diedros assinados'):'Distâncias de Colvars';$('distance-chart-title').textContent=title;$('distance-chart-unit-note').textContent=fromXYZ?(type==='distance'?'Coordenadas em Å':'Graus; lacunas preservam a periodicidade'):'Coordenadas em Å';
    new ScientificChart($('distance-chart'),{title,series,yLabel:type==='distance'?'Distância (Å)':type==='angle'?'Ângulo (°)':'Diedro (°)',yUnit:unit,xLabel:timed?'Tempo (fs)':'Quadro (sem tempo físico)',xUnit:timed?'fs':'quadro'});
    $('distance-stats').innerHTML=series.map(s=>{const stat=R.stats(s.points.map(p=>({value:p.y})),'value');return stat?`<div class="stat" style="--run-color:${s.color}"><span class="stat-name">${esc(s.name)}</span><strong>${num(stat.min,4)}–${num(stat.max,4)} ${unit}</strong><p>Faixa nos quadros carregados</p></div>`:'';}).join('');
  }
  function geometrySelection(type){return [Number($('atom-a').value),Number($('atom-b').value),Number($('atom-c').value),Number($('atom-d').value)].slice(0,type==='distance'?2:type==='angle'?3:4);}
  function addGeometryMeasure(run,type,indices){
    const measures=ensureGeometryMeasures(run),needed=type==='distance'?2:type==='angle'?3:4;
    if(indices.length!==needed||indices.some(i=>!Number.isInteger(i)||i<0||i>=run.xyz.elements.length)||new Set(indices).size!==indices.length){message(`Escolha ${needed} átomos diferentes para ${type==='distance'?'a distância':type==='angle'?'o ângulo':'o diedro'}.`);return false;}
    const same=(a,b)=>type==='distance'?(a[0]===b[0]&&a[1]===b[1])||(a[0]===b[1]&&a[1]===b[0]):a.every((value,index)=>value===b[index]);
    if(measures[type].some(existing=>same(existing,indices))){message('Essa medida já está no gráfico.');return false;}
    if(measures[type].length>=6){message('Mostre até seis medidas por vez para manter o gráfico legível.');return false;}
    measures[type].push(indices);if(type==='distance')state.pairs[run.id]=measures.distance;return true;
  }
  function download(name,content){const blob=new Blob(['\uFEFF'+content],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  const csvText=rows=>rows.map(row=>row.map(v=>typeof v==='string'?`"${(/^[=+@-]/.test(v)?"'"+v:v).replace(/"/g,'""')}"`:v??'').join(';')).join('\r\n');
  function exportEnergy(){const rows=[['simulacao','origem','passo','tempo_fs','trecho','K_Eh','U_Eh','E_Eh','T_K','quantidade_conservada_Eh']];for(const r of visible())for(const p of energy(r)?.rows||[])rows.push([r.label,r.reference?'referencia':'upload',p.step,p.time,p.segment,p.kinetic,p.potential,p.total,p.temperature,p.conserved]);download('energias-dados-originais.csv',csvText(rows));message('CSV exportado com valores originais em Hartree, tempo em fs e temperatura em K. As transformações visuais não alteram os dados.',true);}
  function exportDistance(){const run=currentDistance();if(!run)return;const fromXYZ=$('distance-source').value==='xyz',type=fromXYZ?geometryType():'distance',timed=!fromXYZ||run.xyz.frames.every(f=>f.time!==null),valueHeader=type==='distance'?'distancia_A':type==='angle'?'angulo_graus':'diedro_graus',rows=[['simulacao','medida',timed?'tempo_fs':'quadro','trecho',valueHeader]];for(const s of state.geometrySeries)for(const p of s.points)rows.push([run.label,s.name,p.x,p.segment,p.y]);download(type==='distance'?'geometria-distancias.csv':type==='angle'?'geometria-angulos.csv':'geometria-diedros.csv',csvText(rows));}

  $('upload-button').addEventListener('click',()=>$('file-input').click());$('file-input').addEventListener('change',e=>importFiles([...e.target.files]));
  for(const event of ['dragenter','dragover'])$('drop-zone').addEventListener(event,e=>{e.preventDefault();$('drop-zone').classList.add('drag');});
  for(const event of ['dragleave','drop'])$('drop-zone').addEventListener(event,e=>{e.preventDefault();$('drop-zone').classList.remove('drag');});
  $('drop-zone').addEventListener('drop',e=>importFiles([...e.dataTransfer.files]));
  $('example-button').addEventListener('click',()=>loadExample($('example-select').value));
  $('example-energy-button').addEventListener('click',()=>loadExample($('example-select').value,'energy'));
  $('example-retry').addEventListener('click',()=>{const retry=state.exampleRetry;if(retry)loadExample(retry.key,retry.preferredTab);});
  $('clear-button').addEventListener('click',()=>{cancelExampleLoad();stop();clearContactShapes();state.runs=[];state.viewRun=null;state.pairs={};state.geometryMeasures={};state.colvars={};state.geometrySeries=[];renderAll();message('Sessão limpa. Seus arquivos originais continuam intactos.',true);});
  document.querySelectorAll('[data-tab]').forEach(b=>{b.addEventListener('click',()=>changeTab(b.dataset.tab));b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const names=['trajectory','energy','distance'],i=names.indexOf(state.tab),next=names[(i+(e.key==='ArrowRight'?1:2))%3];changeTab(next);$('tab-'+next).focus();});});
  for(const id of ['energy-mode','energy-unit','time-unit','energy-window-from','energy-window-to'])$(id).addEventListener('change',renderEnergy);
  $('energy-window-full').addEventListener('click',()=>{$('energy-window-from').value='';$('energy-window-to').value='';renderEnergy();});$('energy-first-window').addEventListener('click',()=>{$('energy-window-from').value='0';$('energy-window-to').value='75';renderEnergy();});
  document.querySelectorAll('[name="energy-series"]').forEach(c=>c.addEventListener('change',renderEnergy));
  $('trajectory-run').addEventListener('change',()=>{stop();renderTrajectory();});$('reset-view').addEventListener('click',resetView);for(const id of ['atom-labels','proximity-lines','hydrogen-bonds','coordination-contacts'])$(id).addEventListener('change',()=>{drawFrame();renderContactLegend(currentTrajectory());});$('coordination-cutoff').addEventListener('input',()=>drawFrame());
  $('rotate-molecule').addEventListener('click',()=>setInteraction('rotate'));$('pan-molecule').addEventListener('click',()=>setInteraction('pan'));
  $('highlight-kind').addEventListener('change',highlightMode);
  $('highlight-atom').addEventListener('change',()=>{state.selectedAtom=Number($('highlight-atom').value);renderAtomInfo();});
  $('highlight-add').addEventListener('click',addHighlight);
  $('highlight-indices').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();addHighlight();}});
  $('highlight-clear').addEventListener('click',()=>{const run=currentTrajectory();if(!run)return;stop();run.highlights=[];$('highlight-status').textContent='Destaques removidos. Cores originais restauradas.';renderHighlights(run);renderContactLegend(run);drawFrame();});
  $('highlight-proton').addEventListener('click',()=>{const run=currentTrajectory();if(!sharedProtonExample(run))return;$('highlight-kind').value='atom';$('highlight-atom').value='2';$('highlight-color').value='#e6007e';addHighlight();});
  for(const id of ['highlight-size','highlight-muted'])$(id).addEventListener('change',()=>{const run=currentTrajectory();if(!run)return;const size=Number($('highlight-size').value);run.highlightSettings={size:[1,1.6,2.1].includes(size)?size:1.6,muted:$('highlight-muted').checked};renderContactLegend(run);drawFrame();});
  $('highlight-toggle').addEventListener('click',()=>{const panel=$('highlight-tools');panel.open=!panel.open;if(panel.open)$('highlight-kind').focus();});
  $('highlight-tools').addEventListener('toggle',()=>{$('highlight-toggle').setAttribute('aria-expanded',String($('highlight-tools').open));if($('expand-trajectory').getAttribute('aria-expanded')==='true')requestAnimationFrame(resizeTrajectory);});
  $('molecule').addEventListener('mousedown',event=>startPan(event),true);$('molecule').addEventListener('touchstart',event=>startPan(event,true),{capture:true,passive:true});
  $('molecule').addEventListener('keydown',panWithKeyboard);
  window.addEventListener('mousemove',event=>movePan(event),{capture:true,passive:false});window.addEventListener('touchmove',event=>movePan(event,true),{capture:true,passive:false});
  for(const event of ['mouseup','touchend','touchcancel','blur'])window.addEventListener(event,()=>{state.panGesture=null;});
  $('expand-trajectory').addEventListener('click',()=>expandTrajectory($('expand-trajectory').getAttribute('aria-expanded')!=='true'));
  for(const id of ['trajectory-energy-mode','trajectory-temperature-mode'])$(id).addEventListener('change',()=>{const run=currentTrajectory();if(run?.xyz)renderTrajectoryChart(run);});
  for(const key of ['kinetic','potential','total'])$('trajectory-show-'+key).addEventListener('change',()=>{const run=currentTrajectory();if(run?.xyz)renderTrajectoryChart(run);});
  document.addEventListener('keydown',expandedKeys);
  $('frame-slider').addEventListener('input',()=>seekFrame(Number($('frame-slider').value)));$('play-button').addEventListener('click',play);
  for(const id of ['playback-duration','playback-speed'])$(id).addEventListener('change',updatePlaybackSettings);
  $('previous-frame').addEventListener('click',()=>seekFrame(state.frame-1));$('next-frame').addEventListener('click',()=>seekFrame(state.frame+1));
  $('frame-number').addEventListener('change',()=>seekFrame($('frame-number').valueAsNumber-1));$('frame-number').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();seekFrame($('frame-number').valueAsNumber-1);}});
  $('goto-distances').addEventListener('click',()=>{const run=currentTrajectory();if(run)$('distance-run').value=run.id;changeTab('distance');});
  $('distance-run').addEventListener('change',()=>renderDistances(true));$('distance-source').addEventListener('change',()=>renderDistances(true));$('geometry-type').addEventListener('change',()=>renderDistances());
  $('add-distance').addEventListener('click',()=>{const run=currentDistance();if(!run?.xyz)return;const type=geometryType(),indices=geometrySelection(type);if(addGeometryMeasure(run,type,indices)){renderDistances();message(`${type==='distance'?'Distância':type==='angle'?'Ângulo':'Diedro'} calculado a partir dos quadros XYZ.`,true);}});
  $('ethanol-preset').addEventListener('click',()=>{const run=currentDistance();if(!run?.xyz||!G.isEthanolSkeleton(run.xyz.elements,run.xyz.frames[0].coords))return;$('geometry-type').value='dihedral';renderDistances();for(const [id,value] of [['atom-a',0],['atom-b',1],['atom-c',2],['atom-d',8]])$(id).value=String(value);if(addGeometryMeasure(run,'dihedral',[0,1,2,8])){renderDistances();message('Preset Etanol C0–C1–O2–H8 adicionado. O diedro é assinado em graus.',true);}});
  $('export-energy').addEventListener('click',exportEnergy);$('export-distance').addEventListener('click',exportDistance);
  $('help-button').addEventListener('click',()=>$('help-dialog').showModal());for(const id of ['close-help','help-done'])$(id).addEventListener('click',()=>$('help-dialog').close());
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(state.tab==='energy'&&state.runs.length)renderEnergy();else if(state.tab==='distance'&&state.runs.length)renderDistances();if(state.tab==='trajectory')resizeTrajectory();else state.viewer?.resize();},150);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  const query=new URLSearchParams(location.search),requested=query.get('exemplo')||'water',requestedTab=new Map([['energias','energy'],['trajetoria','trajectory'],['distancias','distance'],['geometria','distance']]).get(query.get('aba'));if(requestedTab)state.tab=requestedTab;if(requested&&window.AIMD_EXAMPLES?.presets[requested]){$('example-select').value=requested;loadExample(requested,requestedTab);}
})();
