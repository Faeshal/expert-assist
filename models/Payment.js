const mongoose = require("mongoose");
const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
  },
  duration: Number,
  total: Number,
  datetime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
