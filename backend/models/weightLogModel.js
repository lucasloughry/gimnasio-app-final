import mongoose from 'mongoose';

const weightLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Referencia al usuario
    },
    date: {
      type: Date,
      default: Date.now, // La fecha se guarda automáticamente
    },
    weight: {
      type: Number,
      required: true, // El peso en kg
    },
  },
  {
    timestamps: true,
  }
);

const WeightLog = mongoose.model('WeightLog', weightLogSchema);
export default WeightLog;
