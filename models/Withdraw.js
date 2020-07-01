const mongoose = require("mongoose");
const WithdrawSchema = new mongoose.Schema({
  amount: Number,
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
    type: Boolean,
    default: false,
  },
  adminincome: Number,
});

module.exports = mongoose.model("Withdraw", WithdrawSchema);
