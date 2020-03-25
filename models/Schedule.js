const mongoose = require("mongoose");
const ScheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor"
  },
  datetime: {
    type: Date,
    default: Date.now
  },
  note: String,
  approve: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
