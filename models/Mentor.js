const mongoose = require("mongoose");
const MentorSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  username: String,
  level: String,
  profilepicture: String,
  coverpicture: String,
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
  cv: String,
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
    type: String,
    default: "false",
  },
  mentorstatus: {
    type: String,
    default: "false",
  },
  register: {
    type: Date,
    default: Date.now,
  },
  bankcode: String,
  bankaccountnumber: Number,
  bankaccountusername: String,
  videocallroom: String,
});

module.exports = mongoose.model("Mentor", MentorSchema);
