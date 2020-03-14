const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
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
  linkedin: String,
  resetToken: String,
  resetTokenExpiration: Date,
  feedback: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback"
    }
  ]
});

module.exports = mongoose.model("User", UserSchema);
