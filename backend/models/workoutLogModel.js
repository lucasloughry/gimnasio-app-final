import mongoose from 'mongoose';

const setSchema = new mongoose.Schema({
  weight: {type:Number,required:true,min:0}, reps:{type:Number,required:true,min:1,validate:Number.isInteger},
  effort:{type:String,enum:['','easy','hard','limit'],default:''}, rir:{type:Number,min:0,max:10,validate:Number.isInteger},
  notes:{type:String,maxlength:1000}, completed:{type:Boolean,default:false}
}, {_id:false});
const exerciseLogSchema = new mongoose.Schema({
  series: {type:[setSchema],default:undefined},
  equipment:{type:String,enum:['machine','barbell','dumbbell','bodyweight']},
  unilateral:{type:Boolean,default:false},
  name: {
    type: String,
    required: true,
  },
  sets: {
    type: Number,
    required: true,
  },
  reps: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
});

const workoutLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    name: {
      type: String,
      required: true,
    },
    muscleGroup:{type:String,enum:['Espalda + bíceps','Pecho + tríceps','Piernas + hombros','Full body']},
    // --- CAMPO NUEVO ---
    duration: {
      type: Number, // Guardaremos la duración en minutos
      required: true,
    },
    exercises: [exerciseLogSchema],
  },
  {
    timestamps: true,
  }
);

const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);
export default WorkoutLog;