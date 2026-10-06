/* Build the offline teaching examples from the retained, unmodified ORCA files. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),R=require('../visualizador/orca-parser.js');
const {buildSequence}=require('./build_viewer_sequence.cjs');
const specs=[
 ['zn_en_1bar','04d · en sem assistência · 1 bar · 5 ps','14-zn-en-pressao','zn_en_1bar_5ps'],
 ['zn_en_1000bar','04d · en sem assistência · 1000 bar · 5 ps','14-zn-en-pressao','zn_en_1000bar_5ps'],
 ['zn_en_4000bar','04d · en sem assistência · 4000 bar · 5 ps','14-zn-en-pressao','zn_en_4000bar_5ps'],
 ['zn_cell_spring10','C1 · Parede fixa · Spring 10','13-cell-pressao'],
 ['zn_cell_spring50','C1 · Parede fixa · Spring 50','13-cell-pressao'],
 ['zn_cell_1bar','C2 · Cela elástica · alvo 1 bar','13-cell-pressao'],
 ['zn_cell_1000bar','C2 · Cela elástica · alvo 1000 bar','13-cell-pressao'],
 ['zn_cell_fixed','C3 · Continuação com parede fixa','13-cell-pressao'],
 ['zn_cell_none','C3 · Continuação sem parede','13-cell-pressao'],
 ['proton_shared_10ps','H₅O₂⁺ · próton compartilhado · 10 ps','10-proton-compartilhado'],
 ['proton_shared','H₅O₂⁺ · próton compartilhado · 2 ps','10-proton-compartilhado'],
 ['chelation','Zn–en · aproximação assistida → quelato · 3 ps','11-formacao-quelato'],
 ['chelation_continuous','04c · Referência independente · primeiro N assistido → segundo N livre','11-formacao-quelato'],
 ['proton_droplet_300k','Gota protonada · 300 K · controle','12-gota-protonada'],
 ['proton_droplet_400k','Gota protonada · rampa até 400 K','12-gota-protonada'],
 ['proton_droplet_500k','Gota protonada · rampa até 500 K','12-gota-protonada'],
 ['proton_droplet_600k','Gota protonada · rampa até 600 K','12-gota-protonada'],
 ['al_agua_nh3_dt05','Al³⁺ + águas + NH₃ · 0,5 fs','9-aluminio-amonia'],
 ['al_agua_nh3_scc','Al³⁺ + águas + NH₃ · 1 fs','9-aluminio-amonia'],
 ['dimero_xtb2_5ps','Dímero de água · XTB2 · 5 ps','1-agua-dft'],
 ['dimero_xtb2_2ps','Dímero de água · XTB2 · 2 ps','1-agua-dft'],
 ['dimero_b97','Dímero de água · DFT','1-agua-dft'],
 ['dimero_b97_cpcm','Dímero de água · DFT/CPCM','2-solvente-implicito'],
 ['agua_dft','01a · Água isolada · DFT · 20 fs','1-agua-dft'],
 ['agua_xtb2_nve','Água · XTB2 · sem termostato (NVE) · 500 fs','1-agua-dft'],
 ['agua_xtb2_csvr','Água · XTB2 · CSVR a 300 K · 500 fs','1-agua-dft'],
 ['agua_cpcm','Água · CPCM','2-solvente-implicito'],
 ['etanol_nve_5ps','Etanol · 0,5 fs · NVE · 5 ps','3-xtb2-etanol'],
 ['etanol_nve','Etanol · 0,5 fs · NVE','3-xtb2-etanol'],
 ['etanol_dt025','Etanol · 0,25 fs','4-timestep'],
 ['etanol_dt200','Etanol · 2 fs','4-timestep'],
 ['etanol_dt500','Etanol · 5 fs · FALHOU','4-timestep'],
 ['etanol_instavel','Etanol · 2,5 fs · instabilidade gradual','4-timestep'],
 ['etanol_corrigido','Etanol · 0,5 fs · corrigido','4-timestep'],
 ['etanol_csvr','Etanol · CSVR · NVT','5-termostato'],
 ['etanol_etapas','Etanol · aquecer e resfriar · 5 ps','5-termostato'],
 ['zn_parede','Histórico · Zn–en · com parede','7-dinamica-complexo'],
 ['zn_sem_parede','Histórico · Zn–en · sem parede','7-dinamica-complexo'],
 ['zn_parede_longo','Histórico · Zn–en · com parede · 2 ps','7-dinamica-complexo'],
 ['zn_sem_parede_longo','Histórico · Zn–en · sem parede · 2 ps','7-dinamica-complexo'],
 ['controle_dt025_31A','Zn + águas + en · hidratação · 250 fs','7-dinamica-complexo'],
 ['hidratacao_associacao_31A','Zn + águas + en · encontro · 5 ps','7-dinamica-complexo'],
 ['agua_c60','H₂O@C₆₀ · 1 ps','8-agua-no-fulereno'],
 ['zn_solvator','Histórico · SOLVATOR · 6 águas','6-complexo-solvator'],
 ['zn_solvator_2aguas','Histórico · SOLVATOR · 2 águas adicionadas','6-complexo-solvator'],
 ['preparar_complexo','Histórico · Complexo · antes do SOLVATOR','6-complexo-solvator']
];
const newHydrationKeys=['zn_h2o_sem_parede','zn_h2o_spring10','zn_h2o_spring50','zn_h2o_spring200'];
const newHydrationLabels=['04b · Zn²⁺ + 20 águas · sem parede','04b · Zn²⁺ + 20 águas · Spring 10','04b · Zn²⁺ + 20 águas · Spring 50','04b · Zn²⁺ + 20 águas · Spring 200'];
const solvatorNewFolder=path.join(root,'exercicios/6-complexo-solvator/resultados/zn_ion_20h2o_solvator');
if(['zn_ion_20h2o_solvator.out','zn_ion_20h2o_solvator.solvator.xyz'].every(file=>fs.existsSync(path.join(solvatorNewFolder,file))))specs.push(['zn_ion_20h2o_solvator','04a · SOLVATOR bruto · 20 águas · 61 átomos','6-complexo-solvator']);
newHydrationKeys.forEach((key,index)=>{
 const folder=path.join(root,'exercicios/7-dinamica-complexo/resultados',key);
 if([`${key}.out`,`${key}-md-ener.csv`,`${key}-traj.xyz`].every(file=>fs.existsSync(path.join(folder,file)))&&R.parseFile(fs.readFileSync(path.join(folder,`${key}.out`),'utf8'),`${key}.out`).metadata.normal===true)specs.push([key,newHydrationLabels[index],'7-dinamica-complexo']);
});
const runs={};
for(const [key,label,lesson,basename=key] of specs){
 const folder=`exercicios/${lesson}/resultados/${basename}`,run={key,label,reference:true,files:[],warnings:[]};
 const courseFile=path.join(root,folder,'curso.json'),course=fs.existsSync(courseFile)?JSON.parse(fs.readFileSync(courseFile,'utf8')):null;
 if(key==='chelation_continuous'&&!course?.sequenceSources)throw new Error('Missing verified chelation sequence sources.');
 if(course?.sequenceSources){const assembled=buildSequence(path.join(root,folder),key,course);run.xyz=assembled.xyz;run.energy=assembled.energy;run.warnings.push(...assembled.warnings);run.files.push(...assembled.files.map(file=>({name:path.basename(file.relative),path:path.posix.normalize(`${folder}/${file.relative}`),kind:file.kind})));}
 if(['proton_shared_10ps','dimero_xtb2_5ps','etanol_nve_5ps'].includes(key))for(const file of [`${key}-md-ener.csv`,`${key}-traj.xyz`,'curso.json']){
  if(!fs.existsSync(path.join(root,folder,file)))throw new Error(`Missing verified extended source: ${folder}/${file}`);
 }
 const files=course?.sequenceSources?[]:[`${basename}.out`,`${basename}-md-ener.csv`,`${basename}-traj.xyz`,`${basename}-colvars.csv`];
 if(['zn_solvator','zn_solvator_2aguas','zn_ion_20h2o_solvator'].includes(key))files.push(`${key}.solvator.xyz`);
 if(key==='preparar_complexo')files.push('preparar_complexo.xyz');
 for(const file of files){const rel=`${folder}/${file}`,full=path.join(root,rel);if(!fs.existsSync(full))continue;
  const parsed=R.parseFile(fs.readFileSync(full,'utf8'),file),slot=parsed.kind==='energy'?'energy':parsed.kind;
  // Comments remain in the original linked XYZ, not duplicated in every bundled frame.
  if(parsed.frames){
   parsed.frames.forEach(f=>delete f.comment);
   // Keep all 10,001 frames of each 97-atom 04d pressure case, and all
   // original frames of the separate historical 43-atom Cell comparisons.
   // Keep motion-critical wall comparisons complete. Thinning their frames
   // makes the contraction and water response visibly step between samples.
   // Keep the small ethanol molecule complete so geometric extrema and the
   // fast O-H vibration are not aliased by the teaching reference preview.
   const completeWall=key.startsWith('zn_en_')||key.startsWith('zn_h2o_')||key.startsWith('zn_cell_')||/^zn_(?:sem_)?parede(?:_longo)?$/.test(key);
   const stride=completeWall||['proton_shared_10ps','proton_shared','dimero_xtb2_5ps','etanol_nve_5ps','etanol_etapas','dimero_xtb2_2ps','al_agua_nh3_dt05','al_agua_nh3_scc'].includes(key)?1:Math.ceil(parsed.frames.length/1001);
   if(stride>1){const all=parsed.frames;parsed.previewStride=stride;parsed.originalFrameCount=all.length;parsed.frames=all.filter((f,i)=>i%stride===0||i===all.length-1);parsed.warnings.push(`Prévia da referência: 1 a cada ${stride} quadros, mais o último. Baixe/carregue o XYZ original para examinar todos. Tempos e coordenadas preservados, sem interpolação.`);}
  }
  run[slot]=parsed;run.files.push({name:file,path:rel,kind:parsed.kind});
 }
 if(newHydrationKeys.includes(key)||key==='zn_ion_20h2o_solvator'){
  if(run.out?.metadata?.normal!==true)throw new Error(key+': new reference did not terminate normally.');
  if(run.xyz?.elements.length!==61||run.xyz.elements[0]!=='Zn'||run.xyz.elements.includes('N'))throw new Error(key+': expected Zn + 20 waters, without en.');
 }
 if(['zn_en_1bar','zn_en_1000bar','zn_en_4000bar'].includes(key)){
  if(run.out?.metadata?.normal!==true)throw new Error(key+': pressure reference did not terminate normally.');
  if(run.xyz?.elements.length!==97||run.xyz.frames.length!==10001||run.xyz.elements.filter(e=>e==='N').length!==6)throw new Error(key+': expected the complete 97-atom pressure trajectory.');
 }
 // Joined trajectories have verified stage metadata, not a fabricated whole-run .out.
 if(course){
  run.metadata=course.metadata;run.warnings.push(...(course.warnings||[]));
  // A joined file retains per-stage conserved-energy references. Break charts at
  // the documented boundaries without shifting any measured value or timestamp.
  const breaks=course.energyBreaksAfterFs||[];
  if(run.energy&&breaks.length&&!course.sequenceSources){run.energy.rows.forEach(row=>row.segment+=breaks.filter(t=>row.time>t).length);run.energy.warnings.push('Gráficos separados nas fronteiras documentadas de restart/Run; valores e tempos originais preservados.');}
  for(const relative of course.relatedFiles||[]){const rel=path.posix.normalize(`${folder}/${relative}`);if(!fs.existsSync(path.join(root,rel)))throw new Error(`Missing course source: ${rel}`);if(!run.files.some(file=>file.path===rel))run.files.push({name:path.basename(rel),path:rel,kind:'stage-output'});}
  run.files.push({name:'curso.json',path:`${folder}/curso.json`,kind:'course-metadata'});
 }
 const issue=R.validateEnergySources(run.energy,run.out);if(issue)throw new Error(key+': '+issue);
 runs[key]=run;
}
// A verified starting structure is useful before a SOLVATOR result exists.
// It must never be labelled as the output of the unexecuted 20-water assembly.
const isolatedRelative='exercicios/6-complexo-solvator/estruturas/zn2_isolado.xyz';
const isolated=R.parseXYZ(fs.readFileSync(path.join(root,isolatedRelative),'utf8'),'zn2_isolado.xyz');
if(isolated.elements.length!==1||isolated.elements[0]!=='Zn'||isolated.frames.length!==1)throw new Error('Expected exactly one static Zn atom in the new starting structure.');
runs.zn2_isolado={key:'zn2_isolado',label:'04a · Zn²⁺ isolado · estrutura inicial · 1 átomo',reference:true,xyz:isolated,files:[{name:'zn2_isolado.xyz',path:isolatedRelative,kind:'xyz'}],warnings:['Somente a estrutura inicial do íon. A montagem SOLVATOR e a preparação radial estão disponíveis como estruturas separadas neste exemplo.'],metadata:{charge:2,multiplicity:1}};
const preparedRelative='exercicios/6-complexo-solvator/estruturas/zn_20h2o_inicial.xyz';
if(fs.existsSync(path.join(root,preparedRelative))){
 const prepared=R.parseXYZ(fs.readFileSync(path.join(root,preparedRelative),'utf8'),'zn_20h2o_inicial.xyz');
 if(prepared.elements.length!==61||prepared.elements[0]!=='Zn'||prepared.elements.includes('N')||prepared.frames.length!==1)throw new Error('Expected one prepared 61-atom Zn-water structure.');
 runs.zn_20h2o_inicial={key:'zn_20h2o_inicial',label:'04a → 04b · Preparação radial +0,8 Å por água · 61 átomos',reference:true,xyz:prepared,files:[{name:'zn_20h2o_inicial.xyz',path:preparedRelative,kind:'xyz'}],warnings:['Preparação didática: translação rígida de cada água +0,8 Å na direção Zn→O; geometria interna preservada. Não é a saída bruta do SOLVATOR nem uma trajetória de MD.'],metadata:{charge:2,multiplicity:1}};
}
const presets={
 zn_pressure:{runs:['zn_en_1bar','zn_en_1000bar','zn_en_4000bar'],tab:'trajectory'},
 zn_solvation:{runs:['zn2_isolado'],tab:'trajectory',preparationNote:true,loadMessage:'Estrutura inicial de Zn²⁺ carregada: um átomo, sem águas nem en. Execute SOLVATOR para obter a montagem de 20 águas. Não há dinâmica nem série de energia neste arquivo.',label:'04a · Zn²⁺ isolado + 20 águas: SOLVATOR',message:'A nova montagem parte somente do Zn²⁺ e acrescenta 20 águas, sem en. O input está disponível na atividade; ainda não há resultado pronto dessa montagem no laboratório. Execute um cálculo por vez e carregue a saída .out e a geometria .solvator.xyz. O histórico antigo usa um complexo já formado e não substitui este resultado.'},
 zn_hydration:{runs:[],tab:'trajectory',awaitingResults:true,label:'04b · Hidratação sem en e paredes',message:'Use o Zn²⁺ + 20 águas (61 átomos), sem en, produzido em 04a. Compare sem parede e com Spring 10, 50 e 200, mantendo o mesmo raio e as mesmas condições iniciais. Ainda não há trajetórias prontas desses novos controles. Execute um cálculo por vez e carregue .out, -md-ener.csv e -traj.xyz. Spring 200 continua sendo uma parede finita.'},
 cell_rigidity:{runs:['zn_cell_spring10','zn_cell_spring50'],tab:'trajectory'},
 cell_pressure:{runs:['zn_cell_1000bar','zn_cell_1bar'],tab:'trajectory'},
 cell_release:{runs:['zn_cell_fixed','zn_cell_none'],tab:'trajectory'},
 proton_shared:{runs:['proton_shared_10ps'],tab:'trajectory'},
 proton_shared_short:{runs:['proton_shared'],tab:'trajectory'},
 chelation:{runs:['chelation_continuous'],tab:'trajectory'},chelation_previous:{runs:['chelation'],tab:'trajectory'},
 proton_droplet:{runs:['proton_droplet_300k'],tab:'trajectory'},
 proton_droplet_400k:{runs:['proton_droplet_400k'],tab:'trajectory'},
 proton_droplet_500k:{runs:['proton_droplet_500k'],tab:'trajectory'},
 proton_droplet_600k:{runs:['proton_droplet_600k'],tab:'trajectory'},
 aluminum:{runs:['al_agua_nh3_dt05','al_agua_nh3_scc'],tab:'trajectory'},
 water:{runs:['dimero_xtb2_5ps']},water_short:{runs:['dimero_xtb2_2ps']},water_dft:{runs:['dimero_b97']},solvent:{runs:['dimero_b97','dimero_b97_cpcm']},ethanol:{runs:['etanol_nve_5ps']},ethanol_short:{runs:['etanol_nve']},
 water_single:{runs:['agua_dft']},solvent_single:{runs:['agua_dft','agua_cpcm']},
 water_thermostat:{runs:['agua_xtb2_nve','agua_xtb2_csvr']},water_nve:{runs:['agua_xtb2_nve']},water_csvr:{runs:['agua_xtb2_csvr']},
 timestep:{runs:['etanol_instavel','etanol_corrigido']},timestep_abrupt:{runs:['etanol_dt500','etanol_corrigido']},timestep_accuracy:{runs:['etanol_dt025','etanol_nve','etanol_dt200']},thermostat:{runs:['etanol_etapas']},thermostat_compare:{runs:['etanol_nve','etanol_csvr']},
 solvator:{runs:['zn_solvator','preparar_complexo'],tab:'trajectory'},complex:{runs:['zn_parede_longo','zn_sem_parede_longo']},
 solvator_two:{runs:['zn_solvator_2aguas','preparar_complexo'],tab:'trajectory'},
 complex_short:{runs:['zn_parede','zn_sem_parede']},hydration:{runs:['controle_dt025_31A'],tab:'trajectory'},hydration_long:{runs:['hidratacao_associacao_31A'],tab:'trajectory'},fullerene:{runs:['agua_c60'],tab:'trajectory'}
};
if(runs.zn_ion_20h2o_solvator){
 presets.zn_solvation={runs:['zn2_isolado','zn_ion_20h2o_solvator',...(runs.zn_20h2o_inicial?['zn_20h2o_inicial']:[])],tab:'trajectory',loadMessage:'Zn²⁺ isolado, montagem SOLVATOR bruta e preparação radial declarada carregados como estruturas separadas. Não há trajetória de MD nem série de energia neste exemplo. Alterne o campo Simulação para conferir cada geometria.'};
}
if(newHydrationKeys.every(key=>runs[key]))presets.zn_hydration={runs:newHydrationKeys,tab:'trajectory'};
// Every exercise input has its own contextual launch, including retained
// diagnostics and static preparation stages. No calculation is synthesized.
const resources=JSON.parse(fs.readFileSync(path.join(root,'exercicios/arquivos-exercicios.json'),'utf8'));
for(const spec of resources.newRuns){
 const key=spec.runkey,run={key,label:spec.label||key.replaceAll('_',' '),reference:true,files:[],warnings:[]};
 for(const [field,slot] of [['out','out'],['energy_csv','energy'],['xyz','xyz'],['colvars','colvars']]){
  const rel=spec[field];if(!rel)continue;
  const parsed=R.parseFile(fs.readFileSync(path.join(root,rel),'utf8'),path.basename(rel));
  if(parsed.kind!==slot)throw new Error(`${key}: expected ${slot}, got ${parsed.kind}`);
  if(parsed.frames)parsed.frames.forEach(frame=>delete frame.comment);
  run[slot]=parsed;run.files.push({name:path.basename(rel),path:rel,kind:slot});
 }
 if(spec.normal!==undefined&&run.out?.metadata.normal!==spec.normal)throw new Error(`${key}: termination mismatch`);
 if(spec.frames!==undefined&&run.xyz?.frames.length!==spec.frames)throw new Error(`${key}: frame mismatch`);
 if(spec.type==='static_structure'&&run.xyz?.frames.length!==1)throw new Error(`${key}: expected a single static geometry`);
 if(spec.state==='partial_interrupted_md'){run.label+=' · PARCIAL, até 9864 fs';run.warnings.push('Execução interrompida. O nome 10000fs descreve o alvo; a trajetória retida termina em 9864 fs. A sequência de formação do quelato usa somente até 7083 fs deste arquivo.');}
 if(spec.state==='failed_scc_zero_md_steps')run.warnings.push('Falha SCC antes da dinâmica: zero passos MD. Esta é somente a estrutura inicial, acompanhada do output da falha.');
 if(key==='encontro_real_R1_inicial'){run.metadata={staticSourceTime:true};run.warnings.push('Geometria extraída da referência anterior aos 7083 fs. Esse é o tempo da referência de origem; os controles preparados não têm tempo simulado.');}
 if(spec.type==='static_structure'&&run.out?.rows?.length)throw new Error(`${key}: unexpected MD data in static reference`);
 const issue=R.validateEnergySources(run.energy,run.out);if(issue)throw new Error(`${key}: ${issue}`);
 runs[key]=run;
}
Object.assign(presets,resources.presets);
for(const [key,preset] of Object.entries(resources.presets))for(const runkey of preset.runs)if(!runs[runkey])throw new Error(`${key}: missing reference ${runkey}`);
for(const [input,item] of Object.entries(resources.inputs)){
 const preset=presets[item.preset];if(!preset)throw new Error(`Missing input preset: ${input}`);
 for(const runkey of preset.runs){
  const run=runs[runkey];
  for(const rel of [input,...item.structures,...item.dependencies])if(!run.files.some(file=>file.path===rel)){
   if(!fs.existsSync(path.join(root,rel)))throw new Error(`Missing input file: ${rel}`);
   run.files.push({name:path.basename(rel),path:rel,kind:'input-dependency'});
  }
 }
}
// Ordinary scripts, rather than fetch(), preserve direct file:// use offline.
// The small manifest is loaded at startup; calculations are loaded on demand.
const version='20261006-inputs4',sources={},folder=path.join(root,'visualizador/examples');
fs.mkdirSync(folder,{recursive:true});let totalBytes=0;
for(const [key,run] of Object.entries(runs)){
 const filename=`${key}.js`,full=path.join(folder,filename);
 fs.writeFileSync(full,'/* Retained ORCA result; generated by scripts/build_viewer_examples.cjs. */\nwindow.AIMD_EXAMPLES.runs['+JSON.stringify(key)+'] = '+JSON.stringify(run)+';\n');
 sources[key]={label:run.label,src:`examples/${filename}?v=${version}`};totalBytes+=fs.statSync(full).size;
}
const manifest=path.join(root,'visualizador/examples.js');
fs.writeFileSync(manifest,'/* Real ORCA workshop results; generated by scripts/build_viewer_examples.cjs. */\nwindow.AIMD_EXAMPLES = '+JSON.stringify({version,presets,sources,runs:{}})+';\n');
console.log(`Offline examples: ${Object.keys(runs).length} calculations loaded on demand, ${fs.statSync(manifest).size} startup bytes, ${totalBytes} data bytes.`);
