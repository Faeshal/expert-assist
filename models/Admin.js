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

const CategorySchema = new mongoose.Schema({
  name: String,
  testlink: String,
  date: {
    type: String,
    default: Date.now
  }
});

const FaqSchema = new mongoose.Schema({
  question: String,
  answer: String,
  date: {
    type: String,
    default: Date.now
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
  blog: [BlogSchema],
  category: [CategorySchema],
  faq: [FaqSchema]
});

module.exports = mongoose.model("Admin", AdminSchema);
