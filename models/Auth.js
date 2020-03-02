const mongoose = require("mongoose");
const AuthSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  level: String,
  register: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Boolean,
    default: true
  },
  Auth: {
    type: mongoose.Schema.ObjectId,
    ref: "Auth"
  }
});

module.exports = mongoose.model("Auth", AuthSchema);
