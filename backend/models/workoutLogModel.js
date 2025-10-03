import mongoose from 'mongoose';

const exerciseLogSchema = new mongoose.Schema({
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
      ref: 'User', // Referencia al usuario que hizo el entrenamiento
    },
    date: {
      type: Date,
      default: Date.now, // La fecha se guarda automáticamente
    },
    name: {
      type: String,
      required: true, // Ej: "Día 1: Tren Inferior"
    },
    exercises: [exerciseLogSchema], // Una lista de ejercicios
  },
  {
    timestamps: true,
  }
);

const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);
export default WorkoutLog;