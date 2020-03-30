const mongoose = require("mongoose");
const WithdrawSchema = new mongoose.Schema({
  initialincome: Number,
  total: Number,
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor"
  },
  note: String,
  datetime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Boolean,
    default: false
  },
  adminincome: Number,
  mentorincome: Number,
  adminincome: Number
});

module.exports = mongoose.model("Withdraw", WithdrawSchema);
