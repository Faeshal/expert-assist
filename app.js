const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const PORT = process.env.PORT || 3000;
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const colors = require("colors");
const morgan = require("morgan");
const authRoutes = require("./routes/auth");

// * Security
app.use(helmet());
app.use(mongoSanitize());
app.use(cors());

// * Static Files
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

// * Templating Engine
app.set("view engine", "ejs");
app.set("views", "views");

// *Routing
app.get("/", (req, res, next) => {
  res.render("index");
});

app.get("/login", (req, res, next) => {
  res.render("login");
});

app.get("/resetPassword", (req, res, next) => {
  res.render("resetPassword");
});

app.use(authRoutes);

// * Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// * Server Listen
app.listen(PORT, () => {
  console.log(`Server is Running On Port : ${PORT}`.green.bold);
});
