require("dotenv").config();
const Xendit = require("xendit-node");

const x = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
});

module.exports = x;
