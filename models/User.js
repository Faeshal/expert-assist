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
  username: String,
  level: String,
  register: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Boolean,
    default: true
  },
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
  linkedin: String
});

module.exports = mongoose.model("User", UserSchema);
