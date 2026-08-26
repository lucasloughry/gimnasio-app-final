import mongoose from 'mongoose';

const workoutTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ej: "Tren Inferior"
    },
    category: {
      type: String,
      required: true, // Ej: "Día 1", "Pecho y Tríceps"
    },
    exercises: [
      {
        name: {
          type: String,
          required: true,
        },
        sets: {
          type: Number,
          default: 3,
          min: 1,
        },
        reps: {
          type: Number,
          default: 10,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const WorkoutTemplate = mongoose.model('WorkoutTemplate', workoutTemplateSchema);
export default WorkoutTemplate;
