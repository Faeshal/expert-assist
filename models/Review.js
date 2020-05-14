const mongoose = require("mongoose");
const ReviewSchema = new mongoose.Schema({
  content: String,
  rating: Number,
  datetime: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
  },
});

module.exports = mongoose.model("Review", ReviewSchema);
