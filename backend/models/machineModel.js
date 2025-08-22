import mongoose from 'mongoose';

const machineSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: { type: String },
  exercises: [
    {
      name: String,
      gifUrl: String,
    },
  ],
});

// The change is on this line
const Machine = mongoose.model('Machine', machineSchema);
export default Machine;