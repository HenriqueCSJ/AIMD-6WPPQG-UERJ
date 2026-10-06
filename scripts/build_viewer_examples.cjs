/* Build the offline teaching examples from the retained, unmodified ORCA files. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),R=require('../visualizador/orca-parser.js');
const {buildSequence}=require('./build_viewer_sequence.cjs');
const specs=[
 ['zn_cell_spring10','C1 · Parede fixa · Spring 10','13-cell-pressao'],
 ['zn_cell_spring50','C1 · Parede fixa · Spring 50','13-cell-pressao'],
 ['zn_cell_1bar','C2 · Cela elástica · alvo 1 bar','13-cell-pressao'],
 ['zn_cell_1000bar','C2 · Cela elástica · alvo 1000 bar','13-cell-pressao'],
 ['zn_cell_fixed','C3 · Continuação com parede fixa','13-cell-pressao'],
 ['zn_cell_none','C3 · Continuação sem parede','13-cell-pressao'],
 ['proton_shared_10ps','H₅O₂⁺ · próton compartilhado · 10 ps','10-proton-compartilhado'],
 ['proton_shared','H₅O₂⁺ · próton compartilhado · 2 ps','10-proton-compartilhado'],
 ['chelation','Zn–en · aproximação assistida → quelato · 3 ps','11-formacao-quelato'],
 ['chelation_continuous','Zn–en · hidratação e quelação','11-formacao-quelato'],
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
 ['zn_parede','Zn–en · com parede','7-dinamica-complexo'],
 ['zn_sem_parede','Zn–en · sem parede','7-dinamica-complexo'],
 ['zn_parede_longo','Zn–en · com parede · 2 ps','7-dinamica-complexo'],
 ['zn_sem_parede_longo','Zn–en · sem parede · 2 ps','7-dinamica-complexo'],
 ['controle_dt025_31A','Zn + águas + en · hidratação · 250 fs','7-dinamica-complexo'],
 ['hidratacao_associacao_31A','Zn + águas + en · encontro · 5 ps','7-dinamica-complexo'],
 ['agua_c60','H₂O@C₆₀ · 1 ps','8-agua-no-fulereno'],
 ['zn_solvator','SOLVATOR · 6 águas','6-complexo-solvator'],
 ['zn_solvator_2aguas','SOLVATOR · 2 águas adicionadas','6-complexo-solvator'],
 ['preparar_complexo','Complexo · antes do SOLVATOR','6-complexo-solvator']
];
const runs={};
for(const [key,label,lesson] of specs){
 const folder=`exercicios/${lesson}/resultados/${key}`,run={key,label,reference:true,files:[],warnings:[]};
 const courseFile=path.join(root,folder,'curso.json'),course=fs.existsSync(courseFile)?JSON.parse(fs.readFileSync(courseFile,'utf8')):null;
 if(key==='chelation_continuous'&&!course?.sequenceSources)throw new Error('Missing verified chelation sequence sources.');
 if(course?.sequenceSources){const assembled=buildSequence(path.join(root,folder),key,course);run.xyz=assembled.xyz;run.energy=assembled.energy;run.warnings.push(...assembled.warnings);run.files.push(...assembled.files.map(file=>({name:path.basename(file.relative),path:path.posix.normalize(`${folder}/${file.relative}`),kind:file.kind})));}
 if(['proton_shared_10ps','dimero_xtb2_5ps','etanol_nve_5ps'].includes(key))for(const file of [`${key}-md-ener.csv`,`${key}-traj.xyz`,'curso.json']){
  if(!fs.existsSync(path.join(root,folder,file)))throw new Error(`Missing verified extended source: ${folder}/${file}`);
 }
 const files=course?.sequenceSources?[]:[`${key}.out`,`${key}-md-ener.csv`,`${key}-traj.xyz`,`${key}-colvars.csv`];
 if(['zn_solvator','zn_solvator_2aguas'].includes(key))files.push(`${key}.solvator.xyz`);
 if(key==='preparar_complexo')files.push('preparar_complexo.xyz');
 for(const file of files){const rel=`${folder}/${file}`,full=path.join(root,rel);if(!fs.existsSync(full))continue;
  const parsed=R.parseFile(fs.readFileSync(full,'utf8'),file),slot=parsed.kind==='energy'?'energy':parsed.kind;
  // Comments remain in the original linked XYZ, not duplicated in every bundled frame.
  if(parsed.frames){
   parsed.frames.forEach(f=>delete f.comment);
   // Keep motion-critical wall comparisons complete. Thinning their frames
   // makes the contraction and water response visibly step between samples.
   // Keep the small ethanol molecule complete so geometric extrema and the
   // fast O-H vibration are not aliased by the teaching reference preview.
   const completeWall=key.startsWith('zn_cell_')||/^zn_(?:sem_)?parede(?:_longo)?$/.test(key);
   const stride=completeWall||['proton_shared_10ps','proton_shared','dimero_xtb2_5ps','etanol_nve_5ps','etanol_etapas','dimero_xtb2_2ps','al_agua_nh3_dt05','al_agua_nh3_scc'].includes(key)?1:Math.ceil(parsed.frames.length/1001);
   if(stride>1){const all=parsed.frames;parsed.previewStride=stride;parsed.originalFrameCount=all.length;parsed.frames=all.filter((f,i)=>i%stride===0||i===all.length-1);parsed.warnings.push(`Prévia da referência: 1 a cada ${stride} quadros, mais o último. Baixe/carregue o XYZ original para examinar todos. Tempos e coordenadas preservados, sem interpolação.`);}
  }
  run[slot]=parsed;run.files.push({name:file,path:rel,kind:parsed.kind});
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
const presets={
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
// Ordinary scripts, rather than fetch(), preserve direct file:// use offline.
// The small manifest is loaded at startup; calculations are loaded on demand.
const version='20261006-playback2',sources={},folder=path.join(root,'visualizador/examples');
fs.mkdirSync(folder,{recursive:true});let totalBytes=0;
for(const [key,run] of Object.entries(runs)){
 const filename=`${key}.js`,full=path.join(folder,filename);
 fs.writeFileSync(full,'/* Retained ORCA result; generated by scripts/build_viewer_examples.cjs. */\nwindow.AIMD_EXAMPLES.runs['+JSON.stringify(key)+'] = '+JSON.stringify(run)+';\n');
 sources[key]={label:run.label,src:`examples/${filename}?v=${version}`};totalBytes+=fs.statSync(full).size;
}
const manifest=path.join(root,'visualizador/examples.js');
fs.writeFileSync(manifest,'/* Real ORCA workshop results; generated by scripts/build_viewer_examples.cjs. */\nwindow.AIMD_EXAMPLES = '+JSON.stringify({version,presets,sources,runs:{}})+';\n');
console.log(`Offline examples: ${Object.keys(runs).length} calculations loaded on demand, ${fs.statSync(manifest).size} startup bytes, ${totalBytes} data bytes.`);
