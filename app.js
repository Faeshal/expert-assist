const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
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

// * Security
app.use(helmet());
app.use(mongoSanitize());
app.use(cors());

// * Static Files
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

// * Session & Cookie
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions"
});

const csrfProtection = csrf();

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
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

// * Templating Engine
app.set("view engine", "ejs");
app.set("views", "views");

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
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

mongoose.connection.on("connected", function() {
  console.log(
    chalk.blueBright("MongoDB connected to " + process.env.MONGO_URI)
  );
});

mongoose.connection.on("error", function(err) {
  console.log(chalk.redBright("MongoDB connection error: " + err));
});

// * Server Listen
app.listen(PORT, () => {
  console.log(chalk.black.bgGreen(`Server is Running On Port : ${PORT}`));
});
