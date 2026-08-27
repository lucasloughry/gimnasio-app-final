import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor, añade un nombre'],
    },
    email: {
      type: String,
      required: [true, 'Por favor, añade un email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Por favor, añade una contraseña'],
    },
    role: {
      type: String,
      required: true,
      default: 'user',
    },  
    profilePicture: {
      type: String,
      default: '', // Por defecto no tendrán foto
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    trainingPlan: [
      {
        _id: false,
        day: { type: Number, min: 0, max: 6, required: true },
        template: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutTemplate', required: true },
      },
    ],
  
  },
  {
    timestamps: true,
  }
);

// The change is on this line
const User = mongoose.model('User', userSchema);
export default User;
