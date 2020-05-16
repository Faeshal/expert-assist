const mongoose = require("mongoose");
const MentorSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  title: String,
  username: String,
  level: String,
  profilepicture: {
    type: String,
    default: "images/default_avatar.png",
  },
  coverpicture: {
    type: String,
    default: "images/default_cover.jpg",
  },
  bio: String,
  price: Number,
  city: String,
  phone: String,
  twitter: String,
  github: String,
  linkedin: String,
  job: String,
  expertise: String,
  desc: String,
  skill: String,
  experience: String,
  portofolio: String,
  resetToken: String,
  resetTokenExpiration: Date,
  income: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  examstatus: {
    type: Boolean,
    default: false,
  },
  mentorstatus: {
    type: String,
    default: "false",
  },
  register: {
    type: Date,
    default: Date.now,
  },
  review: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

module.exports = mongoose.model("Mentor", MentorSchema);
