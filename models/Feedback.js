const mongoose = require("mongoose");
const FeedbackSchema = new mongoose.Schema({
  feedback: String,
  rating: String,
  datetime: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor"
  }
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
