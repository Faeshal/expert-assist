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
  username: {
    type: String,
    default: "admin"
  },
  phone: String,
  blog: [BlogSchema],
  auth: {
    type: mongoose.Schema.ObjectId,
    ref: "Auth"
  }
});
module.exports = mongoose.model("Admin", AdminSchema);
