import { CATALOG, createExercise, normalizeName, suggest } from './workoutData.js';
export { MUSCLE_GROUPS } from '../shared/trainingPlan.js';

export function recommendExercises(groups, history = []) {
  const candidates = CATALOG.filter(ex => groups.includes(ex.group)).sort((a,b)=>(a.isolation?1:0)-(b.isolation?1:0));
  const chosen = [];
  // First cover every selected group, then add variety up to six exercises.
  for (const group of groups) {
    const candidate = candidates.find(ex => ex.group === group);
    if (candidate) chosen.push(candidate);
  }
  for (const group of groups) {
    if (chosen.length >= Math.max(6, groups.length)) break;
    const candidate = candidates.find(ex => ex.group === group && !chosen.includes(ex));
    if (candidate) chosen.push(candidate);
  }
  return chosen.sort((a,b) => (a.isolation ? 1 : 0) - (b.isolation ? 1 : 0)).map(meta => {
    const exercise = createExercise(meta.name);
    const previous = [...history].sort((a,b)=>new Date(b.date)-new Date(a.date)).flatMap(w=>w.exercises || []).find(ex=>normalizeName(ex.name)===normalizeName(meta.name) && ex.equipment===meta.equipment && Boolean(ex.unilateral)===meta.unilateral);
    const recommendation = previous && suggest(exercise,previous);
    return recommendation ? {...exercise,series:recommendation.series} : exercise;
  });
}

export function transitionSeries(exercises, exerciseIndex, setIndex, now=Date.now()) {
  const set = exercises[exerciseIndex]?.series[setIndex];
  if (!set || set.completed) return exercises;
  if (!set.startedAt && exercises.some(ex=>ex.series.some(s=>s.startedAt && !s.completed))) return exercises;
  if (set.weight === '' || !Number.isFinite(Number(set.weight)) || Number(set.weight)<0 || !Number.isInteger(Number(set.reps)) || Number(set.reps)<1) return exercises;
  return exercises.map((ex,i)=>i!==exerciseIndex ? ex : {...ex, series:ex.series.map((s,j)=>j!==setIndex ? s : s.startedAt ? {...s,completed:true,finishedAt:now} : {...s,startedAt:now})});
}
