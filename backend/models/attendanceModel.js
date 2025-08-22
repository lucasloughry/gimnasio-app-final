import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  checkinTime: {
    type: Date,
    default: Date.now,
  },
});

// The change is on these two lines
const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;