const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const fs = require("fs");
const mongoose = require("mongoose");
require("colors");
const Admin = require("./models/Admin");
const User = require("./models/User");

// Connect Mongodb
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Read file
const admin = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/Admin.json`, "utf-8")
);

const user = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/User.json`, "utf-8")
);

// Import File To MongoDB
const importData = async () => {
  try {
    await Admin.create(admin);
    await User.create(user);
    console.log("Sucessfully Import Data...".green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Destroy data
const deleteData = async () => {
  try {
    await Admin.deleteMany();
    await User.deleteMany();
    console.log("Succesfully Destroy Data ...".red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// For ClI
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
