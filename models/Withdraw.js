const mongoose = require("mongoose");
const WithdrawSchema = new mongoose.Schema({
  initialincome: Number,
  total: Number,
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
  },
  note: String,
  datetime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "false",
  },
  adminincome: Number,
  mentorincome: Number,
});

module.exports = mongoose.model("Withdraw", WithdrawSchema);
