const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const cors = require("cors");
const csrf = require("csurf");
const frontRoutes = require("./routes/front");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const mentorRoutes = require("./routes/mentor");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const path = require("path");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const flash = require("connect-flash");
const chalk = require("chalk");
const morgan = require("morgan");
require("pretty-error").start();

// * Security
app.use(helmet());
app.use(mongoSanitize());
app.use(cors());

// * Static Files
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// ** Template
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("views", "views");

// ** Loger
app.use(morgan("dev"));

// ** Body Parser
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// * Session & Cookie
const store = new MongoDBStore({
  uri: "mongodb://localhost:27017/exas",
});

const csrfProtection = csrf();

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

// * Security for CSRF Attack
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// * Routing
app.use(frontRoutes);
app.use(authRoutes);
app.use(adminRoutes);
app.use(userRoutes);
app.use(mentorRoutes);

app.get("*", (req, res, next) => {
  res.status(404).render("layouts/404");
});

// * Database Connection
mongoose.connect("mongodb://localhost:27017/exas", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

mongoose.connection.on("connected", function () {
  console.log(chalk.blueBright("MongoDB connected"));
});

mongoose.connection.on("error", function (err) {
  console.log(chalk.redBright("MongoDB connection error: " + err));
});

// * Server Listen
app.listen(PORT, (err) => {
  if (err) {
    console.log(chalk.red.inverse(`Error occured : ${err}`));
  } else {
    console.log(chalk.black.bgGreen(`Server is Running On Port : ${PORT}`));
  }
});
