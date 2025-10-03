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
        // Podríamos añadir más campos a futuro, como un GIF sugerido.
      },
    ],
  },
  {
    timestamps: true,
  }
);

const WorkoutTemplate = mongoose.model('WorkoutTemplate', workoutTemplateSchema);
export default WorkoutTemplate;
