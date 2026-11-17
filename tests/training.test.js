import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePlan, MUSCLE_GROUPS } from '../shared/trainingPlan.js';
import { recommendExercises, transitionSeries } from '../src/training.js';
import { CATALOG, createExercise, REFERENCE, seriesOf } from '../src/workoutData.js';
import User from '../backend/models/userModel.js';
import WorkoutLog from '../backend/models/workoutLogModel.js';

test('four-day mixed-group plan survives schema serialization',()=>{
  const plan=validatePlan([{day:1,groups:['Espalda','Bíceps']},{day:2,groups:['Pecho','Tríceps']},{day:4,groups:['Piernas','Hombros']},{day:5,groups:['Glúteos','Abdominales']}]);
  const user=new User({name:'Test',email:'test@example.com',password:'test',trainingPlan:plan});
  assert.equal(user.validateSync(),undefined);
  assert.deepEqual(user.toObject().trainingPlan,plan);
});
test('old template plans still validate; invalid plans are rejected rather than silently dropped',()=>{
  assert.deepEqual(validatePlan([{day:1,template:'507f1f77bcf86cd799439011'}]),[{day:1,template:'507f1f77bcf86cd799439011',groups:[]}]);
  assert.deepEqual(validatePlan([]),[]);
  for(const plan of [null,[{day:7,groups:['Pecho']}],[{day:1,groups:['Pecho']},{day:1,groups:['Espalda']}],[{day:1,groups:[]}],[{day:1,groups:['desconocido']}],[{day:1,template:'local-1'}]]) assert.throws(()=>validatePlan(plan));
});
test('catalog is unique and every selected muscle group is covered',()=>{
  assert.equal(new Set(CATALOG.map(ex=>ex.name)).size,CATALOG.length);
  assert.ok(CATALOG.length>70);
  for(const group of MUSCLE_GROUPS) {
    const sequence=recommendExercises([group]);
    assert.ok(sequence.length>=2);
    assert.ok(sequence.every(ex=>CATALOG.find(meta=>meta.name===ex.name).group===group));
  }
  const sequence=recommendExercises(['Espalda','Bíceps']);
  assert.equal(new Set(sequence.map(ex=>ex.name)).size,sequence.length);
  assert.ok(sequence.some(ex=>CATALOG.find(meta=>meta.name===ex.name).group==='Espalda'));
  assert.ok(sequence.some(ex=>CATALOG.find(meta=>meta.name===ex.name).group==='Bíceps'));
  assert.equal(CATALOG.find(meta=>meta.name===sequence[0].name).isolation,false);
});
test('previous successful load is reused without increasing a failed pyramid',()=>{
  const sequence=recommendExercises(['Bíceps'],[{date:'2026-11-16',exercises:[REFERENCE.at(-1)]}]);
  assert.deepEqual(sequence.find(ex=>ex.name==='Curl polea baja').series.map(s=>s.weight),[45,45,45]);
});
test('series start, finish, and stay finished; only one may run at a time',()=>{
  const exercise=createExercise('Jalón al pecho');
  exercise.series.forEach(s=>{s.weight=45;});
  let session=[exercise];
  session=transitionSeries(session,0,0,1000);
  assert.equal(session[0].series[0].startedAt,1000);
  assert.equal(session[0].series[0].completed,false);
  assert.equal(transitionSeries(session,0,1,2000),session);
  session=transitionSeries(session,0,0,3000);
  assert.equal(session[0].series[0].finishedAt,3000);
  assert.equal(session[0].series[0].completed,true);
  assert.equal(transitionSeries(session,0,0,4000),session);
  assert.equal(transitionSeries(session,0,1,4000)[0].series[1].startedAt,4000);
});
test('empty and negative weights cannot start a series; zero bodyweight can',()=>{
  const session=[createExercise('Flexiones')];
  assert.equal(transitionSeries(session,0,0,1000),session);
  session[0].series[0].weight=-1;
  assert.equal(transitionSeries(session,0,0,1000),session);
  session[0].series[0].weight=0;
  assert.equal(transitionSeries(session,0,0,1000)[0].series[0].startedAt,1000);
});
test('workout schema keeps set timings and arbitrary muscle-group combinations',()=>{
  const workout=new WorkoutLog({user:'507f1f77bcf86cd799439011',name:'Pecho + Hombros',duration:30,muscleGroups:['Pecho','Hombros'],exercises:[{name:'Press banca',equipment:'barbell',sets:1,reps:12,weight:40,series:[{weight:40,reps:12,completed:true,startedAt:1000,finishedAt:3000}]}]});
  assert.equal(workout.validateSync(),undefined);
  assert.equal(workout.exercises[0].series[0].startedAt.getTime(),1000);
  assert.deepEqual([...workout.muscleGroups],['Pecho','Hombros']);
  assert.equal(seriesOf({sets:3,reps:10,weight:20}).length,3);
});
