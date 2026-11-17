export const GROUPS = ['Espalda + bíceps', 'Pecho + tríceps', 'Piernas + hombros', 'Full body'];
export const EQUIPMENT = { machine: 'Máquina / polea: peso indicado', barbell: 'Barra: discos totales, sin barra', dumbbell: 'Mancuernas: peso de una mancuerna', bodyweight: 'Peso corporal: carga adicional' };
const rows = [
  ['Jalón al pecho','Espalda','machine'], ['Remo sentado','Espalda','machine'], ['Serrucho','Espalda','dumbbell',true], ['Face pull','Hombros','machine'], ['Curl polea baja','Bíceps','machine'],
  ['Dominadas','Espalda','bodyweight'], ['Remo con barra','Espalda','barbell'], ['Pullover en polea','Espalda','machine'], ['Press de pecho en máquina','Pecho','machine'], ['Press banca','Pecho','barbell'], ['Press inclinado con mancuernas','Pecho','dumbbell'], ['Aperturas con mancuernas','Pecho','dumbbell'], ['Cruces en polea','Pecho','machine'], ['Flexiones','Pecho','bodyweight'], ['Extensión de tríceps en polea','Tríceps','machine'], ['Extensión de tríceps sobre cabeza','Tríceps','dumbbell'], ['Fondos','Tríceps','bodyweight'], ['Curl con barra','Bíceps','barbell'], ['Curl alternado','Bíceps','dumbbell',true], ['Curl martillo','Bíceps','dumbbell'], ['Sentadilla con barra','Piernas','barbell'], ['Prensa','Piernas','machine'], ['Extensión de cuádriceps','Piernas','machine'], ['Curl femoral','Piernas','machine'], ['Peso muerto rumano','Piernas','barbell'], ['Hip thrust','Piernas','barbell'], ['Zancadas','Piernas','dumbbell',true], ['Sentadilla búlgara','Piernas','dumbbell',true], ['Elevación de gemelos','Piernas','machine'], ['Press de hombros en máquina','Hombros','machine'], ['Press militar','Hombros','barbell'], ['Elevaciones laterales','Hombros','dumbbell'], ['Pájaros','Hombros','dumbbell'], ['Crunch en polea','Abdominales','machine'], ['Elevación de piernas','Abdominales','bodyweight']
];
rows.push(
  ['Sentadilla sin carga','Piernas','bodyweight'],
  ['Press inclinado con barra','Pecho','barbell'], ['Press plano con mancuernas','Pecho','dumbbell'], ['Press declinado en máquina','Pecho','machine'], ['Pec deck','Pecho','machine'], ['Press unilateral en polea','Pecho','machine',true],
  ['Remo con pecho apoyado','Espalda','dumbbell'], ['Remo en máquina','Espalda','machine'], ['Jalón agarre neutro','Espalda','machine'], ['Jalón unilateral','Espalda','machine',true], ['Dominadas asistidas','Espalda','machine'], ['Remo unilateral en polea','Espalda','machine',true],
  ['Sentadilla goblet','Piernas','dumbbell'], ['Sentadilla hack','Piernas','machine'], ['Prensa unilateral','Piernas','machine',true], ['Curl femoral sentado','Piernas','machine'], ['Curl femoral unilateral','Piernas','machine',true], ['Extensión unilateral de cuádriceps','Piernas','machine',true], ['Subida al banco','Piernas','dumbbell',true], ['Sentadilla en multipower','Piernas','barbell'],
  ['Puente de glúteos','Glúteos','bodyweight'], ['Hip thrust en máquina','Glúteos','machine'], ['Patada de glúteo en polea','Glúteos','machine',true], ['Abducción de cadera en máquina','Glúteos','machine'], ['Puente unilateral','Glúteos','bodyweight',true],
  ['Gemelos sentado','Gemelos','machine'], ['Gemelos en prensa','Gemelos','machine'], ['Gemelos unilateral con mancuerna','Gemelos','dumbbell',true],
  ['Press de hombros con mancuernas','Hombros','dumbbell'], ['Elevaciones laterales en polea','Hombros','machine',true], ['Reverse pec deck','Hombros','machine'], ['Elevaciones frontales','Hombros','dumbbell'],
  ['Curl predicador','Bíceps','machine'], ['Curl inclinado con mancuernas','Bíceps','dumbbell'], ['Curl concentrado','Bíceps','dumbbell',true], ['Curl unilateral en polea','Bíceps','machine',true],
  ['Extensión de tríceps con cuerda','Tríceps','machine'], ['Extensión unilateral de tríceps','Tríceps','machine',true], ['Press francés con barra','Tríceps','barbell'], ['Press banca agarre cerrado','Tríceps','barbell'],
  ['Crunch abdominal','Abdominales','bodyweight'], ['Crunch en máquina','Abdominales','machine'], ['Crunch inverso','Abdominales','bodyweight'], ['Pallof press','Abdominales','machine',true]
);
const isolationPattern = /curl|extensi|apertura|cruce|pec deck|face pull|pullover|elevaci|pájaro|gemelo|crunch|pallof|patada|abducci/i;
export const CATALOG = rows.map(([name,group,equipment,unilateral=false]) => ({name,group:name==='Hip thrust'?'Glúteos':name==='Elevación de gemelos'?'Gemelos':group,equipment,unilateral,isolation:isolationPattern.test(name)}));
export const normalizeName = name => name.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export function seriesOf(ex) {
  return ex.series?.length ? ex.series : Array.from({length: Number(ex.sets)||0}, () => ({weight:ex.weight,reps:ex.reps}));
}
export function createExercise(name='', count=3, reps=12) {
  const meta = CATALOG.find(ex => normalizeName(ex.name) === normalizeName(name));
  return {name, equipment:meta?.equipment || 'machine', unilateral:meta?.unilateral || false, series:Array.from({length:Math.min(20,Number(count)||3)},()=>({weight:'',reps,effort:'',rir:'',notes:'',completed:false}))};
}
export const REFERENCE = [
  ['Jalón al pecho',[[45,12],[50,12],[55,12],[60,12]]], ['Remo sentado',[[50,12],[60,12],[65,12]]], ['Serrucho',[[20,12],[20,12],[20,12]]], ['Face pull',[[50,12],[55,12],[55,12]]], ['Curl polea baja',[[55,8],[45,12],[45,10]]]
].map(([name,sets])=>({...createExercise(name),series:sets.map(([weight,reps])=>({weight,reps,effort:'',rir:'',notes:'',completed:false}))}));
export const ROUTINES = [
  ['Espalda + bíceps',['Jalón al pecho','Remo sentado','Serrucho','Face pull','Curl polea baja']],
  ['Pecho + tríceps',['Press de pecho en máquina','Press inclinado con mancuernas','Cruces en polea','Extensión de tríceps en polea']],
  ['Piernas + hombros',['Prensa','Peso muerto rumano','Curl femoral','Press de hombros en máquina','Elevaciones laterales']],
  ['Full body',['Sentadilla con barra','Press banca','Remo sentado','Press de hombros en máquina']]
].map(([name,names],i)=>({_id:`local-${i}`,name,category:name,exercises:names.map(name=>({name,sets:3,reps:12}))}));
export function suggest(ex, previous) {
  const sets = seriesOf(previous);
  if (!sets.length) return null;
  const target = Number(ex.series?.[0]?.reps) || 12;
  const hard = sets.some(s=>s.effort==='limit' || (s.rir!=='' && s.rir!=null && Number(s.rir)<=1));
  const missed = sets.some(s=>Number(s.reps)<target);
  // Preserve a pyramid; after a missed target use the load that succeeded, rather than the failed peak.
  const successful = sets.filter(s=>Number(s.reps)>=target);
  const fallback = successful.length ? Math.min(...successful.map(s=>Number(s.weight))) : Number(sets.at(-1).weight);
  const easy = sets.every(s=>s.effort==='easy' || (s.rir!=='' && s.rir!=null && Number(s.rir)>=3));
  return {reason:missed ? `Hubo series por debajo de ${target} reps: probá la carga que sí permitió alcanzar el objetivo.` : hard ? 'Hubo series al límite: repetí las cargas antes de subir.' : easy ? `Completaste ${target} reps con margen: podés probar un incremento pequeño disponible.` : 'Repetí las cargas y registrá el esfuerzo antes de decidir un aumento.', series:sets.map(s=>({weight:missed?fallback:Number(s.weight)+(easy&&!hard&&ex.equipment!=='bodyweight'?(ex.equipment==='dumbbell'?1:2.5):0),reps:target,effort:'',rir:'',notes:'',completed:false}))};
}
