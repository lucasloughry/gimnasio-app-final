export const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps', 'Glúteos', 'Gemelos', 'Abdominales'];

// Both the browser and API validate the same structure. Existing template plans remain valid.
export function validatePlan(plan) {
  if (!Array.isArray(plan) || plan.length > 7) throw new Error('Elegí entre 0 y 7 días de entrenamiento.');
  const days = new Set();
  return plan.map(item => {
    if (!item || !Number.isInteger(item.day) || item.day < 0 || item.day > 6 || days.has(item.day)) throw new Error('Los días de la semana deben ser válidos y no repetirse.');
    days.add(item.day);
    if (Array.isArray(item.groups) && item.groups.length) {
      if (item.groups.some(group => !MUSCLE_GROUPS.includes(group)) || new Set(item.groups).size !== item.groups.length) throw new Error('Revisá los grupos musculares elegidos.');
      return {day: item.day, groups: [...item.groups]};
    }
    const template = item.template?._id || item.template;
    if (typeof template !== 'string' || !/^[a-f\d]{24}$/i.test(template)) throw new Error('Elegí al menos un grupo muscular o una rutina válida para cada día.');
    return {day: item.day, template, groups: []};
  });
}
