const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: String,
  desc: String,
  content: String,
  image: String,
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

const CategorySchema = new mongoose.Schema({
  name: String,
  testlink: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const FaqSchema = new mongoose.Schema({
  question: String,
  answer: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: String,
  level: String,
  income: Number,
  register: {
    type: Date,
    default: Date.now,
  },
  phone: String,
  publicemail: String,
  blog: [BlogSchema],
  category: [CategorySchema],
  faq: [FaqSchema],
});

module.exports = mongoose.model("Admin", AdminSchema);
