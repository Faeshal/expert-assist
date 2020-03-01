const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
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
  }
});

module.exports = mongoose.model("User", UserSchema);
