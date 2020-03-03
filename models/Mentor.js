const mongoose = require("mongoose");
const MentorSchema = new mongoose.Schema({});

module.exports = mongoose.model("mentor", MentorSchema);
