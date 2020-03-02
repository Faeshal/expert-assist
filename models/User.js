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
  auth: {
    type: mongoose.Schema.ObjectId,
    ref: "Auth"
  }
});

module.exports = mongoose.model("User", UserSchema);
