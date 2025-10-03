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