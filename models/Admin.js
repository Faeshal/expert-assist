const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: String,
  desc: String,
  content: String,
  image: String,
  date: {
    type: String,
    default: Date.now
  },
  status: {
    type: Boolean,
    default: true
  }
});

const AdminSchema = new mongoose.Schema({
  email: String,
  password: String,
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
  phone: String,
  blog: [BlogSchema]
});
module.exports = mongoose.model("Admin", AdminSchema);
