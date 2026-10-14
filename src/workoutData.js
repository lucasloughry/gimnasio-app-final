export const GROUPS = ['Espalda + bíceps', 'Pecho + tríceps', 'Piernas + hombros', 'Full body'];
export const EQUIPMENT = { machine: 'Máquina / polea: peso indicado', barbell: 'Barra: discos totales, sin barra', dumbbell: 'Mancuernas: peso de una mancuerna', bodyweight: 'Peso corporal: carga adicional' };
const rows = [
  ['Jalón al pecho','Espalda','machine'], ['Remo sentado','Espalda','machine'], ['Serrucho','Espalda','dumbbell',true], ['Face pull','Hombros','machine'], ['Curl polea baja','Bíceps','machine'],
  ['Dominadas','Espalda','bodyweight'], ['Remo con barra','Espalda','barbell'], ['Pullover en polea','Espalda','machine'], ['Press de pecho en máquina','Pecho','machine'], ['Press banca','Pecho','barbell'], ['Press inclinado con mancuernas','Pecho','dumbbell'], ['Aperturas con mancuernas','Pecho','dumbbell'], ['Cruces en polea','Pecho','machine'], ['Flexiones','Pecho','bodyweight'], ['Extensión de tríceps en polea','Tríceps','machine'], ['Extensión de tríceps sobre cabeza','Tríceps','dumbbell'], ['Fondos','Tríceps','bodyweight'], ['Curl con barra','Bíceps','barbell'], ['Curl alternado','Bíceps','dumbbell',true], ['Curl martillo','Bíceps','dumbbell'], ['Sentadilla con barra','Piernas','barbell'], ['Prensa','Piernas','machine'], ['Extensión de cuádriceps','Piernas','machine'], ['Curl femoral','Piernas','machine'], ['Peso muerto rumano','Piernas','barbell'], ['Hip thrust','Piernas','barbell'], ['Zancadas','Piernas','dumbbell',true], ['Sentadilla búlgara','Piernas','dumbbell',true], ['Elevación de gemelos','Piernas','machine'], ['Press de hombros en máquina','Hombros','machine'], ['Press militar','Hombros','barbell'], ['Elevaciones laterales','Hombros','dumbbell'], ['Pájaros','Hombros','dumbbell'], ['Crunch en polea','Abdominales','machine'], ['Elevación de piernas','Abdominales','bodyweight']
];
export const CATALOG = rows.map(([name,group,equipment,unilateral=false]) => ({name,group,equipment,unilateral}));
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
