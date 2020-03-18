const mongoose = require("mongoose");
const MentorSchema = new mongoose.Schema({
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
  profilepicture: String,
  coverpicture: String,
  bio: String,
  price: String,
  address: String,
  phone: String,
  twitter: String,
  github: String,
  linkedin: String,
  job: String,
  expertise: String,
  desc: String,
  cv: String,
  sertifikat: String,
  skill: String,
  experience: String,
  portofolio: String,
  resetToken: String,
  resetTokenExpiration: Date,
  feedback: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback"
    }
  ],
  exam_take: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: false
  },
  register: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Mentor", MentorSchema);
