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
const colors = require("colors");
const morgan = require("morgan");
const authRoutes = require("./routes/auth");
const Auth = require("./models/Auth");
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions"
});

// * Security
app.use(helmet());
app.use(mongoSanitize());
app.use(cors());

// * Static Files
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

// * Session & Cookie
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  if (!req.session.auth) {
    return next();
  }
  Auth.findById(req.session.auth._id)
    .then(auth => {
      req.auth = auth;
      next();
    })
    .catch(err => console.log(err));
});

// * Templating Engine
app.set("view engine", "ejs");
app.set("views", "views");

// *Routing
app.get("/", (req, res, next) => {
  res.render("index");
});

app.use(authRoutes);

// * Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

// * Server Listen
app.listen(PORT, () => {
  console.log(`Server is Running On Port : ${PORT}`.green.bold);
});
