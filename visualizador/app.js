(function(){
  'use strict';
  const R=OrcaReader,$=id=>document.getElementById(id),num=(n,p=5)=>chartNumber(n,p);
  const colors=['#006e66','#a35b00','#6853a6','#176ba0','#a54664','#55612b'];
  const referenceColors={agua_dft:colors[0],agua_cpcm:colors[1],etanol_dt025:colors[0],etanol_nve:colors[1],etanol_dt200:colors[2],etanol_csvr:colors[0],zn_parede:colors[0],zn_sem_parede:colors[1],zn_solvator:colors[0],preparar_complexo:colors[1]};
  const patterns=['','7 3','2 3','9 3 2 3','12 3','4 2 1 2','1 4','10 2 3 2','5 5','12 3 2 3 2 3','3 2','8 5'];
  const elementColors={H:'#d9e0e3',C:'#465563',N:'#386ea8',O:'#c45448',Zn:'#8b71a8',S:'#b99425',P:'#bc7538',Cl:'#5f9548',F:'#75a56f',Na:'#8675b8',Mg:'#7caa61',Fe:'#b57545',Cu:'#a66e4e'};
  const elementRadii={H:.23,C:.37,N:.35,O:.34,Zn:.53,S:.44,P:.44};
  const state={runs:[],nextId:1,tab:'energy',viewer:null,model:null,viewRun:null,frame:0,playing:false,timer:null,pairs:{},colvars:{},distanceSeries:[],busy:false};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const energy=run=>run.energy||run.out;
  const metadata=run=>run.out?.metadata||{};
  const ensemble=run=>run.ensembleOverride||metadata(run).ensemble||'unknown';
  const visible=()=>state.runs.filter(r=>r.visible);
  const timeFactor=()=>({fs:1,ps:1e-3,s:1e-15}[$('time-unit').value]);
  const energyFactor=()=>$('energy-unit').value==='eh'?1:R.HARTREE_TO_KJMOL;
  const energyUnit=()=>$('energy-unit').value==='eh'?'Eh':'kJ/mol';
  function message(text,info=false){$('message').textContent=text;$('message').classList.toggle('info',info);$('message').hidden=!text;}
  function stop(){state.playing=false;clearTimeout(state.timer);$('play-button').textContent='▶ Reproduzir';}
  function makeRun(key,label,reference=false){const id=state.nextId++;return {id,key,label:label||key,reference,visible:true,color:colors[(id-1)%colors.length],files:[],warnings:[]};}
  function addParsed(run,parsed){
    const slot=parsed.kind==='xyz'?'xyz':parsed.kind==='colvars'?'colvars':parsed.kind==='out'?'out':'energy';
    const issue=R.validateEnergySources(slot==='energy'?parsed:run.energy,slot==='out'?parsed:run.out);
    if(issue)throw new Error(issue);
    run[slot]=parsed;run.files.push({name:parsed.name,kind:parsed.kind});
  }
  async function importFiles(files){
    if(state.busy)return;state.busy=true;document.body.classList.add('busy');stop();message('Lendo os arquivos…',true);
    const warnings=[],groups=new Map();let accepted=0;
    for(const file of files){
      if(file.size>80*1024*1024){warnings.push(`${file.name}: limite de 80 MB por arquivo.`);continue;}
      try{const parsed=R.parseFile(await file.text(),file.name);warnings.push(...parsed.warnings.filter(w=>!w.startsWith('O .out pode')&&!w.startsWith('XYZ convencional')).map(w=>`${file.name}: ${w}`));if(!groups.has(parsed.key))groups.set(parsed.key,[]);groups.get(parsed.key).push(parsed);}
      catch(error){warnings.push(`${file.name}: ${error.message}`);}
    }
    for(const [key,parts] of groups){
      let run=state.runs.find(r=>!r.reference&&r.key===key&&!parts.some(p=>r[p.kind==='xyz'?'xyz':p.kind==='colvars'?'colvars':p.kind==='out'?'out':'energy']));
      if(!run){run=makeRun(key);const n=state.runs.filter(r=>r.key===key).length;if(n)run.label=`${key} (${n+1})`;state.runs.push(run);}
      for(const part of parts){try{addParsed(run,part);accepted++;}catch(error){const separate=makeRun(key,`${key} · ${part.kind==='out'?'.out':'CSV'} separado`);addParsed(separate,part);state.runs.push(separate);warnings.push(error.message);accepted++;}}
    }
    const selected=visible();if(selected.length>4){selected.slice(4).forEach(r=>r.visible=false);warnings.push('Quatro simulações selecionadas para comparação. Use as caixas para escolher outras.');}
    state.busy=false;document.body.classList.remove('busy');$('file-input').value='';
    renderAll();message([accepted?`${accepted} arquivo(s) carregado(s).`:'Nenhum arquivo foi carregado.',...warnings].join('\n'),warnings.length===0);
    if(accepted)$('workspace').scrollIntoView({block:'start',behavior:'smooth'});
  }
  function loadExample(key){
    const config=window.AIMD_EXAMPLES?.presets[key];if(!config){message('O pacote de exemplos não foi encontrado. Você pode carregar seus próprios arquivos.');return;}
    stop();state.runs=state.runs.filter(r=>!r.reference);state.runs.forEach(r=>r.visible=false);
    for(const sourceKey of config.runs){let run=state.runs.find(r=>r.exampleKey===sourceKey);if(!run){const src=structuredClone(AIMD_EXAMPLES.runs[sourceKey]);run=Object.assign(makeRun(sourceKey,src.label,true),src,{exampleKey:sourceKey,visible:true});run.color=referenceColors[sourceKey]||run.color;state.runs.push(run);}run.visible=true;}
    document.querySelectorAll('[name="energy-series"]').forEach(c=>c.checked=config.runs.length>1?c.value==='total':true);
    $('energy-mode').value='delta';$('time-unit').value='fs';state.tab=config.tab||'energy';renderAll();
    const current=visible()[0];if(current){$('trajectory-run').value=current.id;$('distance-run').value=current.id;}
    changeTab(state.tab);message('Exemplo de referência carregado. São dados reais calculados pelos ministrantes; não são uma execução feita por você.',true);
    $('workspace').scrollIntoView({block:'start',behavior:'smooth'});
  }
  function renderRuns(){
    $('runs').innerHTML=state.runs.map(r=>{const n=energy(r)?.rows.length||0;return `<div class="run-card" style="--run-color:${r.color}"><label><input type="checkbox" data-run="${r.id}" ${r.visible?'checked':''}><span><strong>${esc(r.label)}</strong><small>${r.reference?'Referência da aula':'Seu arquivo'} · ${n?n+' pontos':r.xyz?r.xyz.elements.length+' átomos':'sem série MD'}</small></span></label><button type="button" class="remove-run" data-remove="${r.id}" aria-label="Remover ${esc(r.label)}">×</button></div>`;}).join('');
    $('runs').querySelectorAll('[data-run]').forEach(c=>c.addEventListener('change',()=>{const r=state.runs.find(r=>r.id===Number(c.dataset.run));if(c.checked&&visible().length>=4){c.checked=false;message('Compare até quatro simulações por vez. Desmarque uma para escolher outra.');return;}r.visible=c.checked;renderEnergy();}));
    $('runs').querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{stop();state.runs=state.runs.filter(r=>r.id!==Number(b.dataset.remove));state.viewRun=null;renderAll();}));
  }
  function updateSelect(id,runs){const selected=$(id).value;$(id).replaceChildren();runs.forEach(r=>{const opt=document.createElement('option');opt.value=r.id;opt.textContent=r.label;$(id).append(opt);});if(runs.some(r=>String(r.id)===selected))$(id).value=selected;}
  function renderAll(){
    const loaded=state.runs.length>0;$('workspace').hidden=!loaded;$('welcome-guide').hidden=loaded;document.body.classList.toggle('loaded',loaded);if(!loaded){stop();return;}
    renderRuns();updateSelect('trajectory-run',state.runs.filter(r=>r.xyz));updateSelect('distance-run',state.runs.filter(r=>r.xyz||r.colvars));renderDetails();changeTab(state.tab);
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
    const question=known('etanol_dt200')?'Qual timestep conserva melhor a energia?':known('etanol_csvr')?'O que o termostato muda?':known('agua_cpcm')?'O solvente foi representado sem acrescentar átomos?':known('zn_parede')?'O que a parede muda nesta trajetória curta?':runs.length>1?'O que mudou entre as simulações?':'Para onde vai a energia?';
    const prompt=known('etanol_dt200')?'Os três casos cobrem o mesmo tempo físico. Compare a amplitude de E e o custo de usar um passo menor. Terminar normalmente é suficiente para escolher um timestep?':known('etanol_csvr')?'Ambas começam com velocidades inicializadas a 300 K. Compare T e E: qual caso pode trocar energia com um banho? A trajetória já demonstra equilíbrio?':known('agua_cpcm')?'Abra as duas trajetórias e conte os átomos. Depois confira CPCM no método, em “Arquivos e condições”. Uma diferença visual pequena não significa que o modelo não foi ativado.':known('zn_parede')?'Compare também as distâncias e a animação. A energia sozinha mostra se uma água se afastou? A parede garante que nunca haverá escape?':'Localize uma região da curva. A energia cinética aumenta quando a potencial diminui? Como a temperatura acompanha essa troca?';
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
  function renderTrajectory(){
    const run=currentTrajectory(),has=!!run?.xyz;$('trajectory-empty').hidden=has;$('trajectory-content').hidden=!has;
    if(!has){$('trajectory-empty').innerHTML='<strong>O movimento está no arquivo XYZ.</strong>Carregue nome-traj.xyz. O .out e o CSV de energias não contêm necessariamente as coordenadas de todos os passos.';return;}
    if(!window.$3Dmol){$('trajectory-empty').hidden=false;$('trajectory-empty').textContent='O visualizador molecular não foi carregado. Mantenha a pasta vendor junto ao aplicativo. As distâncias continuam disponíveis.';return;}
    try{if(!state.viewer){state.viewer=$3Dmol.createViewer($('molecule'),{backgroundColor:'white',orthographic:true,antialias:true});state.viewer.setProjection('orthographic');}
      if(state.viewRun!==run.id){state.frame=0;state.viewRun=run.id;$('frame-slider').value='0';state.viewer.removeAllModels();state.viewer.removeAllLabels();state.model=state.viewer.addModel();}
      $('frame-slider').max=run.xyz.frames.length-1;$('play-button').disabled=run.xyz.frames.length<2;
      $('molecule-legend').innerHTML=[...new Set(run.xyz.elements)].map(e=>`<span class="element-key"><i style="background:${elementColors[e]||'#8a8990'}"></i>${esc(e)}</span>`).join('');
      state.viewer.resize();drawFrame(true);
    }catch(error){$('trajectory-empty').hidden=false;$('trajectory-empty').textContent='Este navegador não conseguiu abrir a visualização 3D. Use um navegador com WebGL; gráficos e distâncias continuam disponíveis.';}
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
    state.viewer.removeAllLabels();
    if($('atom-labels').checked)atoms.forEach((a,i)=>state.viewer.addLabel(`${a.elem} ${i}`,{position:a,fontColor:'#17313e',backgroundColor:'white',backgroundOpacity:.7,fontSize:11,borderThickness:0,inFront:true}));
    state.viewer.setClickable({},true,atom=>{$('atom-info').textContent=`${atom.elem} · índice ${atom.serial}: x = ${num(atom.x,7)}, y = ${num(atom.y,7)}, z = ${num(atom.z,7)} Å.`;});
    if(fit){state.viewer.zoomTo();state.viewer.zoom(1.35);}state.viewer.render();
    $('frame-slider').value=state.frame;$('frame-time').textContent=`Quadro ${state.frame+1}/${xyz.frames.length}${frame.time!==null?' · '+num(frame.time,6)+' fs':' · tempo não informado'}`;
    const rows=energy(run)?.rows||[],row=frame.time===null?null:rows.find(r=>Math.abs(r.time-frame.time)<.051&&(frame.step===null||r.step===frame.step));
    $('frame-values').innerHTML=[['Tempo físico',frame.time===null?'Não informado':`${num(frame.time)} fs = ${num(frame.time*1e-15)} s`],['Temperatura',row?.temperature!==null&&row?.temperature!==undefined?`${num(row.temperature)} K`:'Sem ponto correspondente'],['Energia potencial',row?.potential!==null&&row?.potential!==undefined?`${num(row.potential,9)} Eh`:'Sem ponto correspondente'],['Átomos',xyz.elements.length]].map(([label,value])=>`<div class="frame-value"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('');
  }
  function play(){if(state.playing){stop();return;}const run=currentTrajectory();if(!run?.xyz||run.xyz.frames.length<2)return;state.playing=true;$('play-button').textContent='Ⅱ Pausar';const tick=()=>{if(!state.playing)return;state.frame=(state.frame+1)%run.xyz.frames.length;drawFrame();state.timer=setTimeout(tick,65);};tick();}
  function initialPairs(run){if(state.pairs[run.id])return;const els=run.xyz.elements,zn=els.indexOf('Zn'),ns=els.map((e,i)=>e==='N'?i:null).filter(x=>x!==null);state.pairs[run.id]=zn>=0&&ns.length?ns.slice(0,2).map(n=>[zn,n]):els.length>1?[[0,1]]:[];}
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
  $('clear-button').addEventListener('click',()=>{stop();state.runs=[];state.viewRun=null;state.pairs={};state.colvars={};renderAll();message('Sessão limpa. Seus arquivos originais continuam intactos.',true);});
  document.querySelectorAll('[data-tab]').forEach(b=>{b.addEventListener('click',()=>changeTab(b.dataset.tab));b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const names=['energy','trajectory','distance'],i=names.indexOf(state.tab),next=names[(i+(e.key==='ArrowRight'?1:2))%3];changeTab(next);$('tab-'+next).focus();});});
  for(const id of ['energy-mode','energy-unit','time-unit'])$(id).addEventListener('change',renderEnergy);
  document.querySelectorAll('[name="energy-series"]').forEach(c=>c.addEventListener('change',renderEnergy));
  $('trajectory-run').addEventListener('change',()=>{stop();renderTrajectory();});$('reset-view').addEventListener('click',()=>{state.viewer?.zoomTo();state.viewer?.zoom(1.35);state.viewer?.render();});for(const id of ['atom-labels','proximity-lines'])$(id).addEventListener('change',()=>drawFrame());
  $('frame-slider').addEventListener('input',()=>{stop();state.frame=Number($('frame-slider').value);drawFrame();});$('play-button').addEventListener('click',play);
  $('goto-distances').addEventListener('click',()=>{const run=currentTrajectory();if(run)$('distance-run').value=run.id;changeTab('distance');});
  $('distance-run').addEventListener('change',()=>renderDistances(true));$('distance-source').addEventListener('change',()=>renderDistances(true));
  $('add-distance').addEventListener('click',()=>{const run=currentDistance(),a=Number($('atom-a').value),b=Number($('atom-b').value);if(a===b){message('Escolha dois átomos diferentes.');return;}if(state.pairs[run.id].some(p=>p.includes(a)&&p.includes(b))){message('Essa distância já está no gráfico.');return;}if(state.pairs[run.id].length>=6){message('Mostre até seis distâncias por vez para manter o gráfico legível.');return;}state.pairs[run.id].push([a,b]);renderDistances();message('Distância calculada a partir dos quadros XYZ.',true);});
  $('export-energy').addEventListener('click',exportEnergy);$('export-distance').addEventListener('click',exportDistance);
  $('help-button').addEventListener('click',()=>$('help-dialog').showModal());for(const id of ['close-help','help-done'])$(id).addEventListener('click',()=>$('help-dialog').close());
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(state.tab==='energy'&&state.runs.length)renderEnergy();else if(state.tab==='distance'&&state.runs.length)renderDistances();state.viewer?.resize();},150);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  const requested=new URLSearchParams(location.search).get('exemplo');if(requested&&window.AIMD_EXAMPLES?.presets[requested]){$('example-select').value=requested;loadExample(requested);}
})();
