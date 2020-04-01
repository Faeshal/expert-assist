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
    type: String,
    default: "true"
  },
  profilepicture: {
    type: String,
    default: "images/default_avatar.png"
  },
  job: String,
  bio: String,
  city: String,
  phone: String,
  twitter: String,
  github: String,
  linkedin: String,
  resetToken: String,
  resetTokenExpiration: Date
});

module.exports = mongoose.model("User", UserSchema);
