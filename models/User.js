const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  username: String,
  profilepicture: String,
  job: {
    type: String,
    default: "."
  },
  bio: String,
  address: String,
  phone: String,
  twitter: String,
  github: String,
  linkedin: String,
  register: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Boolean,
    default: true
  },
  auth: {
    type: mongoose.Schema.ObjectId,
    ref: "Auth"
  }
});

module.exports = mongoose.model("User", UserSchema);
