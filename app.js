const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const path = require("path");
const PORT = process.env.PORT || 3000;
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const csrf = require("csurf");
const flash = require("connect-flash");
const colors = require("colors");
const morgan = require("morgan");
const multer = require("multer");
const frontRoutes = require("./routes/front");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const mentorRoutes = require("./routes/mentor");
const Admin = require("./models/Admin");
const User = require("./models/User");

// * Security
app.use(helmet());
app.use(mongoSanitize());
app.use(cors());

// * Inisialisasi Multer
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    // cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// * Static Files
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

// * Multer
// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).single(
//     "profilepicture"
//   )
// );

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
    {
      name: "profilepicture",
      maxCount: 1
    },
    {
      name: "coverpicture",
      maxCount: 1
    }
  ])
);

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

// app.use((req, res, next) => {
//   if (!req.session.user) {
//     return next();
//   }
//   User.findById(req.session.user._id)
//     .then(user => {
//       req.user = user;
//       next();
//     })
//     .catch(err => console.log(err));
// });

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

// * Server Listen
app.listen(PORT, () => {
  console.log(`Server is Running On Port : ${PORT}`.black.bgGreen);
});
